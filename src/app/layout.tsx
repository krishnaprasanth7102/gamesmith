
import type {Metadata, Viewport} from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';
import { Toaster } from '@/components/ui/toaster';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};


export const metadata: Metadata = {
  title: {
    default: 'GAMESMITH | AI FORGE',
    template: '%s | GAMESMITH'
  },
  description: 'The professional standard for AI-assisted game development. Generate visual blueprints, access high-fidelity 3D assets, and scale your game development with tactical AI tools.',
  keywords: ['Game Development', 'AI Blueprints', 'Unreal Engine AI', '3D Assets', 'Game Design Tools', 'Next-Gen Game Dev', 'GameSmith'],
  authors: [{ name: 'GameSmith Multiverse' }],
  creator: 'GameSmith',
  publisher: 'GameSmith',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://gamesmith.ai'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'GAMESMITH // AI-Powered Developer Arsenal',
    description: 'Forge next-gen game mechanics with AI-driven blueprints and high-fidelity assets.',
    url: 'https://gamesmith.ai',
    siteName: 'GAMESMITH',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'GameSmith - Professional AI Game Dev Tools',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GAMESMITH // AI-Powered Developer Arsenal',
    description: 'The professional standard for AI-assisted game development.',
    images: ['/logo.png'],
    creator: '@GameSmithAI',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-black text-white selection:bg-red-600 selection:text-white">
        <div className="scanline" />
        <Providers>
          {children}
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
