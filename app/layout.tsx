// app/layout.tsx
import { Inter } from 'next/font/google';
import './globals.css'; // Tailwind の globals.css

// Google Fonts を読み込む
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter', // CSS変数として使用したい場合
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
