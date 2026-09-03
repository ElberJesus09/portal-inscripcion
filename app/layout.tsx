import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'Validación de pago | Centro Pre Universitario UNPRG',
  description:
    'Valida tu pago y continúa con la inscripción al Centro Pre Universitario Juan Francisco Aguinaga Castro.',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16' },
      { url: '/favicon-32x32.png', sizes: '32x32' },
    ],
    apple: '/favicon-180x180.png',
  },
  openGraph: {
    title: 'Validación de pago',
    description: 'Centro Pre Universitario · UNPRG',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Validación de pago del Centro Pre Universitario UNPRG' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Validación de pago',
    description: 'Centro Pre Universitario · UNPRG',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
