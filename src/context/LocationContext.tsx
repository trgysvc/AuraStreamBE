'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface LocationState {
    lat: number | null;
    lon: number | null;
    city: string | null;
    loading: boolean;
    error: string | null;
    requestLocationPermission: () => Promise<void>;
}

const LocationContext = createContext<LocationState | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<Omit<LocationState, 'requestLocationPermission'>>({
        lat: null,
        lon: null,
        city: null,
        loading: true,
        error: null
    });

    const requestLocationPermission = async () => {
        if (typeof window === 'undefined' || !navigator.geolocation) {
            setState(s => ({ ...s, loading: false }));
            return;
        }

        setState(s => ({ ...s, loading: true }));

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setState({
                    lat: latitude,
                    lon: longitude,
                    city: 'Detecting...',
                    loading: false,
                    error: null
                });
            },
            () => {
                console.warn('Geolocation denied or failed, using account fallback.');
                setState(s => ({ ...s, loading: false }));
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    };

    useEffect(() => {
        // We no longer automatically trigger geolocation on mount to respect UX
        // The SmartWeatherCard can trigger it if needed, or it defaults to account data
        setState(s => ({ ...s, loading: false }));
    }, []);

    const fetchIPLocation = async () => {
        // Deprecated: removing IP-based guessing to avoid inaccuracy
        setState(s => ({ ...s, loading: false }));
    };

    return (
        <LocationContext.Provider value={{ ...state, requestLocationPermission }}>
            {children}
        </LocationContext.Provider>
    );
}

export const useLocation = () => {
    const context = useContext(LocationContext);
    if (context === undefined) throw new Error('useLocation must be used within a LocationProvider');
    return context;
};
