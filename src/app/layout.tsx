import type { Metadata } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const cormorantSerif = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Chochete | Handcrafted Zodiac & Birth Flower Accessories",
  description: "Discover premium, custom zodiac and birth-flower inspired bracelets, earrings, anklets, and gift boxes. Handmade with intention, storytelling, and love.",
  keywords: "zodiac jewelry, birth flower accessories, customized gifts, handmade threads, celestial earrings, handmade bracelet",
  openGraph: {
    title: "Chochete | Handcrafted Zodiac & Birth Flower Accessories",
    description: "Discover premium, custom zodiac and birth-flower inspired bracelets, earrings, anklets, and gift boxes. Handmade with love.",
    type: "website",
    locale: "en_IN",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorantSerif.variable} ${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans cosmic-grain">
        {/* Skip to Content for Accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-accent text-accent-foreground px-4 py-2 rounded-md z-50 font-medium"
        >
          Skip to main content
        </a>
        <main id="main-content" className="flex-grow flex flex-col relative z-10">
          {children}
        </main>
      </body>
    </html>
  );
}
