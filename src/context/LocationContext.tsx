'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface LocationState {
    lat: number | null;
    lon: number | null;
    city: string | null;
    loading: boolean;
    error: string | null;
}

const LocationContext = createContext<LocationState | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<LocationState>({
        lat: null,
        lon: null,
        city: null,
        loading: true,
        error: null
    });

    useEffect(() => {
        if (typeof window === 'undefined') return;

        // 1. Try to get precise coordinates from Browser API
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    
                    // Optional: Reverse Geocode to get City Name
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
                (error) => {
                    console.warn('Geolocation denied or failed, using IP-based fallback.');
                    fetchIPLocation();
                }
            );
        } else {
            fetchIPLocation();
        }
    }, []);

    const fetchIPLocation = async () => {
        try {
            // Free IP-based location fallback
            const res = await fetch('https://ipapi.co/json/');
            const data = await res.json();
            setState({
                lat: data.latitude,
                lon: data.longitude,
                city: data.city,
                loading: false,
                error: null
            });
        } catch (e) {
            setState(s => ({ ...s, loading: false, error: 'Location detection failed' }));
        }
    };

    return (
        <LocationContext.Provider value={state}>
            {children}
        </LocationContext.Provider>
    );
}

export const useLocation = () => {
    const context = useContext(LocationContext);
    if (context === undefined) throw new Error('useLocation must be used within a LocationProvider');
    return context;
};
