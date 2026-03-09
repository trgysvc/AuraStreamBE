'use server';

import { createClient } from '@/lib/db/server';
import { revalidatePath } from 'next/cache';

export async function cancelSubscription() {
    const supabase = await createClient();

    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return { success: false, error: 'Unauthorized' };
        }

        // Ideally, in a full Stripe/Iyzico integration, we would call
        // the payment gateway's API here via their SDK and cancel the subscription ID.
        // E.g. await stripe.subscriptions.update(subId, { cancel_at_period_end: true });

        // Update the local database profile to reflect the cancellation 
        // fallback to free tier or mark as pending_cancellation

        // Find the user's primary tenant to update its plan
        const { data: profile } = await supabase
            .from('profiles')
            .select('tenant_id')
            .eq('id', user.id)
            .single();

        if (profile?.tenant_id) {
            await supabase
                .from('tenants')
                .update({ current_plan: 'free' }) // or 'canceled' based on your ENUM
                .eq('id', profile.tenant_id);

            // Also update the profile's denormalized subscription_tier if it exists
            await supabase
                .from('profiles')
                .update({ subscription_tier: 'free' })
                .eq('id', user.id);
        }

        revalidatePath('/account', 'page');
        return { success: true };
    } catch (e: any) {
        console.error('Cancellation error:', e);
        return { success: false, error: e.message || 'Failed to cancel subscription' };
    }
}
