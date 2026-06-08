import type { Metadata } from "next"
import { Geist, Geist_Mono, Montserrat, Special_Elite } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import { GlobalThemeInject } from "@/components/global-theme-inject"
import "./globals.css"

const _geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
})

const _geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
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
    "Aashish Thakur is an aspiring innovator, developer, and design thinker passionate about building technology that solves real-world problems. Currently focusing on AI-powered healthcare solutions, visual effects, and web development.",
  keywords: [
    "Aashish Thakur",
    "Director",
    "VFX Artist",
    "Web Developer",
    "UI/UX Designer",
    "AI Healthcare",
    "MediTrack+",
    "GlucoTrack+",
    "Portfolio",
    "Visual Effects"
  ],
  authors: [{ name: "Aashish Thakur" }],
  creator: "Aashish Thakur",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://aashishthakur7.com.np",
    title: "Aashish Thakur - Director & VFX Artist",
    description: "Portfolio of Aashish Thakur - Director & VFX Artist. Explore cinematic visual effects, UI/UX design, and AI-powered healthcare solutions.",
    siteName: "Aashish Thakur Portfolio",
    images: [
      {
        url: "/images/profile.webp",
        width: 1200,
        height: 900,
        alt: "Aashish Thakur Portfolio Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Aashish Thakur - Director & VFX Artist",
    description: "Explore portfolio projects in VFX, UI/UX, and AI-powered healthcare.",
    images: ["/images/profile.webp"],
    creator: "@aashishthakur",
  },
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
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Aashish Thakur",
    "url": "https://aashishthakur7.com.np",
    "jobTitle": "Director & VFX Artist",
    "sameAs": [
      "https://github.com/aashishthakurbusiness-ship-it",
      "https://www.linkedin.com/in/aashishthakurbusiness"
    ],
    "knowsAbout": [
      "Visual Effects",
      "Video Editing",
      "Web Development",
      "UI/UX Design",
      "Healthcare Technology",
      "Artificial Intelligence"
    ]
  }

  return (
    <html
      lang="en"
      className={`${_geist.variable} ${_geistMono.variable} ${_montserrat.variable} ${_specialElite.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <GlobalThemeInject />
          <ThemeToggle />
          {children}
        </ThemeProvider>

        <Analytics />
      </body>
    </html>
  )
}