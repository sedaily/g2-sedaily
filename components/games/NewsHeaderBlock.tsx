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
    <div className="space-y-2">
      <div className="h-px w-full border-t-2 border-dotted" style={{ borderColor: themeStyles.accentColor }} />

      <h2
        className="text-lg md:text-xl font-bold leading-tight whitespace-pre-line mt-3 mb-2"
        style={{
          color: themeStyles.inkColor,
          fontFamily: "var(--font-news-headline)",
          letterSpacing: "-0.3px",
        }}
      >
        {headline}
      </h2>

      <p
        className="text-sm md:text-base leading-relaxed whitespace-pre-line mb-3 opacity-80"
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
