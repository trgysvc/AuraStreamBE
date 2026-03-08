import Stripe from 'stripe';
import { PaymentGatewayInterface, SubscriptionInput, CustomerData, SubscriptionResult, UpgradeDowngradeInput } from './gateway.interface';

// Verify that the environment variable exists
if (!process.env.STRIPE_SECRET_KEY) {
    // We don't throw immediately so we don't break the build, but it will fail on use
    console.warn("Missing STRIPE_SECRET_KEY in environment variables.");
}

export const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
    apiVersion: '2023-10-16' as any, // Latest generic version at time of write
});

export class StripeGateway implements PaymentGatewayInterface {

    /**
     * Registers a customer in Stripe
     */
    async createCustomer(data: CustomerData): Promise<string> {
        const customer = await stripeClient.customers.create({
            email: data.email,
            name: data.fullName,
            metadata: {
                auraStreamUserId: data.id,
                tenantId: data.tenantId,
                billingCountry: data.billingCountry || 'Unknown'
            }
        });

        return customer.id;
    }

    /**
     * Generates a checkout session for a specific price plan
     */
    async createSubscription(input: SubscriptionInput): Promise<SubscriptionResult> {
        try {
            // Typically in Stripe, 'planId' needs to map to a Stripe Price ID via DB or env
            // For this stub, assuming planId matches price ID or mapping happens externally
            const priceId = this.mapPlanIdToStripePriceId(input.planId);

            const session = await stripeClient.checkout.sessions.create({
                customer: input.customerId, // Needs to be the Stripe Customer ID
                mode: 'subscription',
                payment_method_types: ['card'],
                line_items: [
                    {
                        price: priceId,
                        quantity: 1,
                    },
                ],
                success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/billing?status=success&session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/billing?status=canceled`,
                metadata: {
                    app_plan_id: input.planId,
                    currency_mode: input.currency
                }
            });

            return {
                success: true,
                redirectUrl: session.url || undefined,
                status: 'PENDING'
            };
        } catch (err: any) {
            console.error("Stripe createSubscription error:", err);
            return {
                success: false,
                status: 'FAILED',
                error: err.message
            };
        }
    }

    /**
     * Handles immediate upgrades or downgrades
     */
    async updateSubscription(input: UpgradeDowngradeInput): Promise<boolean> {
        try {
            const subscription = await stripeClient.subscriptions.retrieve(input.providerSubscriptionId);

            const priceId = this.mapPlanIdToStripePriceId(input.newPlanId);

            await stripeClient.subscriptions.update(input.providerSubscriptionId, {
                items: [{
                    id: subscription.items.data[0].id,
                    price: priceId,
                }],
                proration_behavior: input.prorationHandling ? 'create_prorations' : 'none',
            });

            return true;
        } catch (err) {
            console.error("Stripe updateSubscription error:", err);
            return false;
        }
    }

    /**
     * Cancels subscription at period end.
     */
    async cancelSubscription(providerSubscriptionId: string): Promise<boolean> {
        try {
            await stripeClient.subscriptions.update(providerSubscriptionId, {
                cancel_at_period_end: true
            });
            return true;
        } catch (err) {
            console.error("Stripe cancelSubscription error:", err);
            return false;
        }
    }

    /**
     * Verify Stripe signatures
     */
    async constructWebhookEvent(payload: string | Buffer, signature: string): Promise<Stripe.Event> {
        const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!endpointSecret) throw new Error("STRIPE_WEBHOOK_SECRET is not set");

        return stripeClient.webhooks.constructEvent(payload, signature, endpointSecret);
    }

    // Helper dictionary matching our app plans to Stripe Price Objects
    private mapPlanIdToStripePriceId(planId: string) {
        // In a real app, these come from DB or env variables
        const planMapping: Record<string, string> = {
            'business_monthly': process.env.STRIPE_PRICE_BUSINESS_MONTHLY || 'price_stub_business_m',
            'business_yearly': process.env.STRIPE_PRICE_BUSINESS_YEARLY || 'price_stub_business_y',
            'enterprise': process.env.STRIPE_PRICE_ENTERPRISE || 'price_stub_ent'
        };

        return planMapping[planId] || planId;
    }
}
