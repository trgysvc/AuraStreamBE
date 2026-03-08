import { PaymentGatewayInterface, SubscriptionInput, CustomerData, SubscriptionResult, UpgradeDowngradeInput } from './gateway.interface';
import crypto from 'crypto';

export class IyzicoGateway implements PaymentGatewayInterface {

    // Helper to get an instanced Iyzipay client safely on the server side
    private async getClient() {
        // Dynamic import inside function prevents Next.js from evaluating fs.readdirSync at build/bundle time
        const IyzipayModule = (await import('iyzipay')).default;
        return new IyzipayModule({
            apiKey: process.env.IYZICO_API_KEY || 'api_key_placeholder',
            secretKey: process.env.IYZICO_SECRET_KEY || 'secret_key_placeholder',
            uri: process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com'
        });
    }

    /**
     * Registers a customer (Customer creation is sometimes implicit in the subscription start for Iyzico
     * but they provide a Subscription Customer API as well)
     */
    async createCustomer(data: CustomerData): Promise<string> {
        const iyzipay = await this.getClient();
        return new Promise((resolve, reject) => {
            iyzipay.subscriptionCustomer.create({
                name: data.fullName.split(' ')[0] || 'Unknown',
                surname: data.fullName.split(' ').slice(1).join(' ') || 'User',
                identityNumber: '11111111111', // Dummy ID for Sandbox, needs real one in production if required
                email: data.email,
                gsmNumber: '+905555555555', // Placeholder, needs actual phone collection
                billingAddress: {
                    contactName: data.fullName,
                    city: 'Istanbul',
                    country: 'Turkey',
                    address: 'Billing Address Placeholder',
                    zipCode: '34000'
                },
                shippingAddress: {
                    contactName: data.fullName,
                    city: 'Istanbul',
                    country: 'Turkey',
                    address: 'Shipping Address Placeholder',
                    zipCode: '34000'
                }
            }, (err: any, result: any) => {
                if (err) return reject(err);
                if (result.status === 'success') {
                    resolve(result.data.referenceCode);
                } else {
                    reject(new Error(result.errorMessage));
                }
            });
        });
    }

    /**
     * Initializes a subscription using Iyzico Checkout Form
     * We need a pre-existing PricingPlanReferenceCode here
     */
    async createSubscription(input: SubscriptionInput): Promise<SubscriptionResult> {
        const iyzipay = await this.getClient();
        return new Promise((resolve, reject) => {

            // Match the internal plan ID to an Iyzico Pricing Plan Reference Code
            const pricingPlanReferenceCode = this.mapPlanIdToIyzicoCode(input.planId);

            iyzipay.subscriptionCheckoutForm.initialize({
                pricingPlanReferenceCode: pricingPlanReferenceCode,
                customer: {
                    name: 'Customer', // Or resolve from DB if needed
                    surname: 'User',
                    identityNumber: '11111111111',
                    email: 'user@example.com',
                    billingAddress: {
                        contactName: 'Customer User',
                        city: 'Istanbul',
                        country: 'Turkey',
                        address: 'Billing Address Placeholder',
                        zipCode: '34000'
                    },
                    shippingAddress: {
                        contactName: 'Customer User',
                        city: 'Istanbul',
                        country: 'Turkey',
                        address: 'Shipping Address Placeholder',
                        zipCode: '34000'
                    }
                },
                subscriptionInitialStatus: 'PENDING', // Will turn ACTIVE on 1 TL approval via webhook
                callbackUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/webhooks/iyzico/callback`
            }, (err: any, result: any) => {
                if (err) return reject(err);
                if (result.status === 'success') {
                    resolve({
                        success: true,
                        status: 'PENDING', // PENDING until webhook confirms 1TL auth
                        // We return the raw HTML token/script from checkout form
                        clientSecret: result.checkoutFormContent
                    });
                } else {
                    reject(new Error(result.errorMessage));
                }
            });
        });
    }

    /**
     * Upgrades or downgrades an existing subscription.
     * Note: Iyzico handles this through Subscription Upgrade APIs
     */
    async updateSubscription(input: UpgradeDowngradeInput): Promise<boolean> {
        const iyzipay = await this.getClient();
        return new Promise((resolve, reject) => {
            const newPricingPlanReferenceCode = this.mapPlanIdToIyzicoCode(input.newPlanId);

            // Requires usage of their Subscription Upgrade API 
            iyzipay.subscription.upgrade({
                subscriptionReferenceCode: input.providerSubscriptionId,
                newPricingPlanReferenceCode: newPricingPlanReferenceCode,
                upgradePeriod: 'NOW', // Typings only support 'NOW'
            }, (err: any, result: any) => {
                if (err) return reject(err);
                if (result.status === 'success') resolve(true);
                else reject(new Error(result.errorMessage));
            });
        });
    }

    /**
     * Cancels a subscription
     */
    async cancelSubscription(providerSubscriptionId: string): Promise<boolean> {
        const iyzipay = await this.getClient();
        return new Promise((resolve, reject) => {
            iyzipay.subscription.cancel({
                subscriptionReferenceCode: providerSubscriptionId
            }, (err: any, result: any) => {
                if (err) return reject(err);
                if (result.status === 'success') resolve(true);
                else reject(new Error(result.errorMessage));
            });
        });
    }

    /**
     * Helper to verify Iyzico Webhook Signatures
     * Payload should be raw body string.
     * Referencing: iyzipay-node or their docs on "webhook verification"
     */
    async constructWebhookEvent(payload: string | Buffer, signature: string): Promise<any> {
        // In Iyzico, you construct a string from payload, sign it with your secret key
        const secretKey = process.env.IYZICO_SECRET_KEY || '';

        const expectedSignature = crypto.createHmac('sha256', secretKey)
            .update(payload.toString('utf8'))
            .digest('base64');

        if (signature !== expectedSignature) {
            throw new Error("Invalid Iyzico Signature");
        }

        return JSON.parse(payload.toString('utf8'));
    }

    // Maps internal AuraStream Plan IDs to Iyzico Pricing Plan Codes
    private mapPlanIdToIyzicoCode(planId: string): string {
        const mappings: Record<string, string> = {
            'business_monthly': process.env.IYZICO_PLAN_BUSINESS_MONTHLY || 'plan_stub_business_m',
            'business_yearly': process.env.IYZICO_PLAN_BUSINESS_YEARLY || 'plan_stub_business_y',
            'enterprise': process.env.IYZICO_PLAN_ENTERPRISE || 'plan_stub_ent'
        };
        return mappings[planId] || planId;
    }
}
