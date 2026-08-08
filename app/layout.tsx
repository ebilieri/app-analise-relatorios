import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Analise de Fundos",
  description: "Tabela de fundos com base em planilha e cache JSON"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
