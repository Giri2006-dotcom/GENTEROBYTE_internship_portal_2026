import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/context/AuthContext';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: 'Gentrobyte Internship Application',
  description: 'Apply for Gentrobyte Internship 2026 — Build, Learn, Achieve with real-world projects.',
  keywords: 'gentrobyte internship, gentrobyte apply, software engineering internship, tech internship 2026',
  authors: [{ name: 'Gentrobyte' }],
  openGraph: {
    title: 'Gentrobyte Internship Application',
    description: 'Apply for Gentrobyte Internship 2026 — Build, Learn, Achieve with real-world projects.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="font-sans antialiased bg-gradient-to-b from-white via-white to-navy-50 overflow-x-hidden">
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
