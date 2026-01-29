import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/Navbar'
import { baseMetadata } from '@/lib/metadata'
import { viewport } from '@/lib/viewport'
import { ToastProvider } from '@/components/Toast'

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
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <footer className="bg-black border-t border-gray-900 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center text-sm text-gray-500">
                <p>&copy; {new Date().getFullYear()} SportPlan. Tous droits réservés.</p>
              </div>
            </div>
          </footer>
        </ToastProvider>
      </body>
    </html>
  )
}
