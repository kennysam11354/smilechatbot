import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" style={{ background: 'transparent' }} className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <head>
        <style>{`
          html, body {
            background: transparent !important;
            margin: 0;
            padding: 0;
            overflow: hidden;
          }
        `}</style>
      </head>
      <body style={{ background: 'transparent', margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
