import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminClient } from '@/lib/db/admin-client';
import crypto from 'crypto';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-01-28.clover', // Update to match CLI/Types
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
    const body = await req.text();
    const signature = headers().get('stripe-signature') as string;

    let event: Stripe.Event;

    try {
        if (!webhookSecret) {
            console.warn('⚠️  STRIPE_WEBHOOK_SECRET is missing. Skipping signature verification (DEV ONLY).');
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret || '');
        } else {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        }
    } catch (err: any) {
        console.error(`❌ Webhook signature verification failed: ${err.message}`);
        return NextResponse.json({ error: err.message }, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;

        // Extract metadata
        const { trackId, licenseType, projectName, userId } = session.metadata || {};

        if (!trackId || !licenseType || !userId) {
            console.error('Missing metadata in session', session.id);
            // Even if metadata is missing, we might want to return 200 to satisfy Stripe, but log error
            // However, failing here allows retry if we fix code. But this is data issue.
            return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
        }

        console.log(`💰 Payment successful for Session ${session.id}`);
        console.log(`   Track: ${trackId}, License: ${licenseType}, Project: ${projectName}, User: ${userId}`);

        try {
            const supabase = createAdminClient();

            // Map "personal" | "commercial" to "usage_type" enum
            // Enum: 'youtube', 'podcast', 'advertisement', 'film', 'social_media'
            let usageType = 'social_media'; // Default / Fallback
            if (licenseType === 'personal') {
                usageType = 'social_media';
            } else if (licenseType === 'commercial') {
                usageType = 'advertisement';
            }

            // Generate License Key
            const licenseKey = crypto.randomUUID().toUpperCase();

            // Insert License Record
            const { data: license, error } = await supabase
                .from('licenses')
                .insert({
                    track_id: trackId,
                    user_id: userId, // Use the ID from metadata (sourced from auth)
                    // license_type: licenseType, // REMOVED - not in schema
                    usage_type: usageType,
                    project_name: projectName || 'Untitled Project',
                    license_key: licenseKey,
                    platform_id: `stripe:${session.id}`, // Store session ID here as hack/workaround
                    // stripe_customer_email: session.customer_details?.email, // REMOVED
                    price_paid: (session.amount_total || 0) / 100, // Convert cents to dollars
                    currency: session.currency?.toUpperCase() || 'USD',
                })
                .select()
                .single();

            if (error) {
                console.error('Error creating license record:', error);
                throw error;
            }

            console.log('✅ License created:', license);

        } catch (error: any) {
            console.error('Database insertion failed:', error);
            return NextResponse.json({ error: 'Database insertion failed', details: error.message }, { status: 500 });
        }
    }

    return NextResponse.json({ received: true });
}
