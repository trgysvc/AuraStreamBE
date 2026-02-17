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
            await fetchIPLocation();
            return;
        }

        setState(s => ({ ...s, loading: true }));

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                let city = 'Your Location';
                try {
                    const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
                    const data = await res.json();
                    city = data.city || data.locality || 'Your Location';
                } catch (e) {
                    console.error('Reverse Geocode failed');
                }

                setState({
                    lat: latitude,
                    lon: longitude,
                    city: city,
                    loading: false,
                    error: null
                });
            },
            async (error) => {
                console.warn('Geolocation denied or failed, using IP-based fallback.');
                await fetchIPLocation();
            }
        );
    };

    useEffect(() => {
        // Redundant client-side fetching removed as dashboard now uses server-side location resolution
        setState(s => ({ ...s, loading: false }));
    }, []);

    const fetchIPLocation = async () => {
        // No-op: server now handles location resolution for institutions
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
