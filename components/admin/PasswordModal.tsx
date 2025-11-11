"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Lock } from "lucide-react"

type PasswordModalProps = {
  isOpen: boolean
  onAuthenticated: () => void
}

export function PasswordModal({ isOpen, onAuthenticated }: PasswordModalProps) {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const correctPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "sedaily2024!"

    if (password === correctPassword) {
      sessionStorage.setItem("admin_authenticated", "true")
      sessionStorage.setItem("admin_password", password)
      setError("")
      onAuthenticated()
    } else {
      setError("비밀번호가 올바르지 않습니다.")
      setPassword("")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            관리자 인증
          </DialogTitle>
          <DialogDescription>퀴즈 관리 페이지에 접근하려면 비밀번호를 입력하세요.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호 입력"
              autoFocus
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <Button type="submit" className="w-full">
            확인
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
