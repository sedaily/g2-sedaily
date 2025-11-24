/**
 * 퀴즈 테마 스타일 정의
 * 게임별 색상과 스타일 관리
 */

export type GameType = "BlackSwan" | "PrisonersDilemma" | "SignalDecoding"

export type ThemeStyles = {
  paperBg: string
  inkColor: string
  accentColor: string
  accentText: string
  hairline: string
  badgeBg: string
  badgeText: string
  correctBorder: string
  incorrectBorder: string
  buttonBg: string
  buttonText: string
  explanationBg: string
  explanationAccent: string
}

export type AccentColors = {
  border: string
  hover: string
  hex: string
}

export const ACCENT_COLORS: Record<GameType, AccentColors> = {
  BlackSwan: { 
    border: "border-[#244961]", 
    hover: "hover:border-[#244961]", 
    hex: "#244961" 
  },
  PrisonersDilemma: { 
    border: "border-[#8B5E3C]", 
    hover: "hover:border-[#8B5E3C]", 
    hex: "#8B5E3C" 
  },
  SignalDecoding: { 
    border: "border-[#DB6B5E]", 
    hover: "hover:border-[#DB6B5E]", 
    hex: "#DB6B5E" 
  },
}

export function getThemeStyles(gameType: GameType): ThemeStyles {
  switch (gameType) {
    case "BlackSwan":
      return {
        paperBg: "bg-[#EDEDE9]",
        inkColor: "text-[#0F2233]",
        accentColor: "#244961",
        accentText: "text-[#244961]",
        hairline: "border-[#C9C2B0]",
        badgeBg: "bg-[#244961]/10 border-[#244961]/30",
        badgeText: "text-[#0F2233]",
        correctBorder: "border-[#244961]",
        incorrectBorder: "border-[#DC2626]",
        buttonBg: "bg-[#0F2233] hover:bg-[#244961]",
        buttonText: "text-white",
        explanationBg: "bg-[#244961]/5 border-[#244961]/20",
        explanationAccent: "border-l-[#244961]",
      }
    case "PrisonersDilemma":
      return {
        paperBg: "bg-[#F5F1E6]",
        inkColor: "text-[#3B3128]",
        accentColor: "#8B5E3C",
        accentText: "text-[#8B5E3C]",
        hairline: "border-[#C0B6A4]",
        badgeBg: "bg-[#8B5E3C]/10 border-[#8B5E3C]/30",
        badgeText: "text-[#3B3128]",
        correctBorder: "border-[#8B5E3C]",
        incorrectBorder: "border-[#DC2626]",
        buttonBg: "bg-[#8B5E3C] hover:bg-[#78716C]",
        buttonText: "text-white",
        explanationBg: "bg-[#8B5E3C]/5 border-[#8B5E3C]/20",
        explanationAccent: "border-l-[#8B5E3C]",
      }
    case "SignalDecoding":
      return {
        paperBg: "bg-[#EDEDE9]",
        inkColor: "text-[#184E77]",
        accentColor: "#DB6B5E",
        accentText: "text-[#DB6B5E]",
        hairline: "border-[#C9C2B0]",
        badgeBg: "bg-[#DB6B5E]/10 border-[#DB6B5E]/30",
        badgeText: "text-[#184E77]",
        correctBorder: "border-[#DB6B5E]",
        incorrectBorder: "border-[#DC2626]",
        buttonBg: "bg-[#184E77] hover:bg-[#DB6B5E]",
        buttonText: "text-white",
        explanationBg: "bg-[#DB6B5E]/5 border-[#DB6B5E]/20",
        explanationAccent: "border-l-[#DB6B5E]",
      }
  }
}