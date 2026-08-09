import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {

  title: "BassirAI - AI Patient Communication Platform",
  description: "AI-powered communication platform for aesthetic clinics.",

};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-slate-950 text-white">
        {children}
      </body>
    </html>
  );
}
