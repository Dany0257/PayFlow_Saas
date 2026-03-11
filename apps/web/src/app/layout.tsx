import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { NextIntlClientProvider } from 'next-intl';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
  title: "PayFlow - Gestion de Paiements et Factures",
  description: "Plateforme SaaS de gestion de paiements et factures pour les entreprises. Créez des factures, recevez des paiements par Apple Pay, Google Pay et PayPal.",
  keywords: "facturation, paiement, facture, entreprise, SaaS, Apple Pay, Google Pay, PayPal",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'fr';

  let messages;
  try {
    messages = (await import(`../messages/${locale}.json`)).default;
  } catch (err) {
    messages = (await import(`../messages/fr.json`)).default;
  }

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
