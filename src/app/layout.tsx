import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://fluxqr.app'),
  title: {
    default: 'FluxQR — Smart QR Links for Messaging',
    template: '%s — FluxQR',
  },
  description: 'Create QR codes that open WhatsApp and SMS with pre-filled messages.',
  icons: {
    apple: [{ url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' }],
  },
  appleWebApp: {
    capable: true,
    title: 'FluxQR',
    statusBarStyle: 'black-translucent',
  },
  openGraph: {
    siteName: 'FluxQR',
    type: 'website',
  },
  twitter: {
    card: 'summary',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} dark`}>
      <body className="bg-surface text-slate-200 font-sans antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
