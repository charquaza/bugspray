import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Bug Tracker',
  authors: [ { name: 'Jonathan Park' } ],
  description: 'Bug tracker created using create-next-app',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en-US">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
