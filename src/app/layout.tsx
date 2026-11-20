import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Business Plan AI Studio — Plans d'affaires professionnels",
  description:
    "Créez votre plan d'affaires professionnel en quelques étapes guidées par l'IA. Norme nord-américaine Canada & États-Unis. Moteur financier, analyse de marché, export PDF et Word.",
  keywords: "plan d'affaires, business plan, Canada, Québec, IA, intelligence artificielle, financement, PME",
  openGraph: {
    title: "Business Plan AI Studio",
    description: "Votre plan d'affaires professionnel, guidé par l'IA.",
    locale: "fr_CA",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
