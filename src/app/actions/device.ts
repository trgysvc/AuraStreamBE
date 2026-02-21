'use server'

import { createClient } from '@/lib/db/server';
import { revalidatePath } from 'next/cache';

export interface Device {
    id: string;
    tenant_id: string;
    venue_id: string | null;
    name: string;
    hardware_id: string;
    auth_token: string; // Should be hidden in UI, shown only once
    ip_address: string | null;
    app_version: string | null;
    sync_status: 'synced' | 'downloading' | 'error';
    last_heartbeat: string | null;
    created_at: string;
}

export async function getDevices_Action(tenantId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('devices')
        .select(`
            *,
            venue:venues(business_name)
        `)
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching devices:', error);
        return [];
    }

    return data as (Device & { venue: { business_name: string } | null })[];
}

export async function registerDevice_Action(data: {
    tenantId: string;
    venueId?: string;
    name: string;
    hardwareId: string;
}) {
    const supabase = await createClient();

    // Generate a secure token (random string for now)
    const authToken = require('crypto').randomBytes(32).toString('hex');

    const { data: newDevice, error } = await supabase
        .from('devices')
        .insert({
            tenant_id: data.tenantId,
            venue_id: data.venueId || null,
            name: data.name,
            hardware_id: data.hardwareId,
            auth_token: authToken,
            sync_status: 'synced' as any // Default
        })
        .select()
        .single();

    if (error) {
        console.error('Error registering device:', error);
        throw new Error(error.message);
    }

    revalidatePath('/dashboard/devices');
    return newDevice;
}

export async function deleteDevice_Action(deviceId: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('devices')
        .delete()
        .eq('id', deviceId);

    if (error) {
        console.error('Error deleting device:', error);
        throw new Error(error.message);
    }

    revalidatePath('/dashboard/devices');
    return { success: true };
}
