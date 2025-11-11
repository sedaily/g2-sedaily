"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X, Volume2, VolumeX, Sparkles, Eye } from "lucide-react"

interface QuizSettingsPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function QuizSettingsPanel({ isOpen, onClose }: QuizSettingsPanelProps) {
  const [animationsEnabled, setAnimationsEnabled] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [fontSize, setFontSize] = useState("medium")
  const [highContrast, setHighContrast] = useState(false)

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem("quizSettings")
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      setAnimationsEnabled(settings.animations ?? true)
      setSoundEnabled(settings.sound ?? false)
      setFontSize(settings.fontSize ?? "medium")
      setHighContrast(settings.highContrast ?? false)
    }
  }, [])

  useEffect(() => {
    // Save settings to localStorage
    const settings = {
      animations: animationsEnabled,
      sound: soundEnabled,
      fontSize,
      highContrast,
    }
    localStorage.setItem("quizSettings", JSON.stringify(settings))

    // Apply settings
    if (!animationsEnabled) {
      document.documentElement.style.setProperty("--animation-duration", "0.01ms")
    } else {
      document.documentElement.style.removeProperty("--animation-duration")
    }

    document.documentElement.setAttribute("data-font-size", fontSize)
    document.documentElement.setAttribute("data-high-contrast", highContrast.toString())
  }, [animationsEnabled, soundEnabled, fontSize, highContrast])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white p-6 relative">
        <Button onClick={onClose} variant="ghost" size="icon" className="absolute top-4 right-4" aria-label="닫기">
          <X size={20} />
        </Button>

        <h2 className="text-2xl font-bold korean-heading text-[#0c4a6e] mb-6">설정</h2>

        <div className="space-y-6">
          {/* Animations */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="text-[#0891b2]" size={20} />
              <span className="korean-text font-medium">애니메이션</span>
            </div>
            <button
              onClick={() => setAnimationsEnabled(!animationsEnabled)}
              className={`w-12 h-6 rounded-full transition-colors ${
                animationsEnabled ? "bg-[#0891b2]" : "bg-gray-300"
              }`}
              aria-label={`애니메이션 ${animationsEnabled ? "끄기" : "켜기"}`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  animationsEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Sound */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {soundEnabled ? (
                <Volume2 className="text-[#0891b2]" size={20} />
              ) : (
                <VolumeX className="text-gray-400" size={20} />
              )}
              <span className="korean-text font-medium">사운드</span>
            </div>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`w-12 h-6 rounded-full transition-colors ${soundEnabled ? "bg-[#0891b2]" : "bg-gray-300"}`}
              aria-label={`사운드 ${soundEnabled ? "끄기" : "켜기"}`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  soundEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Font Size */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Eye className="text-[#0891b2]" size={20} />
              <span className="korean-text font-medium">글자 크기</span>
            </div>
            <div className="flex gap-2">
              {["small", "medium", "large"].map((size) => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  className={`flex-1 py-2 px-4 rounded-lg korean-text transition-colors ${
                    fontSize === size ? "bg-[#0891b2] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  aria-label={`글자 크기 ${size === "small" ? "작게" : size === "medium" ? "보통" : "크게"}`}
                >
                  {size === "small" ? "작게" : size === "medium" ? "보통" : "크게"}
                </button>
              ))}
            </div>
          </div>

          {/* High Contrast */}
          <div className="flex items-center justify-between">
            <span className="korean-text font-medium">고대비 모드</span>
            <button
              onClick={() => setHighContrast(!highContrast)}
              className={`w-12 h-6 rounded-full transition-colors ${highContrast ? "bg-[#0891b2]" : "bg-gray-300"}`}
              aria-label={`고대비 모드 ${highContrast ? "끄기" : "켜기"}`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  highContrast ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Reset */}
          <Button
            onClick={() => {
              setAnimationsEnabled(true)
              setSoundEnabled(false)
              setFontSize("medium")
              setHighContrast(false)
              localStorage.removeItem("quizSettings")
            }}
            variant="outline"
            className="w-full korean-text"
          >
            기본값으로 재설정
          </Button>
        </div>
      </Card>
    </div>
  )
}
