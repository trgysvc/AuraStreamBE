export interface CustomerData {
    id: string;
    email: string;
    fullName: string;
    billingCountry?: string;
    tenantId: string;
}

export interface SubscriptionInput {
    customerId: string; // The AuraStream user or tenant ID
    planId: string; // e.g. "business_monthly", "business_yearly"
    currency: 'TRY' | 'USD';
    referencePriceUsd?: number; // Optional, useful for logging
}

export interface SubscriptionResult {
    success: boolean;
    providerSubscriptionId?: string;
    clientSecret?: string; // For 3DS, modal, or redirect flows
    redirectUrl?: string; // URL to redirect user for payment completion
    status: 'PENDING' | 'ACTIVE' | 'FAILED';
    error?: string;
}

export interface UpgradeDowngradeInput {
    providerSubscriptionId: string;
    newPlanId: string;
    prorationHandling?: boolean;
}

/**
 * PaymentGatewayInterface (v1.5.0 Implementation Plan standard)
 * 
 * Provides an abstraction layer so that both Stripe and Iyzico 
 * (and any future providers like Paycell, Ikas) can be interchanged
 * seamlessly in the checkout router.
 */
export interface PaymentGatewayInterface {
    /**
     * Initializes a new customer on the provider side
     */
    createCustomer(data: CustomerData): Promise<string>;

    /**
     * Generates checkout / intent session for a subscription
     */
    createSubscription(input: SubscriptionInput): Promise<SubscriptionResult>;

    /**
     * Upgrades or downgrades an existing subscription.
     */
    updateSubscription(input: UpgradeDowngradeInput): Promise<boolean>;

    /**
     * Cancels a subscription immediately or at period end based on provider capabilities.
     * By default, cancellation happens at period end.
     */
    cancelSubscription(providerSubscriptionId: string): Promise<boolean>;

    /**
     * Validates webhook signatures and returns the parsed event
     */
    constructWebhookEvent(payload: string | Buffer, signature: string): Promise<any>;
}
