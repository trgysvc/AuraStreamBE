import { NextResponse } from 'next/server';
import { createClient } from '@/lib/db/server';
import { routeSubscription } from '@/lib/payments/router';

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log("Checkout API Hit. Body:", await req.clone().text());
        const body = await req.json();
        const { planId, billingCountry } = body;
        console.log("Parsed Checkout Plan:", planId, "Country:", billingCountry);

        if (!planId) {
            return NextResponse.json({ error: 'Missing planId' }, { status: 400 });
        }

        // Get the user's profile to retrieve full name and tenant info
        const { data: profile } = await supabase
            .from('profiles')
            .select('*, tenants(id)')
            .eq('id', user.id)
            .single();
        console.log("Supabase profile fetched:", profile ? "found" : "not found");

        if (!profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }

        const tenantData = profile.tenants as any;
        const tenantId = Array.isArray(tenantData) ? tenantData[0]?.id : tenantData?.id || profile.tenant_id;

        if (!tenantId) {
            return NextResponse.json({ error: 'User does not belong to a tenant' }, { status: 400 });
        }

        // We pass the required user data to the router
        const customerData = {
            id: user.id,
            email: user.email || '',
            fullName: profile.full_name || 'AuraStream User',
            billingCountry: billingCountry || (profile.billing_details as Record<string, any>)?.country || 'Unknown',
            tenantId: tenantId
        };

        console.log("Routing subscription with:", customerData);

        // The router decides Stripe vs iyzico based on billingCountry
        const result = await routeSubscription(customerData, planId);

        if (!result.success) {
            console.error("Subscription routing failed:", result.error);
            return NextResponse.json({ error: result.error || 'Failed to initialize checkout' }, { status: 500 });
        }

        // Return the specific checkout data back to the client
        // For Stripe, this usually includes redirectUrl. For iyzico, clientSecret (HTML script)
        return NextResponse.json(result);

    } catch (error: any) {
        console.error('Checkout API caught UNEXPECTED error:', error);

        // Check if it's struggling to stringify some circular object
        const errorMessage = error?.message || String(error) || 'Internal server error';

        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
