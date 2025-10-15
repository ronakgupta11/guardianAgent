import React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { DemoModeProvider, DemoBanner } from "@/providers/demo-mode"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Suspense } from "react"
import { Providers } from "@/components/provider"
// import { JwtProvider } from '@lit-protocol/vincent-app-sdk/react';
// import { env } from '@/lib/env';

// Environment variables are accessed through the env object

export const metadata: Metadata = {
  title: "v0 App",
  description: "Created with v0",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (

    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>
          <Providers>
          <DemoModeProvider>
            <Header />
            <DemoBanner />
            <main className="min-h-[calc(100dvh-144px)]">{children}</main>
            <Footer />
          </DemoModeProvider>
          </Providers>

        </Suspense>
        <Analytics />
      </body>
    </html>

  )
}
