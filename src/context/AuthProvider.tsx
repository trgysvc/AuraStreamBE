'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from '@/i18n/navigation';
import { createClient } from '@/lib/db/client';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const supabase = createClient();

    useEffect(() => {
        // Determine if the current route is publicly accessible without auth
        const isPublicRoute =
            pathname === '/' ||
            pathname === '/login' ||
            pathname === '/signup' ||
            pathname === '/pricing' ||
            pathname === '/enterprise' ||
            pathname === '/blog' ||
            pathname.startsWith('/about');

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_OUT') {
                // Only redirect if they are not already on a public route
                if (!isPublicRoute) {
                    router.push('/login');
                    router.refresh(); // Ensure the client-side cache is cleared
                }
            }

            // We can also potentially capture TOKEN_REFRESH events if they fail 
            // but usually the Supabase goTrue client translates a failed refresh into SIGNED_OUT
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [supabase, router, pathname]);

    return <>{children}</>;
}
