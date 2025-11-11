import type React from "react"
import type { Metadata } from "next"
import { SedailyHeader } from "@/components/navigation/SedailyHeader"
import { Footer } from "@/components/navigation/Footer"
import "./globals.css"
import { Suspense } from "react"
import { Fraunces, Noto_Serif_KR, Inter, IBM_Plex_Mono } from "next/font/google"
// removed localFont usage for remote CDN fonts (use @font-face in globals.css instead)

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display",
  display: "swap",
})

const notoSerifKR = Noto_Serif_KR({
  subsets: ["latin"],
  weight: ["600", "700", "900"],
  variable: "--font-title-kr",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
})

// Pretendard and SpoqaHanSansNeo are loaded via CSS @font-face in `styles/globals.css`.
// next/font/local does not accept remote CDN URLs; attempting to use them causes
// Webpack to try to resolve a module like './https://...' and fail the build.

export const metadata: Metadata = {
  title: "서울경제 게임 | Seoul Economic Games",
  description:
    "하루 5분, 경제 감각을 키우는 무료 퍼즐 게임. 오늘의 경제 퀴즈, 뉴스 성향 테스트, 뉴스 단어 맞추기를 즐겨보세요.",
  keywords: ["경제 퀴즈", "뉴스 게임", "서울경제", "경제 교육", "무료 퍼즐"],
  openGraph: {
    title: "서울경제 게임",
    description: "하루 5분, 경제 감각을 키우는 무료 퍼즐 게임",
    type: "website",
    locale: "ko_KR",
    siteName: "서울경제 게임",
  },
  twitter: {
    card: "summary_large_image",
    title: "서울경제 게임",
    description: "하루 5분, 경제 감각을 키우는 무료 퍼즐 게임",
  },
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className={`${fraunces.variable} ${notoSerifKR.variable} ${inter.variable} ${ibmPlexMono.variable}`}>
      <body className="site-bg font-sans antialiased min-h-screen flex flex-col">
        <Suspense fallback={<div>Loading...</div>}>
          <SedailyHeader />
          <main className="flex-1">{children}</main>
          <Footer />
        </Suspense>
      </body>
    </html>
  )
}
