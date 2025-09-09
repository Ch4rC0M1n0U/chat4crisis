import React from 'react';
import './globals.css';

export const metadata = {
  title: 'Chat4Crisis',
  description: 'Simulation de crise interactive',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-neutral-950 text-neutral-100 font-sans">{children}</body>
    </html>
  );
}
