// app/layout.tsx
import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

export const metadata = {
  title: "Palm Management System",
  description: "Sistem Transparansi Manajemen Kebun & PKS",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={cn("font-sans", inter.variable)}>
      <body className="antialiased bg-palm-bg text-slate-800">{children}</body>
    </html>
  );
}
