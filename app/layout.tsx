import type { Metadata } from "next"
import { Geist, Geist_Mono, Montserrat, Special_Elite } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import "./globals.css"

const _geist = Geist({
  subsets: ["latin"],
})

const _geistMono = Geist_Mono({
  subsets: ["latin"],
})

const _montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
})

const _specialElite = Special_Elite({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-typewriter",
})

export const metadata: Metadata = {
  title: "Aashish Thakur - Director & VFX Artist",
  description:
    "Aashish Thakur is an innovator, developer, and design thinker passionate about building technology that solves real-world problems.",

  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },

  metadataBase: new URL("https://aashishthakur7.com.np"),
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${_montserrat.variable} ${_specialElite.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ThemeToggle />
          {children}
        </ThemeProvider>

        <Analytics />
      </body>
    </html>
  )
}