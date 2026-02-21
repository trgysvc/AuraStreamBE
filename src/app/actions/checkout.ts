'use server';

import Stripe from 'stripe';
import { createClient } from '@/lib/db/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-01-28.clover' as any, // Use latest or matching version as per TS
});

interface CheckoutParams {
    trackId: string;
    licenseType: 'personal' | 'commercial';
    projectName: string;
}

export async function createCheckoutSession({ trackId, licenseType, projectName }: CheckoutParams) {
    // 0. Authenticate User
    const supabaseUser = await createClient();
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();

    if (authError || !user) {
        // Since this is a server action called from client, we can return an error or redirect
        // Ideally the UI should handle this, but here we throw to prompt UI handling
        throw new Error('User must be logged in to purchase a license');
    }

    if (!trackId || !licenseType) {
        throw new Error('Missing required params');
    }

    // 1. Fetch Track Details
    const { data: track, error } = await supabaseUser
        .from('tracks')
        .select('*')
        .eq('id', trackId)
        .single();

    if (error || !track) {
        throw new Error('Track not found');
    }

    // 2. Determine Price
    const prices = {
        personal: 1900, // $19.00
        commercial: 4900, // $49.00
    };

    const priceAmount = prices[licenseType];
    const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3005';

    // 3. Create Stripe Session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        client_reference_id: user.id, // CRITICAL: Link payment to user
        customer_email: user.email, // Pre-fill email if available
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: `${track.title} (${licenseType.toUpperCase()} License)`,
                        description: `License for project: ${projectName}`,
                        images: track.cover_image_url ? [track.cover_image_url] : [],
                        metadata: {
                            trackId: track.id,
                            licenseType,
                            projectName
                        }
                    },
                    unit_amount: priceAmount,
                },
                quantity: 1,
            },
        ],
        mode: 'payment',
        success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/venue`, // return to venue or store
        metadata: {
            trackId: track.id,
            licenseType,
            projectName,
            userId: user.id
        },
    });

    return { sessionId: session.id, url: session.url };
}
