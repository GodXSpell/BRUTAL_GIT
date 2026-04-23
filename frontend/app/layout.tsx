import type { Metadata } from "next";
import "./globals.css";
import { ConditionalHeader } from "@/components/ConditionalHeader";
import { ConditionalFooter } from "@/components/ConditionalFooter";

export const metadata: Metadata = {
  title: "BRUTAL_GIT - CODE. COMMIT. REPEAT.",
  description: "The unyielding platform for developers who build hard, ship fast, and don't compromise.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com" rel="preconnect"/>
        <link crossOrigin="anonymous" href="https://fonts.gstatic.com" rel="preconnect"/>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&amp;family=Space+Grotesk:wght@700&amp;display=swap" rel="stylesheet"/>
      </head>
      <body className="bg-background text-on-background font-body-md text-body-md min-h-screen flex flex-col antialiased">
        <ConditionalHeader />
        <main className="flex-grow flex flex-col w-full mx-auto">
          {children}
        </main>
        <ConditionalFooter />
      </body>
    </html>
  );
}
