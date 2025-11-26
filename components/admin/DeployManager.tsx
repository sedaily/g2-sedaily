"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Rocket } from "lucide-react"

export function DeployManager() {
  const [deploying, setDeploying] = useState(false)
  const [deployStatus, setDeployStatus] = useState<"idle" | "success" | "error">("idle")
  const [deployMessage, setDeployMessage] = useState("")


  const handleDeploy = () => {
    setDeployStatus("idle")
    setDeployMessage("정적 사이트에서는 서버에서 직접 명령어를 실행해야 합니다. 아래 명령어를 복사하세요.")
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Rocket className="h-5 w-5" />
          배포 관리
        </h2>

        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 mb-3">
              <strong>캐시 무효화 명령어:</strong>
            </p>
            <code className="block bg-blue-100 p-3 rounded text-sm font-mono text-blue-900">
              aws cloudfront create-invalidation --distribution-id E8HKFQFSQLNHZ --paths "/*"
            </code>
            <p className="text-xs text-blue-700 mt-2">
              정적 사이트에서는 서버에서 직접 AWS CLI 명령어를 실행해야 합니다.
            </p>
          </div>
          
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800 mb-2">
              <strong>참고:</strong> 퀴즈를 저장하면 자동으로 Archive에 반영됩니다.
            </p>
            <p className="text-xs text-amber-700">
              Frontend 재배포: <code className="bg-amber-100 px-1 rounded">bash scripts/deploy.sh</code>
            </p>
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
