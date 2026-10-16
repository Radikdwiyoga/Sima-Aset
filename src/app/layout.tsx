import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'SIM ASET TERPADU - Sistem Informasi Manajemen Aset Perusahaan',
  description: 'Pengelolaan aset terpadu IT, Rumah Tangga Kantor, Elektronik, dan Furnitur dengan barcode & QR Code otomatis.',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-[#F8FAFC] antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
