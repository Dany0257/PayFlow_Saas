'use client';

import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';

export function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();

    const handleLocaleChange = (newLocale: string) => {
        document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
        router.refresh();
    };

    return (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
                onClick={() => handleLocaleChange('fr')}
                style={{
                    background: locale === 'fr' ? 'var(--primary)' : 'transparent',
                    color: locale === 'fr' ? 'white' : 'var(--text)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: locale === 'fr' ? 600 : 400
                }}
            >
                FR
            </button>
            <button
                onClick={() => handleLocaleChange('en')}
                style={{
                    background: locale === 'en' ? 'var(--primary)' : 'transparent',
                    color: locale === 'en' ? 'white' : 'var(--text)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: locale === 'en' ? 600 : 400
                }}
            >
                EN
            </button>
        </div>
    );
}
