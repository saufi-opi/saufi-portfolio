import type { Metadata } from 'next'
import { Space_Grotesk, Inter } from 'next/font/google'
import { getPayload } from 'payload'
import config from '../../payload.config'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import ScrollReveal from '@/components/ScrollReveal'
import { getSettings } from '@/lib/data'
import '../globals.css'

const display = Space_Grotesk({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-display-ff' })
const body = Inter({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-body-ff' })

export async function generateMetadata(): Promise<Metadata> {
  try {
    const s = await getSettings()
    const og = s?.ogImage && typeof s.ogImage === 'object' ? (s.ogImage as { url?: string }).url : undefined
    return {
      metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'https://saufi.loxikum.xyz'),
      title: s?.metaTitle || 'Ahmad Saufi | Software & AI Engineer',
      description: s?.metaDescription || undefined,
      openGraph: {
        title: s?.metaTitle || 'Ahmad Saufi | Software & AI Engineer',
        description: s?.metaDescription || undefined,
        images: og ? [{ url: og }] : undefined,
        type: 'website',
        url: process.env.NEXT_PUBLIC_SERVER_URL || 'https://saufi.loxikum.xyz',
      },
      twitter: {
        card: 'summary_large_image',
        title: s?.metaTitle || undefined,
        description: s?.metaDescription || undefined,
        images: og ? [og] : undefined,
      },
    }
  } catch {
    return { title: 'Ahmad Saufi | Software & AI Engineer' }
  }
}

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <div className="grain" aria-hidden="true" />
        <ScrollReveal />
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  )
}
