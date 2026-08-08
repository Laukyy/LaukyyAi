import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lauky AI",
  description: "AI assistant pribadi yang cerdas, tegas, dan sedikit galak.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="dark">
      <body>{children}</body>
    </html>
  );
}
