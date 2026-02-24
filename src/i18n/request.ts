import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => {
    // Valid locales list
    const locales = ['en', 'tr', 'el', 'de', 'ru', 'fr'];

    // Ensure that the incoming locale is valid, otherwise fallback to 'en'
    const validatedLocale = locale && locales.includes(locale) ? locale : 'en';

    return {
        locale: validatedLocale,
        messages: (await import(`../../messages/${validatedLocale}.json`)).default
    };
});

