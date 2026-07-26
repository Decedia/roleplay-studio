import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import DebugInitializer from "@/components/DebugInitializer";
import "./globals.css";

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
    <html lang="en" suppressHydrationWarning>
      <body
        className="antialiased font-sans"
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
