'use server'

export interface WeatherData {
    temp: number;
    condition: 'clear' | 'clouds' | 'rain' | 'snow' | 'thunderstorm';
    isDay: boolean;
    city?: string;
}

export const getWeather_Action = async (lat: number, lon: number): Promise<WeatherData | null> => {
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
        console.error('Weather Action Error:', e);
        return null;
    }
};

export const getCityFromCoords_Action = async (lat: number, lon: number): Promise<string | null> => {
    try {
        const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
        if (!res.ok) return null;
        const data = await res.json();
        return data.city || data.locality || data.principalSubdivision || null;
    } catch (e) {
        console.error('Reverse Geocode Action Error:', e);
        return null;
    }
};
