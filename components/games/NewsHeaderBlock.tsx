import Image from "next/image"

type NewsHeaderBlockProps = {
  logoSrc: string
  siteUrl: string
  headline: string
  lede: string
  themeStyles: {
    paperBg: string
    inkColor: string
    accentColor: string
    accentText: string
    hairline: string
  }
}

export function NewsHeaderBlock({ logoSrc, siteUrl, headline, lede, themeStyles }: NewsHeaderBlockProps) {
  return (
    <div className="space-y-4">
      <div className="mb-5 flex justify-center">
        <Image
          src={logoSrc || "/placeholder.svg"}
          alt="서울경제 로고"
          width={480}
          height={120}
          className="h-24 w-auto"
          loading="lazy"
        />
      </div>

      <div
        className="w-full py-2.5 text-white text-center font-bold tracking-wide"
        style={{
          backgroundColor: themeStyles.accentColor,
          fontFamily: "var(--font-news-meta)",
        }}
      >
        {siteUrl}
      </div>

      <div className="h-px w-full border-t-2 border-dotted" style={{ borderColor: themeStyles.accentColor }} />

      <h2
        className="text-3xl md:text-4xl lg:text-5xl font-black leading-snug whitespace-pre-line mt-8 mb-4"
        style={{
          color: themeStyles.inkColor,
          fontFamily: "var(--font-news-headline)",
          letterSpacing: "-0.5px",
        }}
      >
        {headline}
      </h2>

      <p
        className="text-base md:text-lg leading-relaxed whitespace-pre-line mb-8 opacity-90"
        style={{
          color: themeStyles.inkColor,
          fontFamily: "var(--font-news-body)",
        }}
      >
        {lede}
      </p>

      <div
        className="h-px w-full border-t-2 border-dotted opacity-70"
        style={{ borderColor: themeStyles.accentColor }}
      />
    </div>
  )
}
