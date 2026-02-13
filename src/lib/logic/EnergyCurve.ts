import { WeatherService, WeatherData } from '../services/weather';

export const EnergyCurve = {
    /**
     * Determines the optimal frequency based on Turkey time and weather
     */
    async getSmartTuning(lat?: number, lon?: number): Promise<'440hz' | '432hz' | '528hz'> {
        const hour = new Date().getHours();
        const weather = await WeatherService.getCurrentWeather(lat, lon);

        // 1. Weather Awareness
        if (weather) {
            // If it's rainy or stormy, prefer 432Hz (Healing/Calm) regardless of time
            if (weather.condition === 'rain' || weather.condition === 'thunderstorm') {
                return '432hz';
            }
            // If it's a bright sunny morning, prefer 528Hz (Awakening)
            if (weather.isDay && weather.condition === 'clear' && hour < 12) {
                return '528hz';
            }
        }

        // 2. Default Biorhythm Logic
        // Morning (06:00 - 10:00): 528Hz (Repair & Awakening)
        if (hour >= 6 && hour < 10) return '528hz';
        
        // Day (10:00 - 18:00): 440Hz (Standard Focus)
        if (hour >= 10 && hour < 18) return '440hz';
        
        // Evening/Night (18:00 - 06:00): 432Hz (Relaxation & Healing)
        return '432hz';
    },

    /**
     * Legacy support for sync calls
     */
    getFrequencyForTime(hour: number): '440hz' | '432hz' | '528hz' {
        if (hour >= 6 && hour < 10) return '528hz';
        if (hour >= 10 && hour < 18) return '440hz';
        return '432hz';
    },

    getCurrentTuning(): '440hz' | '432hz' | '528hz' {
        const hour = new Date().getHours();
        return this.getFrequencyForTime(hour);
    }
};
