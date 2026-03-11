import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export default getRequestConfig(async () => {
    const cookieStore = await cookies();
    const locale = cookieStore.get('NEXT_LOCALE')?.value || 'fr';

    try {
        const messages = (await import(`../messages/${locale}.json`)).default;
        return { locale, messages };
    } catch (error) {
        const defaultMessages = (await import(`../messages/fr.json`)).default;
        return { locale: 'fr', messages: defaultMessages };
    }
});
