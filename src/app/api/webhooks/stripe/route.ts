import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminClient } from '@/lib/db/admin-client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-02-24.acacia' as any, // Using latest valid Stripe API version type
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
    const body = await req.text();
    const headerList = await headers();
    const signature = headerList.get('stripe-signature') as string;

    let event: Stripe.Event;

    try {
        if (!webhookSecret) {
            throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
        }
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        console.error(`❌ Webhook signature verification failed: ${msg}`);
        return NextResponse.json({ error: msg }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Idempotency Check
    const { data: existingEvent } = await supabase
        .from('processed_webhook_ids')
        .select('id')
        .eq('id', event.id)
        .single();

    if (existingEvent) {
        console.log(`⚠️ Webhook event ${event.id} already processed. Skipping.`);
        return NextResponse.json({ received: true, skipped: true });
    }

    try {
        switch (event.type) {
            case 'invoice.payment_succeeded': {
                const invoice = event.data.object as any;
                if (invoice.subscription) {
                    const subscriptionId = invoice.subscription as string;
                    const customerId = invoice.customer as string;

                    // Fetch the subscription from Stripe to get the current period end
                    const stripeSub = await stripe.subscriptions.retrieve(subscriptionId) as any;

                    await supabase
                        .from('subscriptions')
                        .update({
                            status: 'active',
                            current_period_end: new Date((stripeSub.current_period_end as number) * 1000).toISOString(),
                            grace_period_end: null // Clear any dunning state
                        })
                        .eq('provider_sub_id', subscriptionId)
                        .eq('provider', 'stripe');

                    console.log(`✅ Stripe payment succeeded for ${subscriptionId}`);
                }
                break;
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as any;
                if (invoice.subscription) {
                    const subscriptionId = invoice.subscription as string;

                    // Basic Dunning implementation (status grace_period if Stripe marks it past_due)
                    const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);

                    const updateData: any = {};
                    if (stripeSub.status === 'past_due' || stripeSub.status === 'unpaid') {
                        updateData.status = 'grace_period';
                        // Default to 48 hours for grace period if not handled strictly by Stripe
                        updateData.grace_period_end = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
                    } else if (stripeSub.status === 'canceled') {
                        updateData.status = 'canceled';
                    }

                    if (Object.keys(updateData).length > 0) {
                        await supabase
                            .from('subscriptions')
                            .update(updateData)
                            .eq('provider_sub_id', subscriptionId)
                            .eq('provider', 'stripe');

                        console.log(`⚠️ Stripe payment failed for ${subscriptionId}. Status updated to ${updateData.status}`);
                    }
                }
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as any;

                // Keep cancel_at_period_end synced
                await supabase
                    .from('subscriptions')
                    .update({
                        status: subscription.status === 'trialing' ? 'trialing' : (subscription.status === 'active' ? 'active' : 'grace_period'),
                        cancel_at_period_end: subscription.cancel_at_period_end,
                        current_period_end: new Date((subscription.current_period_end as number) * 1000).toISOString()
                    })
                    .eq('provider_sub_id', subscription.id)
                    .eq('provider', 'stripe');
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;

                await supabase
                    .from('subscriptions')
                    .update({
                        status: 'canceled',
                        canceled_at: new Date().toISOString(),
                        cancel_at_period_end: false
                    })
                    .eq('provider_sub_id', subscription.id)
                    .eq('provider', 'stripe');

                console.log(`📉 Stripe subscription cancelled: ${subscription.id}`);
                break;
            }
        }

        // 2. Mark event as processed
        await supabase.from('processed_webhook_ids').insert({
            id: event.id,
            provider: 'stripe',
            processed_at: new Date().toISOString()
        });

    } catch (err: any) {
        console.error(`❌ Error processing webhook ${event.type}:`, err);
        return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
    }

    return NextResponse.json({ received: true });
}
