import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: "MHAO - Marketplace Habitat Afrique de l'Ouest",
  description:
    "La plateforme de référence pour la construction et la rénovation en Afrique de l'Ouest. Trouvez les meilleurs prestataires BTP à Cotonou et au Bénin.",
  keywords: ['construction', 'BTP', 'Bénin', 'Cotonou', 'prestataires', 'travaux', 'habitat'],
  openGraph: {
    title: "MHAO - Marketplace Habitat Afrique de l'Ouest",
    description: "Connectez-vous avec les meilleurs prestataires BTP au Bénin",
    locale: 'fr_FR',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={inter.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
