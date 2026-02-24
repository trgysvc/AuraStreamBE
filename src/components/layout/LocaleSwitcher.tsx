'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useTransition } from 'react';

export default function LocaleSwitcher({ isDark = true }: { isDark?: boolean }) {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();

    const onSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const nextLocale = e.target.value;
        startTransition(() => {
            router.replace(pathname, { locale: nextLocale });
        });
    };

    const localeNames: Record<string, string> = {
        en: 'English (US)',
        tr: 'Türkçe',
        de: 'Deutsch',
        el: 'Ελληνικά',
        ru: 'Русский',
        fr: 'Français'
    };

    return (
        <div className={`relative inline-flex items-center gap-2 px-4 py-2 border rounded text-sm font-medium cursor-pointer transition-colors ${isDark
                ? 'border-white/20 text-white hover:bg-white/10'
                : 'border-zinc-300 text-black hover:bg-zinc-100'
            }`}>
            <select
                defaultValue={locale}
                disabled={isPending}
                onChange={onSelectChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            >
                {Object.entries(localeNames).map(([value, name]) => (
                    <option key={value} value={value} className="text-black bg-white">
                        {name}
                    </option>
                ))}
            </select>
            <span className="pointer-events-none flex items-center gap-1">
                {localeNames[locale] || 'English (US)'}
                <span className="text-xs ml-1">▼</span>
            </span>
        </div>
    );
}
