
import type { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";
import ConsentModal from "../components/ConsentModal";
import EcosSidebar from "@/components/EcosSideBar";

export const metadata: Metadata = {
  title: "ECOS Trainer",
  description: "A training tool for the ECOS assistant, designed to help healthcare professionals practice and improve their communication skills in a safe and controlled environment.",
};


// Utilise Inter ou Geist pour la DA
const inter = localFont({
  src: [
    {
      path: "../assets/fonts/Satoshi-Variable.woff2",
      weight: "300 900",
      style: "normal",
    },
    {
      path: "../assets/fonts/Satoshi-VariableItalic.woff2",
      weight: "300 900",
      style: "italic",
    },
  ],
  variable: "--font-inter",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        {/* Needed for debugging JSON styling */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/pretty-print-json@3.0/dist/css/pretty-print-json.dark-mode.css"
        />
        {/* Inter & JetBrains Mono fonts CDN */}
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=JetBrains+Mono:wght@400;700&display=swap" />
      </head>
       <body className="bg-slate-50 antialiased">
        <div className="flex min-h-screen">
          <EcosSidebar />
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
