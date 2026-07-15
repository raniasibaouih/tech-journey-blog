import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tech Journey Blog",
  description: "A fresh Next.js starter app",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
