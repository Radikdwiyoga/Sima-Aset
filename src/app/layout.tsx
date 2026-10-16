import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'SIM ASET TERPADU - Sistem Informasi Manajemen Aset Perusahaan',
  description: 'Pengelolaan aset terpadu IT, Rumah Tangga Kantor, Elektronik, dan Furnitur dengan barcode & QR Code otomatis.',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.png', type: 'image/png' },
      { url: '/logo-icon.png', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/logo-icon.png',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo-icon.png" />
      </head>
      <body className="min-h-screen bg-[#F8FAFC] antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
