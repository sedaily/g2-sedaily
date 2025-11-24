"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Rocket, RefreshCw, Activity, Database, Globe, Zap } from "lucide-react"

export function DeployManager() {
  const [deploying, setDeploying] = useState(false)
  const [deployStatus, setDeployStatus] = useState<"idle" | "success" | "error">("idle")
  const [deployMessage, setDeployMessage] = useState("")
  const [metrics, setMetrics] = useState<any>(null)
  const [loadingMetrics, setLoadingMetrics] = useState(false)

  const fetchMetrics = async () => {
    setLoadingMetrics(true)
    try {
      const response = await fetch('/api/admin/metrics')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setMetrics(data.metrics)
        }
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error)
    } finally {
      setLoadingMetrics(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
  }, [])

  const handleDeploy = async () => {
    setDeploying(true)
    setDeployStatus("idle")
    setDeployMessage("캐시 무효화를 시작합니다...")

    try {
      const response = await fetch('/api/admin/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paths: ['/*'] })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setDeployStatus("success")
        setDeployMessage(`캐시 무효화 완료! ID: ${data.invalidationId}`)
        fetchMetrics()
      } else {
        throw new Error(data.error || '캐시 무효화 실패')
      }
    } catch (error) {
      setDeployStatus("error")
      setDeployMessage(error instanceof Error ? error.message : "오류가 발생했습니다")
    } finally {
      setDeploying(false)
    }
  }

  const handleInvalidateCache = async () => {
    try {
      const response = await fetch('/api/admin/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paths: ['/*'] })
      })

      const data = await response.json()
      if (response.ok && data.success) {
        alert(`캐시 무효화 시작! ID: ${data.invalidationId}`)
      } else {
        alert('캐시 무효화 실패')
      }
    } catch (error) {
      alert('오류 발생')
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Rocket className="h-5 w-5" />
          배포 관리
        </h2>

        <div className="space-y-4">
          <div className="flex gap-3">
            <Button 
              onClick={handleDeploy} 
              disabled={deploying}
              size="lg"
              className="flex-1"
            >
              {deploying ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  처리 중...
                </>
              ) : (
                <>
                  <Rocket className="mr-2 h-4 w-4" />
                  캐시 무효화
                </>
              )}
            </Button>

            <Button 
              onClick={handleInvalidateCache}
              variant="outline"
              size="lg"
            >
              <Zap className="mr-2 h-4 w-4" />
              캐시 무효화
            </Button>
          </div>

          {deployMessage && (
            <div className={`p-4 rounded-lg ${
              deployStatus === "success" ? "bg-green-50 text-green-800 border border-green-200" :
              deployStatus === "error" ? "bg-red-50 text-red-800 border border-red-200" :
              "bg-blue-50 text-blue-800 border border-blue-200"
            }`}>
              {deployMessage}
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Activity className="h-5 w-5" />
            시스템 상태
          </h2>
          <Button 
            onClick={fetchMetrics} 
            variant="ghost" 
            size="sm"
            disabled={loadingMetrics}
          >
            <RefreshCw className={`h-4 w-4 ${loadingMetrics ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {metrics ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Database className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">DynamoDB</span>
              </div>
              <div className="text-2xl font-bold text-blue-900">{metrics?.dynamodb?.itemCount || 0}</div>
              <div className="text-xs text-blue-700">퀴즈 아이템</div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">CloudFront</span>
              </div>
              <div className="text-2xl font-bold text-green-900">{metrics?.lambda?.invocations || 0}</div>
              <div className="text-xs text-green-700">Lambda 호출</div>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Lambda</span>
              </div>
              <div className="text-2xl font-bold text-purple-900">{metrics?.lambda?.errors || 0}</div>
              <div className="text-xs text-purple-700">Lambda 에러</div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            메트릭을 불러오는 중...
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">배포 정보</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">S3 버킷:</span>
            <Badge variant="outline">g2-frontend-ver2</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">CloudFront ID:</span>
            <Badge variant="outline">E8HKFQFSQLNHZ</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">리전:</span>
            <Badge variant="outline">us-east-1</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">웹사이트:</span>
            <a href="https://g2.sedaily.ai" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              g2.sedaily.ai
            </a>
          </div>
        </div>
      </Card>
    </div>
  )
}
