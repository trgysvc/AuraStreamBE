'use client';

import { Sparkles, ArrowLeft } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { MusicRequestForm } from '@/components/feature/licensing/MusicRequestForm';
import { useTranslations } from 'next-intl';

export default function MusicRequestPage() {
    const t = useTranslations('MusicRequest');

    const features = [
        t('features.hiFi'),
        t('features.stems'),
        t('features.rights'),
        t('features.biorhythm')
    ];

    return (
        <div className="max-w-[1200px] mx-auto space-y-8 md:space-y-12 pb-24 md:pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="space-y-4 md:space-y-6">
                    <Link 
                        href="/dashboard/venue" 
                        className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-[9px] md:text-[10px] font-black uppercase tracking-widest"
                    >
                        <ArrowLeft size={12} className="md:w-3.5 md:h-3.5" /> {t('backToLibrary')}
                    </Link>
                    <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white leading-none whitespace-pre-line">
                        {t('title')}
                    </h1>
                    <p className="text-base md:text-xl text-zinc-500 font-medium max-w-xl">
                        {t('subtitle')}
                    </p>
                </div>
                
                <div className="p-6 md:p-8 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl md:rounded-3xl space-y-4">
                    <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">{t('premiumService')}</p>
                    <ul className="grid grid-cols-2 md:grid-cols-1 gap-3 md:gap-2">
                        {features.map(feat => (
                            <li key={feat} className="flex items-center gap-2 text-[10px] md:text-xs font-bold text-zinc-300 italic">
                                <Sparkles size={10} className="text-indigo-500 md:w-3 md:h-3" /> {feat}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <MusicRequestForm />
        </div>
    );
}
