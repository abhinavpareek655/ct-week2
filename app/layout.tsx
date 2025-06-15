import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'to-do app',
  description: 'everyday tasks tracker',
  generator: 'Next.js',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
