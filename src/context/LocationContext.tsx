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
        if (typeof window === 'undefined') return;
        // Automatically fetch IP-based location on mount (no permission needed)
        // Precise location will be requested manually later
        fetchIPLocation();
    }, []);

    const fetchIPLocation = async () => {
        // Skip IP fetch on localhost to avoid CORS/Rate-limit console clutter during development
        if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
            setState(s => ({ ...s, loading: false, city: 'Local Development' }));
            return;
        }

        try {
            // Using freeipapi.com as it's more permissive for production
            const res = await fetch('https://freeipapi.com/api/json');
            if (!res.ok) throw new Error('Fetch failed');
            const data = await res.json();
            setState({
                lat: data.latitude || null,
                lon: data.longitude || null,
                city: data.cityName || 'Your Location',
                loading: false,
                error: null
            });
        } catch (e) {
            // Silently fail to avoid console clutter. 
            setState(s => ({ ...s, loading: false }));
        }
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
