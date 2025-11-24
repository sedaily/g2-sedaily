'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { clearAllCaches, clearGameCaches, cleanupOldCaches, getCacheStatus } from '@/lib/cache-manager'

export function CacheManager() {
  const [cacheStatus, setCacheStatus] = useState<{
    clientCacheSize: number
    clientCacheKeys: string[]
  } | null>(null)

  const refreshCacheStatus = () => {
    const status = getCacheStatus()
    setCacheStatus(status)
  }

  const handleClearAll = () => {
    clearAllCaches()
    refreshCacheStatus()
    alert('모든 캐시가 초기화되었습니다.')
  }

  const handleClearGame = (gameType: string) => {
    clearGameCaches(gameType)
    refreshCacheStatus()
    alert(`${gameType} 캐시가 초기화되었습니다.`)
  }

  const handleCleanup = () => {
    cleanupOldCaches()
    refreshCacheStatus()
    alert('오래된 캐시가 정리되었습니다.')
  }

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">캐시 관리</h2>
      
      {/* 캐시 상태 */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-2">
          <h3 className="font-semibold">캐시 상태</h3>
          <Button onClick={refreshCacheStatus} variant="outline" size="sm">
            새로고침
          </Button>
        </div>
        
        {cacheStatus ? (
          <div className="text-sm text-gray-600">
            <p>클라이언트 캐시: {cacheStatus.clientCacheSize}개 항목</p>
            {cacheStatus.clientCacheKeys.length > 0 && (
              <details className="mt-2">
                <summary className="cursor-pointer">캐시 키 목록</summary>
                <ul className="mt-1 ml-4 text-xs">
                  {cacheStatus.clientCacheKeys.map(key => (
                    <li key={key} className="font-mono">{key}</li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500">상태를 확인하려면 새로고침을 클릭하세요.</p>
        )}
      </div>

      {/* 캐시 관리 버튼들 */}
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">전체 캐시 관리</h3>
          <div className="flex gap-2">
            <Button onClick={handleClearAll} variant="destructive">
              모든 캐시 초기화
            </Button>
            <Button onClick={handleCleanup} variant="outline">
              오래된 캐시 정리
            </Button>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">게임별 캐시 관리</h3>
          <div className="flex gap-2 flex-wrap">
            <Button 
              onClick={() => handleClearGame('BlackSwan')} 
              variant="outline"
              size="sm"
            >
              BlackSwan 캐시 초기화
            </Button>
            <Button 
              onClick={() => handleClearGame('PrisonersDilemma')} 
              variant="outline"
              size="sm"
            >
              PrisonersDilemma 캐시 초기화
            </Button>
            <Button 
              onClick={() => handleClearGame('SignalDecoding')} 
              variant="outline"
              size="sm"
            >
              SignalDecoding 캐시 초기화
            </Button>
          </div>
        </div>
      </div>

      {/* 사용법 안내 */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold mb-2">사용법</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• <strong>모든 캐시 초기화</strong>: 서버/클라이언트 모든 캐시 삭제</li>
          <li>• <strong>오래된 캐시 정리</strong>: 만료된 캐시만 삭제</li>
          <li>• <strong>게임별 캐시 초기화</strong>: 특정 게임의 캐시만 삭제</li>
        </ul>
      </div>
    </Card>
  )
}