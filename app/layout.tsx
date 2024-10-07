import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from "@/components/theme-provider"
import Navbar from '@/components/Navbar'
import { PatientProvider } from '@/contexts/PatientContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Mental Health Billing App',
  description: 'A comprehensive mental health billing application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <PatientProvider>
            <Navbar />
            <main className="container mx-auto px-4 py-8">
              {children}
            </main>
          </PatientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}