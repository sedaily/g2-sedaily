type NewsHeaderBlockProps = {
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

export function NewsHeaderBlock({ headline, lede, themeStyles }: NewsHeaderBlockProps) {
  return (
    <div className="space-y-4">
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
