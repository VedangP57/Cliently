import type { Metadata } from 'next'
import { AppThemeProvider } from '@/components/shared/AppThemeProvider'
import { DisableServiceWorkerInDev } from '@/components/shared/DisableServiceWorkerInDev'
import '@/app/globals.css'
import { AntdRegistry } from '@ant-design/nextjs-registry'
import { AntdThemeProvider } from '@/components/shared/AntdThemeProvider'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'Cliently — Freelance Business OS',
  description: 'The all-in-one business OS for freelancers. Manage clients, projects, proposals, contracts, time tracking, expenses, and invoices.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <DisableServiceWorkerInDev />
        <AppThemeProvider defaultTheme="system">
          <AntdRegistry>
            <AntdThemeProvider>
              {children}
            </AntdThemeProvider>
          </AntdRegistry>
        </AppThemeProvider>
      </body>
    </html>
  )
}
