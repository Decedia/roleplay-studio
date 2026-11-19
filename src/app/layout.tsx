import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import DebugInitializer from "@/components/DebugInitializer";
import localFont from "next/font/local";
import "./globals.css";

// Self-hosted so builds never depend on fetching Google Fonts.
const literata = localFont({
  src: [
    { path: "./fonts/literata-latin.woff2", style: "normal", weight: "400 700" },
    { path: "./fonts/literata-latin-italic.woff2", style: "italic", weight: "400 700" },
  ],
  variable: "--font-literata",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Roleplay Studio",
  description: "AI-powered roleplay chat with multiple LLM providers and character import",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={literata.variable}>
      <body
        className="antialiased font-sans bg-ink"
        style={{ fontFamily: 'var(--font-sans)' }}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
          storageKey="theme-preference"
        >
          <DebugInitializer />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
