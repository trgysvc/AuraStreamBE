'use client';

import { useState } from 'react';
import { Wand2, Loader2, Sparkles } from 'lucide-react';
import { batchAutoTagTracks_Action } from '@/app/actions/catalog';

export function CatalogBulkActions() {
    const [loading, setLoading] = useState(false);

    const handleBulkTag = async () => {
        if (!confirm('Are you sure you want to run the AI Auto-Tagger on the ENTIRE catalog? This will overwrite existing vibes/themes with AI predictions.')) {
            return;
        }

        setLoading(true);
        try {
            const res = await batchAutoTagTracks_Action();
            if (res.success) {
                alert(`Success! Processed ${res.results.total} tracks. Updated: ${res.results.updated}, Errors: ${res.results.errors}`);
            }
        } catch (e) {
            console.error(e);
            alert('Bulk Tagging failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleBulkTag}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-6 h-10 md:h-12 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all shadow-xl disabled:opacity-50"
        >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            Bulk AI Tag
        </button>
    );
}
