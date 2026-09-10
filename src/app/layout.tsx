import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ahmad Saufi | Software & AI Engineer',
  description: 'Ahmad Saufi — Software & AI Engineer based in Malaysia. RAG pipelines, agentic AI, full-stack web apps, cloud infrastructure & DevOps.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
