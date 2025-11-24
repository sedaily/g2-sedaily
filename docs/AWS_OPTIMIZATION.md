# ☁️ AWS 최적화 가이드

## 🎯 현재 활용 중인 AWS 서비스

### 1. **S3 (Simple Storage Service)**
- 정적 웹사이트 호스팅
- 버킷: `g2-frontend-ver2`
- 버전 관리 활성화 권장

### 2. **CloudFront (CDN)**
- 글로벌 콘텐츠 배포
- Distribution ID: `E8HKFQFSQLNHZ`
- 캐시 정책 최적화

### 3. **Lambda (서버리스 컴퓨팅)**
- Chatbot: `sedaily-chatbot-dev-handler`
- Quiz Handler: `quiz-handler`
- Python 3.11 런타임

### 4. **DynamoDB (NoSQL 데이터베이스)**
- 테이블: `sedaily-quiz-data`
- 온디맨드 용량 모드
- 자동 스케일링

### 5. **Bedrock (AI/ML)**
- Claude 3 Sonnet 모델
- RAG 기반 챗봇

### 6. **CloudWatch (모니터링)**
- 로그 수집
- 메트릭 추적
- 알람 설정

## 🚀 추가 활용 가능한 AWS 서비스

### 1. **EventBridge (이벤트 기반 자동화)**

**용도**: DynamoDB 변경 감지 → 자동 배포

```yaml
# EventBridge Rule
EventPattern:
  source:
    - aws.dynamodb
  detail-type:
    - DynamoDB Stream Record
  detail:
    eventName:
      - INSERT
      - MODIFY
```

**구현**:
```bash
# DynamoDB Streams 활성화
aws dynamodb update-table \
  --table-name sedaily-quiz-data \
  --stream-specification StreamEnabled=true,StreamViewType=NEW_AND_OLD_IMAGES

# Lambda 트리거 생성
aws lambda create-event-source-mapping \
  --function-name auto-deploy-trigger \
  --event-source-arn arn:aws:dynamodb:us-east-1:xxx:table/sedaily-quiz-data/stream/xxx
```

### 2. **SNS (Simple Notification Service)**

**용도**: 배포 알림, 에러 알림

```typescript
// SNS 토픽 생성
const sns = new AWS.SNS();
await sns.publish({
  TopicArn: 'arn:aws:sns:us-east-1:xxx:g2-notifications',
  Subject: '배포 완료',
  Message: '새 퀴즈가 배포되었습니다.'
}).promise();
```

### 3. **Step Functions (워크플로우 오케스트레이션)**

**용도**: 복잡한 배포 파이프라인

```json
{
  "StartAt": "ValidateQuiz",
  "States": {
    "ValidateQuiz": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:xxx:function:validate-quiz",
      "Next": "BuildFrontend"
    },
    "BuildFrontend": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:xxx:function:build-frontend",
      "Next": "DeployToS3"
    },
    "DeployToS3": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:xxx:function:deploy-s3",
      "Next": "InvalidateCache"
    },
    "InvalidateCache": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:xxx:function:invalidate-cloudfront",
      "End": true
    }
  }
}
```

### 4. **Systems Manager Parameter Store**

**용도**: 환경 변수 중앙 관리

```bash
# 파라미터 저장
aws ssm put-parameter \
  --name /g2/slack-webhook \
  --value "https://hooks.slack.com/..." \
  --type SecureString

# Lambda에서 사용
import boto3
ssm = boto3.client('ssm')
webhook = ssm.get_parameter(Name='/g2/slack-webhook', WithDecryption=True)
```

### 5. **CloudWatch Logs Insights**

**용도**: 로그 분석 및 쿼리

```sql
-- 에러 로그 분석
fields @timestamp, @message
| filter @message like /ERROR/
| stats count() by bin(5m)

-- 배포 성공률
fields @timestamp, status
| filter @message like /deploy/
| stats count() by status
```

### 6. **X-Ray (분산 추적)**

**용도**: Lambda 성능 분석

```python
from aws_xray_sdk.core import xray_recorder

@xray_recorder.capture('process_quiz')
def process_quiz(quiz_data):
    # 성능 추적
    pass
```

### 7. **Secrets Manager**

**용도**: API 키 안전 관리

```bash
# 시크릿 생성
aws secretsmanager create-secret \
  --name g2/bigkinds-api-key \
  --secret-string "your-api-key"

# Lambda에서 사용
import boto3
client = boto3.client('secretsmanager')
secret = client.get_secret_value(SecretId='g2/bigkinds-api-key')
```

### 8. **CloudWatch Alarms**

**용도**: 자동 알림 및 대응

```bash
# Lambda 에러율 알람
aws cloudwatch put-metric-alarm \
  --alarm-name g2-lambda-errors \
  --alarm-description "Lambda error rate > 5%" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Average \
  --period 300 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold
```

### 9. **API Gateway**

**용도**: REST API 관리 (현재 사용 중)

