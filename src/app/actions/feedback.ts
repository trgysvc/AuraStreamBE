'use server';

import { createClient } from '@/lib/db/server';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { Database } from '@/types/supabase';

type FeedbackCategory = Database['public']['Enums']['feedback_category'];
type FeedbackSeverity = Database['public']['Enums']['feedback_severity'];

export async function submitFeedback(formData: FormData) {
    const supabase = await createClient();

    // 1. Get current session/user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { error: 'Oturum açmanız gerekiyor.' };
    }

    // 2. Security: Verify the user has a valid profile (Member Check)
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', user.id)
        .single();

    if (profileError || !profile) {
        return { error: 'Feedback göndermek için üye olmanız gerekmektedir.' };
    }

    const category = formData.get('category') as FeedbackCategory;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const metadataStr = formData.get('metadata') as string;
    const severity = (formData.get('severity') as FeedbackSeverity) || 'low';

    // For development category, we don't strictly need a description as we have specific metadata fields
    const descriptionValue = category === 'development' ? (description || 'Development Participation Request') : description;

    if (!category || (!descriptionValue && category !== 'development')) {
        return { error: 'Lütfen tüm zorunlu alanları doldurun.' };
    }

    try {
        const headersList = await headers();
        const ip = headersList.get('x-forwarded-for') || 'unknown';

        const metadata = {
            ...(metadataStr ? JSON.parse(metadataStr) : {}),
            ip_address: ip
        };

        const { data, error: insertError } = await supabase
            .from('feedbacks')
            .insert({
                user_id: user.id,
                category,
                title,
                description: descriptionValue,
                severity,
                metadata,
                status: 'new'
            })
            .select()
            .single();

        if (insertError) {
            console.error('Feedback Insert Error details:', {
                message: insertError.message,
                details: insertError.details,
                hint: insertError.hint,
                code: insertError.code
            });
            throw new Error(`Geri bildirim kaydedilemedi: ${insertError.message}`);
        }

        revalidatePath('/admin/feedback');
        return { success: true };
    } catch (e) {
        console.error('Unexpected Feedback Error:', e);
        return { error: 'Beklenmedik bir hata oluştu.' };
    }
}
