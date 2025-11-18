import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'StoryVote - AI-Powered Collaborative Storytelling',
  description: 'Create branching narratives with friends through AI assistance, democratic voting, and collaborative creativity',
  keywords: ['storytelling', 'AI', 'collaborative', 'writing', 'creative', 'interactive'],
  authors: [{ name: 'StoryVote Team' }],
  openGraph: {
    title: 'StoryVote - Collaborative AI Storytelling',
    description: 'Create branching stories together with AI',
    type: 'website',
  },
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
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
