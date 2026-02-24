export interface WeatherData {
    temp: number;
    condition: 'clear' | 'clouds' | 'rain' | 'snow' | 'thunderstorm';
    isDay: boolean;
    city?: string;
}

export const WeatherService = {
    /**
     * Resolves coordinates from a city name using Open-Meteo Geocoding API
     */
    async getCoordsFromCity(city: string): Promise<{ lat: number; lon: number } | null> {
        try {
            const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
            const data = await res.json();
            if (data.results && data.results.length > 0) {
                return {
                    lat: data.results[0].latitude,
                    lon: data.results[0].longitude
                };
            }
            return null;
        } catch (e) {
            console.error('Geocoding Error:', e);
            return null;
        }
    },

    /**
     * Resolves coordinates from an IP address
     */
    async getCoordsFromIP(ip: string): Promise<{ lat: number; lon: number; city: string } | null> {
        try {
            const res = await fetch(`https://freeipapi.com/api/json/${ip === '::1' || ip === '127.0.0.1' ? '' : ip}`);
            if (!res.ok) return null;
            const data = await res.json();
            if (data.latitude && data.longitude) {
                return {
                    lat: data.latitude,
                    lon: data.longitude,
                    city: data.cityName || 'Unknown'
                };
            }
            return null;
        } catch (e) {
            console.error('IP Geolocation Error:', e);
            return null;
        }
    },

    /**
     * Fetches current weather for a location. 
     */
    async getCurrentWeather(lat: number | undefined, lon: number | undefined): Promise<WeatherData | null> {
        if (lat === undefined || lon === undefined) return null;
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
