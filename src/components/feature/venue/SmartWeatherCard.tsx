'use client';

import React, { useEffect, useState } from 'react';
import { useLocation } from '@/context/LocationContext';
import { getWeather_Action, WeatherData } from '@/app/actions/weather';
import { Sun, CloudRain, MapPin, Loader2 } from 'lucide-react';

export function SmartWeatherCard() {
    const location = useLocation();
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWeather = async () => {
            if (location.lat && location.lon) {
                const data = await getWeather_Action(location.lat, location.lon);
                setWeather(data);
                setLoading(false);
            }
        };

        if (!location.loading) {
            fetchWeather();
        }
    }, [location]);

    if (loading || location.loading) {
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
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic">Atmospheric Context</p>
                    <div className="flex items-center gap-1.5 text-indigo-400">
                        <MapPin size={10} />
                        <span className="text-[9px] font-black uppercase tracking-widest">{location.city}</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 bg-white/5 rounded-2xl flex items-center justify-center text-white border border-white/10 shadow-inner">
                        {weather?.condition === 'clear' ? <Sun size={28} /> : <CloudRain size={28} />}
                    </div>
                    <div>
                        <h4 className="text-2xl font-black text-white italic uppercase">{weather?.condition || 'Clear'}</h4>
                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-tighter">{weather?.temp || '0'}°C Ambient</p>
                    </div>
                </div>
                <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                    Aura is optimizing the acoustic frequency for <span className="text-indigo-400 font-bold">{location.city}</span>. Current setting: <span className="text-white font-bold">{weather?.condition === 'clear' ? 'Vibrant (528Hz)' : 'Calm (432Hz)'}</span>.
                </p>
            </div>
        </div>
    );
}
