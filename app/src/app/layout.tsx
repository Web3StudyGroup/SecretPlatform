import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SecretPlatform',
  description: 'Confidential Transfer Platform using Zama FHE',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <header className="bg-blue-600 text-white shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold">SecretPlatform</h1>
            <p className="text-blue-100">Confidential Transfer Platform</p>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}