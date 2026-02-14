'use client';

import { useState, useEffect } from 'react';
import {
    X,
    Bug,
    Lightbulb,
    Music,
    CreditCard,
    AlertTriangle,
    CheckCircle2,
    Loader2
} from 'lucide-react';
import { submitFeedback } from '@/app/actions/feedback';
import { usePathname } from 'next/navigation';

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type Category = 'bug' | 'feature' | 'content' | 'billing';
type Severity = 'low' | 'medium' | 'high' | 'critical';

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
    const pathname = usePathname();
    const [step, setStep] = useState<'category' | 'details'>('category');
    const [category, setCategory] = useState<Category | null>(null);
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Form Data
    const [description, setDescription] = useState('');
    const [severity, setSeverity] = useState<Severity>('low');
    const [contentIssues, setContentIssues] = useState<string[]>([]);
    const [featurePriority, setFeaturePriority] = useState(3);

    // Auto-collected Metadata
    const [metadata, setMetadata] = useState<any>({});

    useEffect(() => {
        if (isOpen) {
            // Reset state when opening
            setStep('category');
            setCategory(null);
            setStatus('idle');
            setErrorMessage(null);
            setDescription('');
            setSeverity('low');
            setContentIssues([]);
            setFeaturePriority(3);

            // Collect Metadata
            const meta = {
                url: window.location.href,
                pathname: pathname,
                userAgent: navigator.userAgent,
                screen: `${window.screen.width}x${window.screen.height}`,
                language: navigator.language,
                timestamp: new Date().toISOString(),
            };
            setMetadata(meta);
        }
    }, [isOpen, pathname]);

    const handleSubmit = async () => {
        if (!category || !description) return;

        setStatus('submitting');
        setErrorMessage(null);

        const formData = new FormData();
        formData.append('category', category);
        formData.append('description', description);
        formData.append('metadata', JSON.stringify({
            ...metadata,
            contentIssues: category === 'content' ? contentIssues : undefined,
            featurePriority: category === 'feature' ? featurePriority : undefined,
        }));

        if (category === 'bug') {
            formData.append('severity', severity);
            formData.append('title', `Bug Report: ${pathname}`);
        } else if (category === 'feature') {
            formData.append('title', `Feature Request`);
        } else if (category === 'content') {
            formData.append('title', `Content Issue: ${contentIssues.join(', ')}`);
        } else {
            formData.append('title', `Billing Issue`);
        }

        const result = await submitFeedback(formData);

        if (result?.success) {
            setStatus('success');
            setTimeout(() => {
                onClose();
            }, 2000);
        } else {
            setStatus('error');
            setErrorMessage(result?.error || 'Failed to submit feedback. Please try again.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-[#18181b] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">
                        {step === 'category' ? 'Help & Feedback' :
                            category === 'bug' ? 'Report a Bug' :
                                category === 'feature' ? 'Request a Feature' :
                                    category === 'content' ? 'Content Issue' : 'Billing Help'}
                    </h3>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {status === 'success' ? (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
                            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
                                <CheckCircle2 size={32} className="text-green-500" />
                            </div>
                            <h4 className="text-xl font-bold text-white">Thank You!</h4>
                            <p className="text-zinc-400 text-sm">Your feedback has been received. Our team will review it shortly.</p>
                        </div>
                    ) : step === 'category' ? (
                        <div className="grid grid-cols-2 gap-4">
                            <CategoryButton
                                icon={Bug}
                                label="Report Bug"
                                desc="Something's broken"
                                onClick={() => { setCategory('bug'); setStep('details'); }}
                            />
                            <CategoryButton
                                icon={Lightbulb}
                                label="Feature Request"
                                desc="I have an idea"
                                onClick={() => { setCategory('feature'); setStep('details'); }}
                            />
                            <CategoryButton
                                icon={Music}
                                label="Content Issue"
                                desc="Wrong track/tag"
                                onClick={() => { setCategory('content'); setStep('details'); }}
                            />
                            <CategoryButton
                                icon={CreditCard}
                                label="Billing & Plan"
                                desc="Payment issues"
                                onClick={() => { setCategory('billing'); setStep('details'); }}
                            />
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Dynamic Fields */}

                            {category === 'content' && (
                                <div className="space-y-3">
                                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">What's wrong?</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['Wrong BPM', 'Wrong Vibe', 'Bad Audio Quality', 'Wrong Genre'].map(issue => (
                                            <button
                                                key={issue}
                                                onClick={() => {
                                                    if (contentIssues.includes(issue)) {
                                                        setContentIssues(contentIssues.filter(i => i !== issue));
                                                    } else {
                                                        setContentIssues([...contentIssues, issue]);
                                                    }
                                                }}
                                                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${contentIssues.includes(issue)
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                                                    }`}
                                            >
                                                {issue}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {category === 'bug' && (
                                <div className="space-y-3">
                                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Severity</label>
                                    <div className="flex bg-white/5 p-1 rounded-lg">
                                        {(['low', 'medium', 'high', 'critical'] as Severity[]).map(sev => (
                                            <button
                                                key={sev}
                                                onClick={() => setSeverity(sev)}
                                                className={`flex-1 py-1.5 rounded text-xs font-bold capitalize transition-all ${severity === sev
                                                    ? (sev === 'critical' || sev === 'high' ? 'bg-red-500/20 text-red-500' : 'bg-white/10 text-white')
                                                    : 'text-zinc-500 hover:text-zinc-300'
                                                    }`}
                                            >
                                                {sev}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {category === 'feature' && (
                                <div className="space-y-3">
                                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Priority (1-5)</label>
                                    <div className="flex text-2xl gap-2 text-zinc-600">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <button
                                                key={star}
                                                onClick={() => setFeaturePriority(star)}
                                                className={`transition-colors hover:text-indigo-400 ${featurePriority >= star ? 'text-indigo-500' : ''}`}
                                            >
                                                ★
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-3">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                                    {category === 'feature' ? 'Describe your idea' :
                                        category === 'content' ? 'Tell us more detail' :
                                            'Describe the issue'}
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Type here..."
                                    className="w-full h-32 bg-black/50 border border-white/10 rounded-xl p-4 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
                                />
                            </div>

                            {status === 'error' && (
                                <div className="flex items-center gap-2 text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                                    <AlertTriangle size={16} />
                                    <span className="text-xs font-bold">{errorMessage || 'Failed to submit feedback. Please try again.'}</span>
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setStep('category')}
                                    className="px-4 py-3 rounded-xl font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={!description || status === 'submitting'}
                                    className="flex-1 px-4 py-3 bg-indigo-600 rounded-xl font-bold text-white hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {status === 'submitting' && <Loader2 size={16} className="animate-spin" />}
                                    Submit Feedback
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function CategoryButton({ icon: Icon, label, desc, onClick }: { icon: any, label: string, desc: string, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="flex flex-col items-center justify-center gap-3 p-6 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 hover:border-white/20 hover:scale-[1.02] transition-all group text-center"
        >
            <div className="p-3 bg-indigo-500/10 rounded-full group-hover:bg-indigo-500/20 transition-colors">
                <Icon size={24} className="text-indigo-400" />
            </div>
            <div className="space-y-1">
                <div className="font-bold text-white text-sm">{label}</div>
                <div className="text-xs text-zinc-500">{desc}</div>
            </div>
        </button>
    );
}
