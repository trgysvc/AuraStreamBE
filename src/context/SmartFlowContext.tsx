'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getActiveScheduleRule_Action, VenueSchedule } from '@/app/actions/scheduling';

interface SmartFlowState {
    activeRule: VenueSchedule | null;
    isAutoMode: boolean;
    refreshFlow: () => Promise<void>;
}

const SmartFlowContext = createContext<SmartFlowState | undefined>(undefined);

export function SmartFlowProvider({ children, venueId }: { children: React.ReactNode, venueId?: string }) {
    const [activeRule, setActiveRule] = useState<VenueSchedule | null>(null);
    const isAutoMode = true;

    const refreshFlow = useCallback(async () => {
        if (!venueId) return;
        
        console.log('--- Aura Smart Flow: Evaluating Context ---');
        
        // 1. Fetch current active rule from DB (based on time/day)
        const rule = await getActiveScheduleRule_Action(venueId);
        
        if (rule) {
            console.log(`Smart Flow: Rule "${rule.name}" is now ACTIVE.`);
            setActiveRule(rule);
        } else {
            console.log('Smart Flow: No specific rule found for this time. Falling back to default Energy Curve.');
            setActiveRule(null);
        }
    }, [venueId]);

    // Auto-refresh flow every 5 minutes to catch time-based transitions
    useEffect(() => {
        if (!venueId) return;
        refreshFlow();
        const interval = setInterval(refreshFlow, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [venueId, refreshFlow]);

    return (
        <SmartFlowContext.Provider value={{ activeRule, isAutoMode, refreshFlow }}>
            {children}
        </SmartFlowContext.Provider>
    );
}

export const useSmartFlow = () => {
    const context = useContext(SmartFlowContext);
    if (!context) throw new Error('useSmartFlow must be used within a SmartFlowProvider');
    return context;
}
