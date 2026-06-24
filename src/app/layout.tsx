import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap"
});

export const metadata: Metadata = {
  title: "TrueRemittance",
  description: "Compare UAE to India remittance providers by recipient amount."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
