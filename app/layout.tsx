import type { Metadata } from 'next'
import { ThemeProvider } from '@/components/shared/ThemeProvider'
import '@/app/globals.css'
import { AntdRegistry } from '@ant-design/nextjs-registry'
import { ConfigProvider } from 'antd'

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
        <AntdRegistry>
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: '#0f172a',
                fontFamily: 'Avenir LT Pro',
                borderRadius: 6,
                colorBgMask: 'rgba(0, 0, 0, 0.3)',
              },
              components: {
                Table: {
                  headerBg: '#f8fafc',
                  headerColor: '#111827',
                  headerSplitColor: 'transparent',
                  cellPaddingBlock: 12,
                  cellPaddingBlockSM: 8,
                },
              },
            }}
          >
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
              nonce=""
            >
              {children}
            </ThemeProvider>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  )
}
