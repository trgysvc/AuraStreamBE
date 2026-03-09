import { MainHeader } from '@/components/layout/MainHeader';
import { Footer } from '@/components/layout/Footer';
import { createClient } from '@/lib/db/server';
import { CheckoutClient } from './CheckoutClient';
import { getTranslations, setRequestLocale } from 'next-intl/server';

interface PageProps {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ plan?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations({ locale, namespace: 'Pricing' });
    return {
        title: "Checkout | AuraStream",
    };
}

export default async function CheckoutPage(props: PageProps) {
    const { locale } = await props.params;
    setRequestLocale(locale);

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // We need to await the searchParams correctly in Next.js 15+
    const resolvedSearchParams = await props.searchParams;
    const planId = resolvedSearchParams.plan || 'business_monthly';

    // Verify corporate details before allowing checkout
    let isCorporateValid = false;
    let missingFields: string[] = [];

    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('billing_details, tenants(*)')
            .eq('id', user.id)
            .single();

        if (profile) {
            const billingDetails = profile.billing_details as any;
            const tenantData = profile.tenants as any;
            const tenant = Array.isArray(tenantData) ? tenantData[0] : tenantData;

            if (billingDetails?.type === 'corporate') {
                const requiredFields = [
                    { key: 'legal_name', label: 'Company Title' },
                    { key: 'vkn', label: 'Tax ID (VKN)' },
                    { key: 'tax_office', label: 'Tax Office' },
                    { key: 'billing_address', label: 'Billing Address' },
                ];

                const missing = requiredFields.filter(f => !tenant?.[f.key]);

                if (missing.length === 0) {
                    isCorporateValid = true;
                } else {
                    missingFields = missing.map(m => m.label);
                }
            } else {
                // Not even marked as corporate
                missingFields = ['Corporate Account Type'];
            }
        }
    }

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
            <MainHeader initialUser={user} />
            <main className="pt-32 pb-24 px-6 max-w-[800px] mx-auto min-h-[70vh]">
                <CheckoutClient
                    initialPlan={planId}
                    isCorporateValid={isCorporateValid}
                    missingFields={missingFields}
                />
            </main>
            <Footer />
        </div>
    );
}
