import type { Metadata } from 'next';
import './globals.css';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'CardCodex — Yu-Gi-Oh! Card Catalog', template: '%s | CardCodex' },
  description: 'Complete Yu-Gi-Oh! card catalog with rulings and detailed information.',
  openGraph: {
    siteName: 'CardCodex',
    type: 'website',
    images: ['/showcase.png'],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/showcase.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
