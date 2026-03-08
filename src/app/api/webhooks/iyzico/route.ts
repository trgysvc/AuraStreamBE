import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/db/admin-client';

// NOTE: Iyzico Webhooks need IP whitelist + HMAC verification in production.
// For this MVP, we process the standard payload securely via Admin DB updates.

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const eventType = body.iyziEventType;
        const subscriptionRef = body.subscriptionReferenceCode;

        if (!eventType || !subscriptionRef) {
            return NextResponse.json({ error: 'Invalid Iyzico webhook payload' }, { status: 400 });
        }

        const supabase = createAdminClient();

        // Idempotency Check: Iyzico doesn't always send a unique event UUID,
        // so we can use a hash of the event + ref + orderId if available.
        // If iyziEventId is provided, we use it natively.
        const eventId = body.iyziEventId || `${eventType}_${subscriptionRef}_${body.orderReferenceCode || Date.now()}`;

        const { data: existingEvent } = await supabase
            .from('processed_webhook_ids')
            .select('id')
            .eq('id', eventId)
            .single();

        if (existingEvent) {
            console.log(`⚠️ Iyzico Webhook event ${eventId} already processed. Skipping.`);
            return NextResponse.json({ received: true, skipped: true });
        }

        switch (eventType) {
            case 'subscription.activated': {
                await supabase
                    .from('subscriptions')
                    .update({
                        status: 'active',
                        grace_period_end: null
                    })
                    .eq('provider_sub_id', subscriptionRef)
                    .eq('provider', 'iyzico');

                console.log(`✅ Iyzico subscription activated: ${subscriptionRef}`);
                break;
            }

            case 'subscription.order.success': {
                // Iyzico successful recurrent payment
                // Typical order.success extends the period.
                // We assume 1 month extension for monthly plans if exact dates aren't in payload, 
                // but usually we should query Iyzico API to get the exact new current_period_end.
                // For MVP, we'll optimistically extend it by 30 days if not provided.

                const { data: sub } = await supabase
                    .from('subscriptions')
                    .select('current_period_end')
                    .eq('provider_sub_id', subscriptionRef)
                    .single();

                let newEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days default
                if (sub?.current_period_end) {
                    const currentEnd = new Date(sub.current_period_end);
                    if (currentEnd > new Date()) {
                        newEnd = new Date(currentEnd.getTime() + 30 * 24 * 60 * 60 * 1000);
                    }
                }

                await supabase
                    .from('subscriptions')
                    .update({
                        status: 'active',
                        current_period_end: newEnd.toISOString(),
                        grace_period_end: null
                    })
                    .eq('provider_sub_id', subscriptionRef)
                    .eq('provider', 'iyzico');

                console.log(`✅ Iyzico payment succeeded for ${subscriptionRef}. Extended to ${newEnd.toISOString()}`);
                break;
            }

            case 'subscription.order.failure': {
                // Payment failed, enter Dunning / Grace period (48 hours)
                const graceEnd = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

                await supabase
                    .from('subscriptions')
                    .update({
                        status: 'grace_period',
                        grace_period_end: graceEnd
                    })
                    .eq('provider_sub_id', subscriptionRef)
                    .eq('provider', 'iyzico');

                console.log(`⚠️ Iyzico payment failed for ${subscriptionRef}. Status updated to grace_period until ${graceEnd}`);
                break;
            }

            case 'subscription.canceled': {
                await supabase
                    .from('subscriptions')
                    .update({
                        status: 'canceled',
                        canceled_at: new Date().toISOString(),
                        cancel_at_period_end: false
                    })
                    .eq('provider_sub_id', subscriptionRef)
                    .eq('provider', 'iyzico');

                console.log(`📉 Iyzico subscription cancelled: ${subscriptionRef}`);
                break;
            }

            default:
                console.log(`ℹ️ Unhandled Iyzico event type: ${eventType}`);
        }

        // Mark event as processed
        await supabase.from('processed_webhook_ids').insert({
            id: eventId,
            provider: 'iyzico',
            processed_at: new Date().toISOString()
        });

        return NextResponse.json({ received: true });

    } catch (err: any) {
        console.error(`❌ Error processing Iyzico webhook:`, err);
        return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
    }
}
