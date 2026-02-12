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
            throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
        }
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
        console.error(`❌ Webhook signature verification failed: ${err.message}`);
        return NextResponse.json({ error: err.message }, { status: 400 });
    }

    // Handle Subscription Events
    if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated') {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const tier = (subscription.metadata.tier as any) || 'pro';
        const status = subscription.status as string;

        const supabase = createAdminClient();

        // 1. Update Profile
        await supabase
            .from('profiles')
            .update({
                subscription_tier: tier,
                stripe_customer_id: customerId
            })
            .eq('stripe_customer_id', customerId);

        // 2. Update Tenant (Link via owner's profile)
        const { data: profile } = await supabase
            .from('profiles')
            .select('tenant_id')
            .eq('stripe_customer_id', customerId)
            .single();

        if (profile?.tenant_id) {
            await supabase
                .from('tenants')
                .update({
                    current_plan: tier,
                    plan_status: status,
                    subscription_id: subscription.id
                })
                .eq('id', profile.tenant_id);
        }

        console.log(`👤 User & Tenant subscription updated: ${customerId} -> ${tier} (${status})`);
    }

    if (event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const supabase = createAdminClient();

        // Update Profile
        await supabase
            .from('profiles')
            .update({ subscription_tier: 'free' })
            .eq('stripe_customer_id', customerId);

        // Update Tenant
        const { data: profile } = await supabase
            .from('profiles')
            .select('tenant_id')
            .eq('stripe_customer_id', customerId)
            .single();

        if (profile?.tenant_id) {
            await supabase
                .from('tenants')
                .update({
                    current_plan: 'free',
                    plan_status: 'canceled'
                })
                .eq('id', profile.tenant_id);
        }

        console.log(`📉 User & Tenant subscription cancelled: ${customerId}`);
    }

    // Legacy support for checkout sessions (initial purchase)
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        // ... existing logic if needed for one-off trials or specific credits
    }

    return NextResponse.json({ received: true });
}
