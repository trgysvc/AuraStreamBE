import { PaymentGatewayInterface, SubscriptionInput, CustomerData, SubscriptionResult } from './gateway.interface';
import { StripeGateway } from './stripe.gateway';
import { IyzicoGateway } from './iyzico.gateway';

export const stripeProvider = new StripeGateway();
export const iyzicoProvider = new IyzicoGateway();

/**
 * Route checkout intent to the correct provider based on billing country
 */
export async function routeSubscription(user: CustomerData, planId: string): Promise<SubscriptionResult> {
    const isTR = user.billingCountry?.toUpperCase() === 'TR';

    const input: SubscriptionInput = {
        customerId: user.id,
        planId: planId,
        // [v1.5] Tahsilat TR ise her zaman TRY, değilse USD
        currency: isTR ? 'TRY' : 'USD'
    };

    // [v1.1] PaymentGatewayInterface Router
    if (isTR) {
        return iyzicoProvider.createSubscription(input);
    } else {
        return stripeProvider.createSubscription(input);
    }
}
