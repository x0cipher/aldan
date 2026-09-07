import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aldan | Stateful & Adaptive AI Platform",
  description:
    "Next-generation stateful AI platform and adaptive coding agent harness powered by Google Gemini and Vercel AI SDK.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full">
      <body className="h-full bg-zinc-950 text-zinc-100 font-sans antialiased selection:bg-emerald-500/30">
        {children}
      </body>
    </html>
  );
}
