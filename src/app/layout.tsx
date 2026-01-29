import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/Navbar'
import { baseMetadata } from '@/lib/metadata'
import { viewport } from '@/lib/viewport'
import { ToastProvider } from '@/components/Toast'
import { ConditionalNavbar } from '@/components/ConditionalNavbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = baseMetadata
export { viewport }

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className="dark">
      <body className={`${inter.className} bg-black text-white`}>
        <ToastProvider>
          <ConditionalNavbar />
          <main className="min-h-screen">{children}</main>
        </ToastProvider>
      </body>
    </html>
  )
}
