import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";

const figtreeFont = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Text Roulette",
  description: "Create your custom wheel of fortune",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${figtreeFont.variable} ${figtreeFont.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
