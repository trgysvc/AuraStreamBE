'use client';

import { useState, useEffect } from 'react';
import { Link } from '@/i18n/navigation';
import { createClient } from '@/lib/db/client';
import { Database } from '@/types/supabase';
import {
    CheckCircle2,
    AlertCircle,
    Clock,
    MessageSquare,
    Filter,
    Search,
    MoreHorizontal,
    ArrowLeft,
    Monitor,
    Globe,
    ExternalLink,
    User,
    Mail,
    Shield,
    Calendar,
    ChevronRight
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

type Feedback = Database['public']['Tables']['feedbacks']['Row'] & {
    profiles: {
        full_name: string | null;
        email: string | null;
        role: string | null;
    } | null;
};

export default function FeedbackAdminPage() {
    const supabase = createClient();
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'new' | 'in_progress' | 'resolved'>('all');
    const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const fetchFeedbacks = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('feedbacks')
            .select(`
                *,
                profiles (
                    full_name,
                    email,
                    role
                )
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching feedbacks:', error);
        } else {
            setFeedbacks(data as any);
        }
        setLoading(false);
    };

    const updateStatus = async (id: string, newStatus: Feedback['status']) => {
        const { error } = await supabase
            .from('feedbacks')
            .update({ status: newStatus })
            .eq('id', id);

        if (!error) {
            setFeedbacks(feedbacks.map(f => f.id === id ? { ...f, status: newStatus } : f));
            if (selectedFeedback?.id === id) {
                setSelectedFeedback({ ...selectedFeedback, status: newStatus });
            }
        }
    };

    const filteredFeedbacks = feedbacks.filter(f => filter === 'all' || f.status === filter);

    const getSeverityColor = (severity: string | null) => {
        switch (severity) {
            case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
            case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'bug': return '🐞';
            case 'feature': return '💡';
            case 'content': return '🎵';
            case 'billing': return '💳';
            default: return '📝';
        }
    };

    const getStatusLabel = (status: string | null) => {
        switch (status) {
            case 'new': return 'Yeni';
            case 'in_progress': return 'İşleniyor';
            case 'resolved': return 'Çözüldü';
            case 'ignored': return 'Gözardı Edildi';
            default: return status;
        }
    };

    return (
        <div className="p-10 space-y-8 min-h-screen bg-black text-white">
            <div className="max-w-[1400px] mx-auto space-y-8">
                <Link
                    href="/admin"
                    className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors w-fit border border-white/5 px-4 py-2 rounded-xl bg-white/[0.02] group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs font-black uppercase tracking-widest">Admin Paneline Dön</span>
                </Link>

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black italic uppercase tracking-tighter">Feedback Triage</h1>
                        <p className="text-zinc-400 font-medium text-sm">Kullanıcı geri bildirimlerini ve sorunlarını yönetin.</p>
                    </div>
                    <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/5">
                        {['all', 'new', 'in_progress', 'resolved'].map((s) => (
                            <button
                                key={s}
                                onClick={() => setFilter(s as any)}
                                className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ${filter === s
                                    ? 'bg-indigo-600 text-white shadow-lg'
                                    : 'text-zinc-500 hover:text-white'
                                    }`}
                            >
                                {s === 'all' ? 'Tümü' : getStatusLabel(s)}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="text-zinc-500 text-center py-20">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
                        <p className="text-xs font-bold uppercase tracking-widest">Geri Bildirimler Senkronize Ediliyor...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredFeedbacks.map((feedback) => (
                            <div
                                key={feedback.id}
                                onClick={() => setSelectedFeedback(feedback)}
                                className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 hover:border-indigo-500/30 transition-all group cursor-pointer hover:bg-white/[0.02]"
                            >
                                <div className="flex items-start justify-between gap-6">
                                    <div className="space-y-4 flex-1">
                                        <div className="flex items-center gap-3">
                                            <span className="text-3xl">{getCategoryIcon(feedback.category)}</span>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold text-lg text-white group-hover:text-indigo-400 transition-colors">
                                                        {feedback.title}
                                                    </h3>
                                                    {feedback.category === 'bug' && (
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${getSeverityColor(feedback.severity)}`}>
                                                            {feedback.severity}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 mt-1">
                                                    <span className="flex items-center gap-1 text-zinc-400"><User size={12} /> {feedback.profiles?.full_name || 'Anonim'}</span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1"><Calendar size={12} /> {feedback.created_at && formatDistanceToNow(new Date(feedback.created_at), { addSuffix: true, locale: tr })}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <p className="text-zinc-400 text-sm line-clamp-2 italic">
                                            "{feedback.description}"
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${feedback.status === 'new' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                                            feedback.status === 'in_progress' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                                feedback.status === 'resolved' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                    'bg-zinc-800 text-zinc-500 border-zinc-700'
                                            }`}>
                                            {getStatusLabel(feedback.status)}
                                        </div>
                                        <ChevronRight size={20} className="text-zinc-700 group-hover:text-white transition-colors" />
                                    </div>
                                </div>
                            </div>
                        ))}

                        {filteredFeedbacks.length === 0 && (
                            <div className="text-center py-24 text-zinc-500 bg-[#0A0A0A] border border-white/5 rounded-3xl">
                                <MessageSquare size={64} className="mx-auto text-zinc-900 mb-6" />
                                <h4 className="text-xl font-bold text-zinc-400 mb-2">Henüz geri bildirim yok</h4>
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-600">Bu kategori şu an temiz görünüyor.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedFeedback && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setSelectedFeedback(null)} />
                    <div className="relative bg-[#0F0F0F] border border-white/10 rounded-3xl w-full max-w-4xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                        <div className="flex h-[80vh]">
                            {/* Left Side: Content */}
                            <div className="flex-1 p-10 overflow-y-auto space-y-10 border-r border-white/5">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <span className="text-4xl">{getCategoryIcon(selectedFeedback.category)}</span>
                                        <div>
                                            <h2 className="text-3xl font-black uppercase tracking-tighter text-white">{selectedFeedback.title}</h2>
                                            <p className="text-zinc-500 text-sm font-medium">Rapor ID: {selectedFeedback.id}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getSeverityColor(selectedFeedback.severity)}`}>
                                            Önem: {selectedFeedback.severity}
                                        </span>
                                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 bg-white/5 text-white">
                                            Kategori: {selectedFeedback.category}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-500">Açıklama</h4>
                                    <div className="bg-white/5 border border-white/5 p-8 rounded-3xl text-zinc-200 leading-relaxed text-lg italic shadow-inner">
                                        "{selectedFeedback.description}"
                                    </div>
                                </div>

                                {/* Intelligent Context Data */}
                                <div className="space-y-6">
                                    <h4 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-500">Otomatik Toplanan Veriler</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        {Object.entries(selectedFeedback.metadata as any || {}).map(([key, value]) => (
                                            <div key={key} className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-1">
                                                    {key === 'ip_address' ? 'IP Adresi' :
                                                        key === 'userAgent' ? 'Tarayıcı' :
                                                            key === 'screen' ? 'Ekran Çözünürlüğü' :
                                                                key === 'url' ? 'Kaynak URL' : key}
                                                </p>
                                                <p className="text-xs font-mono text-zinc-300 truncate">{JSON.stringify(value).replace(/"/g, '')}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: Sidebar/Actions */}
                            <div className="w-80 p-8 bg-black/50 flex flex-col space-y-8">
                                <div className="space-y-6">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Kullanıcı Bilgisi</h4>
                                    <div className="space-y-4 bg-white/5 p-5 rounded-2xl border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center font-black text-white">
                                                {selectedFeedback.profiles?.full_name?.charAt(0) || 'A'}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-white">{selectedFeedback.profiles?.full_name || 'Anonim'}</span>
                                                <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">{selectedFeedback.profiles?.role || 'User'}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2 pt-2 border-t border-white/5">
                                            <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                                                <Mail size={12} />
                                                <span>{selectedFeedback.profiles?.email || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                                                <Shield size={12} />
                                                <span>ID: {selectedFeedback.user_id?.slice(0, 8)}...</span>
                                            </div>
                                            {(selectedFeedback.metadata as any)?.ip_address && (
                                                <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                                                    <Globe size={12} />
                                                    <span>IP: {(selectedFeedback.metadata as any).ip_address}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Durum Yönetimi</h4>
                                    <div className="space-y-2">
                                        {(['new', 'in_progress', 'resolved', 'ignored'] as const).map(status => (
                                            <button
                                                key={status}
                                                onClick={() => updateStatus(selectedFeedback.id, status)}
                                                className={`w-full px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all border flex items-center justify-between group ${selectedFeedback.status === status
                                                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)]'
                                                    : 'bg-white/5 border-white/5 text-zinc-500 hover:text-white hover:bg-white/10'
                                                    }`}
                                            >
                                                {getStatusLabel(status)}
                                                {selectedFeedback.status === status && <CheckCircle2 size={14} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-auto pt-8 border-t border-white/5 space-y-3">
                                    <button className="w-full h-12 bg-white text-black rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-zinc-200 transition-colors">
                                        E-posta ile Yanıtla
                                    </button>
                                    <button
                                        onClick={() => setSelectedFeedback(null)}
                                        className="w-full h-12 bg-white/5 text-zinc-500 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:text-white hover:bg-white/10 transition-all"
                                    >
                                        Kapat
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
