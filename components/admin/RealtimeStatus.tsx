"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff } from "lucide-react"

export function RealtimeStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch('/api/admin/metrics', {
          method: 'HEAD',
          cache: 'no-store'
        })
        setIsOnline(response.ok)
        if (response.ok) {
          setLastUpdate(new Date())
        }
      } catch {
        setIsOnline(false)
      }
    }

    checkConnection()
    const interval = setInterval(checkConnection, 30000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center gap-2">
      {isOnline ? (
        <>
          <Wifi className="h-4 w-4 text-green-600" />
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            실시간 연결
          </Badge>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 text-red-600" />
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            연결 끊김
          </Badge>
        </>
      )}
      <span className="text-xs text-muted-foreground">
        {lastUpdate.toLocaleTimeString('ko-KR')}
      </span>
    </div>
  )
}
