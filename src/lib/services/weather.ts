export interface WeatherData {
    temp: number;
    condition: 'clear' | 'clouds' | 'rain' | 'snow' | 'thunderstorm';
    isDay: boolean;
}

export const WeatherService = {
    /**
     * Fetches current weather for a location. 
     * Defaulting to Istanbul coordinates for testing.
     */
    async getCurrentWeather(lat: number = 41.0082, lon: number = 28.9784): Promise<WeatherData | null> {
        try {
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
            const data = await res.json();
            
            if (!data.current_weather) return null;

            const code = data.current_weather.weathercode;
            let condition: WeatherData['condition'] = 'clear';

            if (code >= 1 && code <= 3) condition = 'clouds';
            else if (code >= 51 && code <= 67) condition = 'rain';
            else if (code >= 71 && code <= 77) condition = 'snow';
            else if (code >= 80 && code <= 99) condition = 'thunderstorm';

            return {
                temp: data.current_weather.temperature,
                condition,
                isDay: data.current_weather.is_day === 1
            };
        } catch (e) {
            console.error('Weather Service Error:', e);
            return null;
        }
    }
};
