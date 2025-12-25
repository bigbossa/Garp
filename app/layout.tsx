import type { Metadata } from 'next'
import { Prompt } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

const prompt = Prompt({ 
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: 'ระบบพล็อตกราฟแปลงที่',
  description: 'Created with v0',
  icons: {
    icon: [
      {
        url: '/icon.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.png',
        type: 'image/png',
      },
    ],
    apple: '/icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="th">
      <body className={`${prompt.className} antialiased`}>
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
