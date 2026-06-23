import type { Metadata } from 'next'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Topaz Builder',
    template: '%s | Topaz Builder',
  },
  description: 'Investment offer generator for Topaz World Group agents.',
  robots: 'noindex, nofollow', // Internal tool — not for search engines
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
