import './globals.css'
import { CartProvider } from '@/context/CartContext'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export const metadata = {
  title: 'MyStore - E-commerce Platform',
  description: 'A modern e-commerce website built with Next.js',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <CartProvider>
            {children}
          </CartProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}