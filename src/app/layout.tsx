import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'Duel Disk — Yu-Gi-Oh! Card Catalog', template: '%s | Duel Disk' },
  description: 'Complete Yu-Gi-Oh! card catalog with rulings and detailed information.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
