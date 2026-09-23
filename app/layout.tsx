import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "16BIT ARCADE — Uma coleção de clássicos",
  description: "Explore Super Mario, Sonic, Mortal Kombat, Street Fighter, Castlevania e Tetris com personagens interativos e gameplays.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
