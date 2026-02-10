'use client';

import React, { useState, useEffect } from 'react';
import { usePlayer } from '@/context/PlayerContext';
import { generateLicensePDF_Action } from '@/app/actions/license';

export function CreatorLibrary() {
    const [licenses, setLicenses] = useState<any[]>([]);
    const { playTrack } = usePlayer();

    // In a real app, this would be a server component or use SWR/Query
    // For this demonstration, we'll assume licenses are passed or fetched

    const handleDownloadPDF = async (licenseId: string) => {
        try {
            const base64 = await generateLicensePDF_Action(licenseId);
            const link = document.createElement('a');
            link.href = `data:application/pdf;base64,${base64}`;
            link.download = `AuraStream-License-${licenseId.slice(0, 8)}.pdf`;
            link.click();
        } catch (error) {
            console.error('Failed to download PDF:', error);
            alert('License generation failed. Please try again.');
        }
    };

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold">Your Licensed Content</h2>
            <div className="grid grid-cols-1 gap-4">
                {/* Mock UI for demonstration */}
                <div className="bg-slate-800 p-4 rounded-lg flex items-center justify-between">
                    <div>
                        <h4 className="font-bold">Project: YouTube Vlog #42</h4>
                        <p className="text-sm text-slate-400">Track: Midnight Aura</p>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => handleDownloadPDF('mock-id')}
                            className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded text-sm font-bold"
                        >
                            Download License (PDF)
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-8 p-6 bg-slate-900 border border-slate-700 rounded-xl">
                <h3 className="text-lg font-bold mb-2">YouTube Dispute Center</h3>
                <p className="text-sm text-slate-400 mb-4">
                    Got a Content ID claim? Use your Unique Asset ID to dispute it instantly.
                </p>
                <div className="flex gap-4">
                    <div className="flex-1 bg-slate-800 p-3 rounded font-mono text-xs text-orange-400">
                        AS-CERT-X921-KB02
                    </div>
                    <button className="bg-slate-700 px-4 py-2 rounded text-sm hover:bg-slate-600">
                        Copy Dispute Template
                    </button>
                </div>
            </div>
        </div>
    );
}
