'use client';
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import { usePathname } from 'next/navigation';
import { AdminHeader } from './components/AdminHeader';
import { useAuth } from './hooks/useAuth';



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
      const { admin, loading } = useAuth();
      const pathname = usePathname();

  return (
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
             {
                 admin && <AdminHeader admin={admin} canPop={pathname !== '/admin'} />
             }
    <body suppressHydrationWarning className={GeistSans.className}>{children}</body>
    </html>
  )
}