**개선 사항**:
- API 키 인증
- 사용량 계획
- 요청 제한 (Rate Limiting)

```bash
# 사용량 계획 생성
aws apigateway create-usage-plan \
  --name g2-basic-plan \
  --throttle burstLimit=100,rateLimit=50
```

### 10. **CloudWatch Dashboards**

**용도**: 통합 모니터링 대시보드

```json
{
  "widgets": [
    {
      "type": "metric",
      "properties": {
        "metrics": [
          ["AWS/Lambda", "Invocations", {"stat": "Sum"}],
          ["AWS/DynamoDB", "ConsumedReadCapacityUnits"],
          ["AWS/CloudFront", "Requests"]
        ],
        "period": 300,
        "stat": "Average",
        "region": "us-east-1",
        "title": "G2 Platform Overview"
      }
    }
  ]
}
```

## 💰 비용 최적화

### 1. **S3 Intelligent-Tiering**
```bash
aws s3api put-bucket-intelligent-tiering-configuration \
  --bucket g2-frontend-ver2 \
  --id auto-archive \
  --intelligent-tiering-configuration file://tiering.json
```

### 2. **Lambda Reserved Concurrency**
```bash
# 동시 실행 제한으로 비용 제어
aws lambda put-function-concurrency \
  --function-name sedaily-chatbot-dev-handler \
  --reserved-concurrent-executions 10
```

### 3. **DynamoDB Auto Scaling**
```bash
# 자동 스케일링 설정
aws application-autoscaling register-scalable-target \
  --service-namespace dynamodb \
  --resource-id table/sedaily-quiz-data \
  --scalable-dimension dynamodb:table:ReadCapacityUnits \
  --min-capacity 1 \
  --max-capacity 10
```

### 4. **CloudFront 압축**
```bash
# Gzip/Brotli 압축 활성화
aws cloudfront update-distribution \
  --id E8HKFQFSQLNHZ \
  --distribution-config file://compression-config.json
```

## 🔒 보안 강화

### 1. **WAF (Web Application Firewall)**
```bash
# CloudFront에 WAF 연결
aws wafv2 associate-web-acl \
  --web-acl-arn arn:aws:wafv2:us-east-1:xxx:global/webacl/g2-protection \
  --resource-arn arn:aws:cloudfront::xxx:distribution/E8HKFQFSQLNHZ
```

### 2. **S3 Bucket Policy**
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "CloudFrontOnly",
    "Effect": "Allow",
    "Principal": {
      "Service": "cloudfront.amazonaws.com"
    },
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::g2-frontend-ver2/*"
  }]
}
```

### 3. **IAM Least Privilege**
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": [
      "dynamodb:GetItem",
      "dynamodb:Query",
      "dynamodb:Scan"
    ],
    "Resource": "arn:aws:dynamodb:us-east-1:xxx:table/sedaily-quiz-data"
  }]
}
```

## 📊 성능 최적화

### 1. **CloudFront Cache Policy**
```json
{
  "Name": "g2-optimized-cache",
  "MinTTL": 0,
  "MaxTTL": 31536000,
  "DefaultTTL": 86400,
  "ParametersInCacheKeyAndForwardedToOrigin": {
    "EnableAcceptEncodingGzip": true,
    "EnableAcceptEncodingBrotli": true
  }
}
```

### 2. **Lambda Provisioned Concurrency**
```bash
# 콜드 스타트 제거
aws lambda put-provisioned-concurrency-config \
  --function-name sedaily-chatbot-dev-handler \
  --provisioned-concurrent-executions 2
```

### 3. **DynamoDB DAX (캐싱)**
```bash
# DAX 클러스터 생성
aws dax create-cluster \
  --cluster-name g2-quiz-cache \
  --node-type dax.t3.small \
  --replication-factor 1
```

## 🎯 권장 구현 순서

### Phase 1: 자동화 (1주)
1. ✅ EventBridge + Lambda로 자동 배포
2. ✅ SNS 알림 통합
3. ✅ CloudWatch Alarms 설정

### Phase 2: 보안 (1주)
1. ✅ Secrets Manager로 API 키 이전
2. ✅ WAF 규칙 설정
3. ✅ S3 Bucket Policy 강화

### Phase 3: 성능 (1주)
1. ✅ CloudFront 캐시 정책 최적화
2. ✅ Lambda Provisioned Concurrency
3. ✅ DynamoDB Auto Scaling

### Phase 4: 모니터링 (1주)
1. ✅ CloudWatch Dashboard 생성
2. ✅ X-Ray 추적 활성화
3. ✅ Logs Insights 쿼리 작성

## 📈 예상 효과

- **배포 시간**: 3분 → 30초 (83% 감소)
- **비용**: 월 $50 → $30 (40% 감소)
- **가용성**: 99.9% → 99.99%
- **응답 시간**: 500ms → 100ms (80% 개선)

---

**다음 단계**: Phase 1부터 순차적으로 구현
