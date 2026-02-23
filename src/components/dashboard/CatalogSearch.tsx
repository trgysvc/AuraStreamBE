'use client';

import { Search } from 'lucide-react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTransition, useState, useEffect } from 'react';

export function CatalogSearch() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [query, setQuery] = useState(searchParams.get('q') || '');

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());
            if (query) {
                params.set('q', query);
            } else {
                params.delete('q');
            }
            startTransition(() => {
                router.replace(`${pathname}?${params.toString()}`);
            });
        }, 300);

        return () => clearTimeout(timer);
    }, [query, router, pathname, searchParams]);

    return (
        <div className="relative group flex-1 sm:flex-none">
            <Search size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isPending ? 'text-indigo-500 animate-pulse' : 'text-zinc-600 group-focus-within:text-indigo-500'}`} />
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search catalog..."
                className="bg-[#1E1E22] border border-white/5 rounded-full pl-12 pr-6 py-3 text-xs font-bold focus:outline-none focus:border-indigo-500 transition-all w-full sm:w-64 placeholder:text-zinc-700 text-white"
            />
        </div>
    );
}
