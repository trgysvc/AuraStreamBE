'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Download } from 'lucide-react';
import Link from 'next/link';

import { getDownloadUrlBySession } from '@/app/actions/download';

function SuccessContent() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        if (sessionId) {
            setStatus('success');
        } else {
            setStatus('error');
        }
    }, [sessionId]);

    const handleDownload = async () => {
        if (!sessionId) return;

        try {
            setDownloading(true);
            const { url } = await getDownloadUrlBySession(sessionId);

            // Trigger download
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', ''); // Browser handles filename from Content-Disposition
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (error) {
            console.error('Download failed:', error);
            alert('Failed to start download. Please try again.');
        } finally {
            setDownloading(false);
        }
    };

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-white">
                <div className="animate-pulse">Verifying payment...</div>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-white">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4 text-red-500">Something went wrong</h1>
                    <Link href="/venue" className="text-white/60 hover:text-white underline">
                        Return to Store
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-md w-full text-center">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                </div>

                <h1 className="text-3xl font-bold text-white mb-2">Payment Successful!</h1>
                <p className="text-white/60 mb-8">
                    Your license has been generated and sent to your email.
                </p>

                <div className="space-y-3">
                    <button
                        onClick={handleDownload}
                        disabled={downloading}
                        className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 text-white font-bold py-3 rounded-xl transition-colors"
                    >
                        {downloading ? (
                            <span className="animate-pulse">Generating Link...</span>
                        ) : (
                            <>
                                <Download className="w-5 h-5" />
                                Download Track
                            </>
                        )}
                    </button>

                    <Link
                        href="/venue"
                        className="block w-full text-white/40 hover:text-white py-2 text-sm transition-colors"
                    >
                        Return to Browse
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-white">
                <div className="animate-pulse">Loading secure session...</div>
            </div>
        }>
            <SuccessContent />
        </Suspense>
    );
}
