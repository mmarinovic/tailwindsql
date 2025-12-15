import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: 'TailwindSQL - SQL Queries with Tailwind Syntax',
  description: 'Like TailwindCSS, but for SQL queries in React Server Components. className your way to database queries!',
  keywords: ['SQL', 'TailwindCSS', 'React', 'Server Components', 'SQLite', 'database', 'queries', 'Next.js'],
  authors: [{ name: 'TailwindSQL' }],
  creator: 'TailwindSQL',
  metadataBase: new URL('https://tailwindsql.xyz'),
  openGraph: {
    title: 'TailwindSQL - SQL Queries with Tailwind Syntax',
    description: 'Like TailwindCSS, but for SQL queries. className your way to database queries in React Server Components!',
    siteName: 'TailwindSQL',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TailwindSQL',
    description: 'Like TailwindCSS, but for SQL queries. A fun experiment!',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="gradient-bg grid-pattern min-h-screen">
        {children}
      </body>
    </html>
  );
}

