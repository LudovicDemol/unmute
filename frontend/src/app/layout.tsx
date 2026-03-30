
import type { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";
import ConsentModal from "../components/ConsentModal";

export const metadata: Metadata = {
  title: "Unmute by Kyutai",
  description: "Make LLMs listen and speak.",
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
      <body>
        <div className="flex min-h-screen w-full bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30 overflow-hidden relative">
          {/* Glow top bar */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500/30 via-blue-500/60 to-blue-500/30 blur-lg pointer-events-none z-50" />
          {/* Main content */}
          <div className="flex flex-1 w-full h-full">
            {children}
          </div>
          <ConsentModal />
        </div>
      </body>
    </html>
  );
}
