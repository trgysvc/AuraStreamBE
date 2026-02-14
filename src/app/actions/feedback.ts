'use server';

import { createClient } from '@/lib/db/server';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { Database } from '@/types/supabase';

type FeedbackCategory = Database['public']['Enums']['feedback_category'];
type FeedbackSeverity = Database['public']['Enums']['feedback_severity'];

export async function submitFeedback(formData: FormData) {
    const supabase = createClient();

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

    if (!category || !description) {
        return { error: 'Lütfen tüm zorunlu alanları doldurun.' };
    }

    try {
        const headersList = await headers();
        const ip = headersList.get('x-forwarded-for') || 'unknown';

        const metadata = {
            ...(metadataStr ? JSON.parse(metadataStr) : {}),
            ip_address: ip
        };

        const { error } = await supabase
            .from('feedbacks')
            .insert({
                user_id: user.id,
                category,
                title,
                description,
                severity,
                metadata,
                status: 'new'
            });

        if (error) {
            console.error('Feedback DB Error:', error);
            // If it's a schema cache issue, we might see it here
            return { error: 'Geri bildirim kaydedilemedi. Lütfen daha sonra tekrar deneyin.' };
        }

        revalidatePath('/admin/feedback');
        return { success: true };
    } catch (e) {
        console.error('Unexpected Feedback Error:', e);
        return { error: 'Beklenmedik bir hata oluştu.' };
    }
}
