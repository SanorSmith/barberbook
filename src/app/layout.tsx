import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SessionManager from "@/components/SessionManager";
import AccessDeniedAlert from "@/components/AccessDeniedAlert";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "BarberBook - Premium Grooming",
  description: "Premium grooming experience for the modern gentleman",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BarberBook",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "BarberBook",
    title: "BarberBook - Premium Grooming",
    description: "Premium grooming experience for the modern gentleman",
  },
  twitter: {
    card: "summary",
    title: "BarberBook - Premium Grooming",
    description: "Premium grooming experience for the modern gentleman",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-obsidian text-cream selection:bg-gold selection:text-obsidian`}
      >
        <SessionManager />
        <AccessDeniedAlert />
        <Navbar />
        <main className="min-h-screen pt-20">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
