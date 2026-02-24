'use client';

import { useState } from 'react';
import { batchAutoTagTracks_Action, fixBranding_Action } from '@/app/actions/catalog';
import { ShieldAlert, Loader2, Sparkles, Wand2 } from 'lucide-react';

export function CatalogBulkActions() {
    const [isTagging, setIsTagging] = useState(false);
    const [isBranding, setIsBranding] = useState(false);

    const handleBulkTag = async () => {
        if (!confirm('Are you sure you want to run the AI Auto-Tagger on the ENTIRE catalog? This will overwrite existing vibes/themes with AI predictions.')) {
            return;
        }

        setIsTagging(true);
        try {
            const res = await batchAutoTagTracks_Action();
            if (res.success) {
                alert(`Success! Processed ${res.results.total} tracks. Updated: ${res.results.updated}, Errors: ${res.results.errors}`);
            }
        } catch (e) {
            console.error(e);
            alert('Bulk Tagging failed');
        } finally {
            setIsTagging(false);
        }
    };

    const handleFixBranding = async () => {
        if (!confirm("Migrate all 'turgaysavaci' tracks to 'Sonaraura Studio'? This is for corporate identity.")) return;

        setIsBranding(true);
        try {
            await fixBranding_Action();
            alert(`Branding updated successfully!`);
        } catch (error) {
            console.error(error);
            alert("Failed to update branding.");
        } finally {
            setIsBranding(false);
        }
    };

    return (
        <div className="flex gap-3">
            <button
                onClick={handleFixBranding}
                disabled={isBranding}
                className="flex items-center gap-2 px-6 h-10 md:h-12 bg-white/[0.02] border border-white/5 text-zinc-500 rounded-full font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-indigo-600/10 hover:text-indigo-400 hover:border-indigo-500/20 transition-all disabled:opacity-50"
                title="Migrate old branding to Sonaraura Studio"
            >
                {isBranding ? <Loader2 size={14} className="animate-spin" /> : <ShieldAlert size={14} />}
                Identity Fix
            </button>
            <button
                onClick={handleBulkTag}
                disabled={isTagging}
                className="flex items-center justify-center gap-2 px-6 h-10 md:h-12 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all shadow-xl disabled:opacity-50"
            >
                {isTagging ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                Bulk AI Tag
            </button>
        </div>
    );
}
