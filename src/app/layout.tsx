import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import { AuthProvider } from "@/contexts/AuthContext";
import { I18nProvider } from "@/i18n/I18nProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "CeyBuild — Find Skilled Workers in Sri Lanka",
    template: "%s | CeyBuild",
  },
  description: "Connect with verified skilled workers in Sri Lanka. Find electricians, plumbers, carpenters, painters, and other construction professionals for your home services.",
  keywords: [
    "construction workers Sri Lanka",
    "skilled workers Sri Lanka",
    "electricians Sri Lanka",
    "plumbers Sri Lanka",
    "carpenters Sri Lanka",
    "painters Sri Lanka",
    "home repair services",
    "construction services",
    "find skilled workers",
    "book construction workers",
    "home services Sri Lanka",
    "AC technicians",
    "cleaning services",
    "landscaping",
    "masons",
  ],
  authors: [{ name: "CeyBuild" }],
  creator: "CeyBuild",
  publisher: "CeyBuild",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://ceybuild.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "CeyBuild — Find Skilled Workers in Sri Lanka",
    description: "Connect with verified skilled workers in Sri Lanka. Find electricians, plumbers, carpenters, painters, and other construction professionals for your home services.",
    url: "https://ceybuild.com",
    siteName: "CeyBuild",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CeyBuild — Find Skilled Workers in Sri Lanka",
    description: "Connect with verified skilled workers in Sri Lanka. Find electricians, plumbers, carpenters, painters, and other construction professionals for your home services.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased bg-background text-foreground flex flex-col min-h-screen">
        <AuthProvider>
          <I18nProvider>
            <Providers>
              <Navbar />
              <main className="flex-grow flex flex-col">
                {children}
              </main>
              <Footer />
            </Providers>
          </I18nProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
