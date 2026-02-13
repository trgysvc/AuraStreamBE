'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { getSignedUploadUrl_Action, createTrackRecord_Action } from '@/app/actions/upload';
import { UploadCloud, Music, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/db/client';

interface UploadingFile {
    id: string;
    file: File;
    title: string;
    artist: string;
    bpm: string;
    genre: string;
    lyrics: string;
    coverBlob?: Blob;
    coverUrl?: string; // Preview URL
    status: 'idle' | 'analyzing' | 'uploading' | 'processing' | 'success' | 'error' | 'duplicate';
    progress: number;
    error?: string;
}

export default function BulkUploadPage() {
    const [files, setFiles] = useState<UploadingFile[]>([]);
    const [isGlobalUploading, setIsGlobalUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const supabase = createClient();

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);
            
            // Dynamic import to avoid SSR issues
            const jsmediatags = (await import('jsmediatags')).default;

            for (const f of selectedFiles) {
                const id = Math.random().toString(36).substr(2, 9);
                const baseTitle = f.name.replace(/\.[^/.]+$/, "");
                
                setFiles(prev => [...prev, {
                    id,
                    file: f,
                    title: baseTitle,
                    artist: 'Analyzing...',
                    bpm: '...',
                    genre: '...',
                    lyrics: '',
                    status: 'analyzing',
                    progress: 0
                }]);

                // 1. Duplicate Check
                const { data: existing } = await supabase
                    .from('tracks')
                    .select('id')
                    .eq('title', baseTitle)
                    .maybeSingle();

                if (existing) {
                    updateFileData(id, { status: 'duplicate', error: 'Existing Asset' });
                    continue;
                }

                // 2. Metadata Extraction
                jsmediatags.read(f, {
                    onSuccess: (tag: any) => {
                        const { tags } = tag;
                        let coverBlob = undefined;
                        let coverUrl = undefined;

                        if (tags.picture) {
                            const { data, format } = tags.picture;
                            const byteArray = new Uint8Array(data);
                            coverBlob = new Blob([byteArray], { type: format });
                            coverUrl = URL.createObjectURL(coverBlob);
                        }

                        updateFileData(id, {
                            title: tags.title || baseTitle,
                            artist: tags.artist || 'Sonaraura AI',
                            genre: tags.genre || 'Ambient',
                            bpm: tags.TBPM?.data || tags.bpm || '120',
                            lyrics: tags.lyrics?.lyrics || tags.USLT?.lyrics || '',
                            coverBlob,
                            coverUrl,
                            status: 'idle'
                        });
                    },
                    onError: () => {
                        updateFileData(id, {
                            title: baseTitle,
                            artist: 'Sonaraura AI',
                            genre: 'Ambient',
                            bpm: '120',
                            status: 'idle'
                        });
                    }
                });
            }
        }
    };

    const removeFile = (id: string) => {
        setFiles(prev => prev.filter(f => f.id !== id));
    };

    const updateFileData = (id: string, data: Partial<UploadingFile>) => {
        setFiles(prev => prev.map(f => f.id === id ? { ...f, ...data } : f));
    };

    const processUploads = async () => {
        setIsGlobalUploading(true);
        const pendingFiles = files.filter(f => f.status === 'idle');

        for (const fileObj of pendingFiles) {
            updateFileData(fileObj.id, { status: 'uploading', progress: 5 });

            try {
                // 1. Handle Cover Upload if exists
                let finalCoverUrl = undefined;
                if (fileObj.coverBlob) {
                    const { url: imgUrl, key: imgKey } = await getSignedUploadUrl_Action(fileObj.coverBlob.type, `cover_${fileObj.id}.jpg`, 'covers');
                    await fetch(imgUrl, {
                        method: 'PUT',
                        body: fileObj.coverBlob,
                        headers: { 'Content-Type': fileObj.coverBlob.type }
                    });
                    // Construct public URL or S3 path (depends on CDN config)
                    // For now, let's use a simple pattern or the signed URL (temporary)
                    // Ideally, this should be the CloudFront URL.
                    finalCoverUrl = imgUrl.split('?')[0]; 
                }

                updateFileData(fileObj.id, { progress: 20 });

                // 2. Upload Audio to S3
                const { url: audioUrl, key: audioKey } = await getSignedUploadUrl_Action(fileObj.file.type, fileObj.file.name);
                updateFileData(fileObj.id, { progress: 40 });

                const uploadRes = await fetch(audioUrl, {
                    method: 'PUT',
                    body: fileObj.file,
                    headers: { 'Content-Type': fileObj.file.type },
                });

                if (!uploadRes.ok) throw new Error('S3 Push Failed');
                updateFileData(fileObj.id, { status: 'processing', progress: 80 });

                // 3. Create DB Record
                const formData = new FormData();
                formData.set('title', fileObj.title);
                formData.set('artist', fileObj.artist);
                formData.set('bpm', fileObj.bpm);
                formData.set('genre', fileObj.genre);
                formData.set('lyrics', fileObj.lyrics);
                formData.set('duration', '180'); 
                if (finalCoverUrl) formData.set('cover_url', finalCoverUrl);

                const result = await createTrackRecord_Action(formData, audioKey);

                if (result.success) {
                    updateFileData(fileObj.id, { status: 'success', progress: 100 });
                } else {
                    throw new Error(result.error || 'DB Error');
                }

            } catch (err: any) {
                updateFileData(fileObj.id, { status: 'error', error: err.message });
            }
        }
        setIsGlobalUploading(false);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-20 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
                <div>
                    <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white text-glow">Ingest Engine</h1>
                    <p className="text-zinc-500 font-medium mt-2 text-lg uppercase tracking-tight">Autonomous Cataloging & Metadata Extraction</p>
                </div>
                <div className="flex gap-4">
                    <input type="file" multiple accept="audio/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                    <button onClick={() => fileInputRef.current?.click()} className="px-8 py-4 bg-white/5 border border-white/10 rounded-full text-xs font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-white hover:bg-white/10 transition-all">Select Audio</button>
                    <button onClick={processUploads} disabled={isGlobalUploading || files.length === 0} className="px-10 py-4 bg-indigo-600 text-white rounded-full text-xs font-black uppercase tracking-[0.2em] hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-50 flex items-center gap-3">
                        {isGlobalUploading ? <Loader2 className="animate-spin" size={16} /> : <UploadCloud size={16} />} Start Ingest
                    </button>
                </div>
            </div>

            {files.length === 0 ? (
                <div onClick={() => fileInputRef.current?.click()} className="py-40 border-2 border-dashed border-white/5 bg-[#1E1E22]/30 rounded-[4rem] text-center space-y-8 cursor-pointer hover:bg-[#1E1E22]/50 hover:border-white/10 transition-all group">
                    <div className="h-24 w-24 bg-white/5 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                        <UploadCloud size={48} className="text-zinc-600 group-hover:text-indigo-400 transition-colors" />
                    </div>
                    <div className="space-y-3">
                        <p className="text-white font-black uppercase italic tracking-[0.2em] text-xl">Awaiting Assets</p>
                        <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em]">Audio files will be auto-analyzed upon ingest</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {files.map((fileObj) => (
                        <div key={fileObj.id} className={`bg-[#1E1E22] p-8 rounded-[2rem] border border-white/5 flex flex-col md:flex-row items-center gap-10 group relative transition-all ${fileObj.status === 'duplicate' ? 'opacity-40 grayscale' : ''}`}>
                            <div className="flex items-center gap-8 flex-1 min-w-0">
                                <div className="h-20 w-20 bg-zinc-800 rounded-2xl flex items-center justify-center flex-shrink-0 relative overflow-hidden shadow-2xl border border-white/5">
                                    {fileObj.coverUrl ? (
                                        <img src={fileObj.coverUrl} className="w-full h-full object-cover" alt="" />
                                    ) : (
                                        <Music className="text-zinc-700" size={32} />
                                    )}
                                    {fileObj.status === 'analyzing' && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                            <Loader2 className="animate-spin text-white" size={24} />
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0 flex-1 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black uppercase text-zinc-600 tracking-widest ml-1 italic">Identity</p>
                                            <h4 className="text-lg font-black text-white uppercase truncate tracking-tight">{fileObj.title}</h4>
                                            <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest">{fileObj.artist}</p>
                                        </div>
                                        <div className="flex gap-10">
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-black uppercase text-zinc-600 tracking-widest italic">Specs</p>
                                                <p className="text-sm font-black text-white">{fileObj.bpm} <span className="text-[9px] text-zinc-600">BPM</span></p>
                                                <p className="text-sm font-black text-white uppercase italic">{fileObj.genre}</p>
                                            </div>
                                            <div className="space-y-1 flex-1">
                                                <p className="text-[9px] font-black uppercase text-zinc-600 tracking-widest italic">Health</p>
                                                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden mt-2">
                                                    <div className={`h-full transition-all duration-700 ${fileObj.status === 'success' ? 'bg-green-500' : fileObj.status === 'error' ? 'bg-rose-500' : 'bg-indigo-500'}`} style={{ width: `${fileObj.progress}%` }} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-8 pr-4">
                                {fileObj.status === 'duplicate' ? (
                                    <div className="flex flex-col items-center gap-1">
                                        <AlertCircle className="text-yellow-500/50" size={28} />
                                        <span className="text-[8px] font-black text-yellow-500/50 uppercase tracking-widest">Exists</span>
                                    </div>
                                ) : fileObj.status === 'success' ? (
                                    <CheckCircle2 className="text-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]" size={32} />
                                ) : fileObj.status === 'error' ? (
                                    <div className="group/err relative flex items-center justify-center">
                                        <AlertCircle className="text-rose-500" size={32} />
                                        <div className="absolute right-full mr-4 bg-rose-600 text-white text-[9px] font-black px-3 py-1.5 rounded-lg whitespace-nowrap shadow-2xl">
                                            {fileObj.error}
                                        </div>
                                    </div>
                                ) : (
                                    <button onClick={() => removeFile(fileObj.id)} className="p-4 text-zinc-700 hover:text-white hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-white/5">
                                        <X size={24} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
