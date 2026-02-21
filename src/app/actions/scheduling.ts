'use server'

import { createClient } from '@/lib/db/server';

export interface VenueSchedule {
    id: string;
    venue_id: string;
    name: string;
    start_time: string;
    end_time: string;
    day_of_week: number[];
    moods: string[];
    genres: string[];
    target_energy: number;
    target_tuning: '440hz' | '432hz' | '528hz';
    is_active: boolean;
}

export async function getActiveScheduleRule_Action(venueId: string) {
    const supabase = await createClient();
    const now = new Date();
    const currentTime = now.toTimeString().split(' ')[0]; // 'HH:MM:SS'
    const currentDay = now.getDay();

    const { data, error } = await supabase
        .from('venue_schedules')
        .select('*')
        .eq('venue_id', venueId)
        .eq('is_active', true)
        .contains('day_of_week', [currentDay])
        .lte('start_time', currentTime)
        .gte('end_time', currentTime)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (error) {
        // If no rule found, return null
        return null;
    }

    return data as any as VenueSchedule;
}

export async function saveScheduleRule_Action(rule: Partial<VenueSchedule>) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('venue_schedules')
        .upsert(rule as any)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function getVenueSchedules_Action(venueId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('venue_schedules')
        .select('*')
        .eq('venue_id', venueId)
        .order('start_time', { ascending: true });

    if (error) throw error;
    return data as any[] as VenueSchedule[];
}
