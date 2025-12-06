import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google"; // Changed fonts
import "./globals.css";

const inter = Inter({
  variable: "--font-inter", // Changed variable name
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit", // New font for headings
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Next-Gen AI Chatbot", // Updated title
  description: "A beautiful, animated AI assistant.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${outfit.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
