'use client';

import { useState, useRef, FormEvent, ChangeEvent } from 'react';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { getSignedUploadUrl_Action, createTrackRecord_Action } from '@/app/actions/upload';
// @ts-ignore
import MusicTempo from 'music-tempo';

export default function UploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error' | 'idle'; message: string }>({ type: 'idle', message: '' });

    // Form State for controlled inputs
    const [title, setTitle] = useState('');
    const [bpm, setBpm] = useState<string>('');

    const formRef = useRef<HTMLFormElement>(null);

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);

            // 1. Auto-Title Logic
            const fileName = selectedFile.name;
            const titleFromFileName = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
            setTitle(titleFromFileName);

            // 2. BPM Detection Logic
            setProcessing(true);
            setStatus({ type: 'idle', message: 'Analyzing audio for BPM...' });

            try {
                const arrayBuffer = await selectedFile.arrayBuffer();
                const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

                // Decode audio data
                const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

                // Detect BPM
                // We need to pass the channel data to MusicTempo
                const channelData = [];
                // MusicTempo expects non-interleaved IEEE754 32-bit linear PCM with a nominal range of -1 to +1
                // logic: just take the first channel if stereo
                if (audioBuffer.numberOfChannels > 0) {
                    channelData.push(audioBuffer.getChannelData(0));
                }

                // If we have data
                if (channelData.length > 0) {
                    const mt = new MusicTempo(channelData[0]);
                    // Check if tempo is valid
                    if (mt.tempo) {
                        const detectedBpm = Math.round(parseFloat(mt.tempo));
                        setBpm(detectedBpm.toString());
                        setStatus({ type: 'success', message: `BPM Detected: ${detectedBpm}` });
                    } else {
                        setStatus({ type: 'idile', message: 'Could not detect BPM automatically.' });
                    }
                }

            } catch (error) {
                console.error("BPM Detection Error:", error);
                setStatus({ type: 'error', message: 'Failed to analyze audio file.' });
            } finally {
                setProcessing(false);
            }
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!file) return;

        // FIX: Capture form data immediately before any await execution to preserve e.currentTarget
        const formData = new FormData(e.currentTarget);

        setUploading(true);
        setStatus({ type: 'idle', message: 'Starting upload...' });

        try {
            // 1. Get Signed URL
            setStatus({ type: 'idle', message: 'Authorizing upload...' });
            const { url, key } = await getSignedUploadUrl_Action(file.type, file.name);

            // 2. Upload to S3 directly
            setStatus({ type: 'idle', message: 'Uploading to S3...' });
            const uploadRes = await fetch(url, {
                method: 'PUT',
                body: file,
                headers: { 'Content-Type': file.type },
            });

            if (!uploadRes.ok) throw new Error('Failed to upload file to S3');

            // 3. Save Metadata to DB
            setStatus({ type: 'idle', message: 'Saving metadata...' });

            // formData is already captured safely
            // Rough duration estimation or getting it from file could be done here. 
            // For MVP, we mock duration if not extracted.
            formData.set('duration', '180');

            // Explicitly set controlled values if FormData missed them (though it shouldn't if inputs have names)
            if (title) formData.set('title', title);
            if (bpm) formData.set('bpm', bpm);

            const result = await createTrackRecord_Action(formData, key);

            if (result.success) {
                setStatus({ type: 'success', message: 'Track uploaded successfully! Ready for QC.' });
                formRef.current?.reset();
                setFile(null);
                setTitle('');
                setBpm('');
            } else {
                setStatus({ type: 'error', message: result.error || 'Database Error' });
            }

        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            setStatus({ type: 'error', message: errorMessage });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Upload New Track</h1>

            <Card>
                <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                    {/* File Drop Zone (Simplified) */}
                    <div className={`border-2 border-dashed ${processing ? 'border-orange-500 bg-orange-50/10' : 'border-gray-300 dark:border-gray-700'} rounded-lg p-8 text-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors`}>
                        <input
                            type="file"
                            accept="audio/*"
                            onChange={handleFileChange}
                            className="hidden"
                            id="audio-upload"
                            disabled={processing || uploading}
                        />
                        <label htmlFor="audio-upload" className={`cursor-pointer block ${processing || uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            <div className="text-4xl mb-2">☁️</div>
                            <span className="text-sm font-medium">Click to select audio file (WAV/FLAC)</span>
                            {file && <p className="mt-2 text-primary font-bold">{file.name}</p>}
                            {processing && <p className="mt-2 text-sm text-orange-500 animate-pulse">Detecting BPM...</p>}
                        </label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            name="title"
                            label="Track Title"
                            placeholder="e.g. Sunset Vibes"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <Input
                            name="bpm"
                            label="BPM"
                            type="number"
                            placeholder="120"
                            required
                            value={bpm}
                            onChange={(e) => setBpm(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Genre</label>
                        <select name="genre" className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700">
                            <option>Cinematic</option>
                            <option>Pop</option>
                            <option>Corporate</option>
                            <option>Lo-Fi</option>
                        </select>
                    </div>

                    {status.message && (
                        <div className={`p-3 rounded text-sm ${status.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {status.message}
                        </div>
                    )}

                    <Button type="submit" disabled={!file || uploading || processing} isLoading={uploading} className="w-full">
                        {uploading ? 'Processing...' : processing ? 'Analyzing...' : 'Upload Track'}
                    </Button>
                </form>
            </Card>
        </div>
    );
}
