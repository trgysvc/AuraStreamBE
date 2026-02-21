'use server';

import { createClient } from '@/lib/db/server';
import { revalidatePath } from 'next/cache';

export async function submitReferral(formData: FormData) {
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'You must be logged in to refer a friend.' };
    }

    const friendName = formData.get('friendName') as string;
    const friendEmail = formData.get('friendEmail') as string;

    if (!friendName || !friendEmail) {
        return { error: 'Please fill in all fields.' };
    }

    try {
        const { error } = await supabase
            .from('referrals')
            .insert({
                referrer_id: user.id,
                friend_name: friendName,
                friend_email: friendEmail,
                status: 'pending'
            });

        if (error) {
            console.error('Referral Error:', error);
            return { error: 'Failed to submit referral. Please try again.' };
        }

        revalidatePath('/dashboard');
        return { success: true };
    } catch (e) {
        console.error('Unexpected Error:', e);
        return { error: 'An unexpected error occurred.' };
    }
}
