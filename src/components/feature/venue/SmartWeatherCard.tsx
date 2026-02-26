'use client';

import React, { useEffect, useState } from 'react';
import { useLocation } from '@/context/LocationContext';
import { getWeather_Action, getCityFromCoords_Action, WeatherData } from '@/app/actions/weather';
import { Sun, CloudRain, MapPin, Loader2, Cloud, Snowflake, CloudLightning, CloudDrizzle, CloudFog } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface SmartWeatherCardProps {
    initialWeather?: WeatherData | null;
    initialCity?: string | null;
}

export function SmartWeatherCard({ initialWeather, initialCity }: SmartWeatherCardProps) {
    const location = useLocation();
    const t = useTranslations('Dashboard.weather');
    const [weather, setWeather] = useState<WeatherData | null>(initialWeather || null);
    const [loading, setLoading] = useState(!initialWeather);
    const [displayCity, setDisplayCity] = useState<string>(initialCity || location.city || t('location_fallback'));

    useEffect(() => {
        const fetchPreciseData = async () => {
            // Priority 1: High-precision location from browser sensors
            if (location.lat && location.lon) {
                setLoading(true);
                try {
                    // Resolve city name from coordinates
                    const [city, weatherData] = await Promise.all([
                        getCityFromCoords_Action(location.lat, location.lon),
                        getWeather_Action(location.lat, location.lon)
                    ]);

                    if (city) setDisplayCity(city);
                    if (weatherData) setWeather(weatherData);
                } catch (e) {
                    console.error('Failed to resolve high-precision data:', e);
                } finally {
                    setLoading(false);
                }
            } else if (!location.loading && !weather) {
                // Priority 2: Fallback to initial data (already handled by useState)
                setLoading(false);
            }
        };

        // Trigger detection on mount if not already precise
        if (!location.lat && !location.lon && !location.loading) {
            location.requestLocationPermission();
        }

        fetchPreciseData();
    }, [location.lat, location.lon, location.loading]);

    useEffect(() => {
        if (!initialCity && location.city) {
            setDisplayCity(location.city);
        }
    }, [location.city, initialCity]);

    if (loading || (location.loading && !weather)) {
        return (
            <div className="bg-[#1E1E22] p-8 rounded-[3rem] border border-white/5 flex items-center justify-center min-h-[200px]">
                <Loader2 className="text-indigo-500 animate-spin" size={24} />
            </div>
        );
    }

    return (
        <div className="bg-[#1E1E22] p-8 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-700 pointer-events-none">
                {weather?.condition === 'clear' ? <Sun size={200} /> : <CloudRain size={200} />}
            </div>
            <div className="space-y-6 relative z-10">
                <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic">{t('title')}</p>
                    <div className="flex items-center gap-1.5 text-indigo-400">
                        <MapPin size={10} />
                        <span className="text-[9px] font-black uppercase tracking-widest">{displayCity}</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 bg-white/5 rounded-2xl flex items-center justify-center text-white border border-white/10 shadow-inner">
                        {weather?.condition === 'clear' ? <Sun size={28} /> : <CloudRain size={28} />}
                    </div>
                    <div>
                        <h4 className="text-2xl font-black text-white italic uppercase">{weather?.condition ? t(`conditions.${weather.condition}`) : t('conditions.clear')}</h4>
                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-tighter">{t('ambient', { temp: weather?.temp || '0' })}</p>
                    </div>
                </div>
                <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                    {t.rich('optimization', {
                        cityName: displayCity,
                        city: (chunks) => <span className="text-indigo-400 font-bold">{chunks}</span>
                    })} {t.rich('current_setting', {
                        settingName: weather?.condition === 'clear' ? t('vibrant') : t('calm'),
                        setting: (chunks) => <span className="text-white font-bold">{chunks}</span>
                    })}.
                </p>
            </div>
        </div>
    );
}
