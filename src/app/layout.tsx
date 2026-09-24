import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://trueremittance.vercel.app"),
  title: {
    default: "TrueRemittance - Compare UAE to India Money Transfers",
    template: "%s | TrueRemittance"
  },
  description:
    "Compare AED to INR exchange rates, transfer fees and estimated recipient payout across UAE to India remittance providers.",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "TrueRemittance - Compare UAE to India Money Transfers",
    description:
      "Find the best way to send money from UAE to India by comparing exchange rates, fees and estimated INR payout.",
    url: "https://trueremittance.vercel.app/",
    siteName: "TrueRemittance",
    type: "website"
  },
  twitter: {
    card: "summary",
    title: "TrueRemittance - Compare UAE to India Money Transfers",
    description:
      "Compare UAE to India remittance providers by exchange rate, fee and estimated recipient payout."
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
