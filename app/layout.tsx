import type { Metadata } from 'next'
import { Inter, Space_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })
const spaceMono = Space_Mono({ subsets: ['latin'], weight: ["400","700"] })

export const metadata: Metadata = {
  title: 'Wizumee',
  description: 'Wizumee helps you build a 90 score resumeè.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={spaceMono.className}>{children}</body>
    </html>
  )
}
