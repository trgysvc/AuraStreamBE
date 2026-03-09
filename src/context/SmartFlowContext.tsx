'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getActiveScheduleRule_Action, VenueSchedule } from '@/app/actions/scheduling';

interface SmartFlowState {
    activeRule: VenueSchedule | null;
    isAutoMode: boolean;
    setIsAutoMode: (mode: boolean) => void;
    refreshFlow: () => Promise<void>;
}

const SmartFlowContext = createContext<SmartFlowState | undefined>(undefined);

export function SmartFlowProvider({ children, venueId: initialVenueId }: { children: React.ReactNode, venueId?: string }) {
    const [activeRule, setActiveRule] = useState<VenueSchedule | null>(null);
    const [isAutoMode, setIsAutoMode] = useState<boolean>(true);
    const [venueId, setVenueId] = useState<string | undefined>(initialVenueId);
    const isInitialized = React.useRef(false);

    // Persistence for Auto Mode
    useEffect(() => {
        const savedMode = localStorage.getItem('aura_smart_flow_auto');
        if (savedMode !== null) {
            setIsAutoMode(savedMode === 'true');
        }
    }, []);

    // Auth-based venueId lookup
    useEffect(() => {
        if (initialVenueId && initialVenueId !== "default-venue") {
            setVenueId(initialVenueId);
            return;
        }

        const fetchUser = async () => {
            const { createClient } = await import('@/lib/db/client');
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                console.log(`[Smart Flow] Resolved venueId from auth: ${user.id}`);
                setVenueId(user.id);
            }
        };
        fetchUser();
    }, [initialVenueId]);

    const toggleAutoMode = useCallback((mode: boolean) => {
        setIsAutoMode(mode);
        localStorage.setItem('aura_smart_flow_auto', mode.toString());
        console.log(`[Smart Flow] Auto Mode changed to: ${mode}`);
    }, []);

    const refreshFlow = useCallback(async () => {
        if (!venueId) return;

        console.log('--- Aura Smart Flow: Evaluating Context ---');

        // 1. Fetch current active rule from DB (based on time/day)
        try {
            const rule = await getActiveScheduleRule_Action(venueId);

            if (rule) {
                console.log(`Smart Flow: Rule "${rule.name}" is now ACTIVE.`);
                setActiveRule(rule);
            } else {
                console.log('Smart Flow: No specific rule found for this time. Falling back to default Energy Curve.');
                setActiveRule(null);
            }
        } catch (error) {
            console.error('Smart Flow evaluation failed:', error);
        } finally {
            isInitialized.current = true;
        }
    }, [venueId]);

    // Auto-refresh flow every 5 minutes to catch time-based transitions
    useEffect(() => {
        if (!venueId) return;

        // Only trigger immediate refresh if not already initialized
        if (!isInitialized.current) {
            refreshFlow();
        }

        const interval = setInterval(() => {
            refreshFlow();
        }, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, [venueId, refreshFlow]);

    return (
        <SmartFlowContext.Provider value={{ activeRule, isAutoMode, setIsAutoMode: toggleAutoMode, refreshFlow }}>
            {children}
        </SmartFlowContext.Provider>
    );
}

export const useSmartFlow = () => {
    const context = useContext(SmartFlowContext);
    if (!context) throw new Error('useSmartFlow must be used within a SmartFlowProvider');
    return context;
}
