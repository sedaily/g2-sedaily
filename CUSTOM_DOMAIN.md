# 커스텀 도메인 설정 (g2-clone.ai)

## 📋 도메인 정보

- **도메인**: `g2-clone.ai`
- **SSL 인증서 ID**: `9c87fd8a-3506-4a55-86dc-03bfeb6b22d8`
- **CloudFront Distribution**: `E8HKFQFSQLNHZ`
- **현재 도메인**: `d37wz4zxwakwl0.cloudfront.net`

## 🔧 설정 단계

### 1. Route 53 호스팅 영역 설정
```bash
# A 레코드 생성
aws route53 change-resource-record-sets --hosted-zone-id YOUR_ZONE_ID --change-batch '{
  "Changes": [{
    "Action": "CREATE",
    "ResourceRecordSet": {
      "Name": "g2-clone.ai",
      "Type": "A",
      "AliasTarget": {
        "DNSName": "d37wz4zxwakwl0.cloudfront.net",
        "EvaluateTargetHealth": false,
        "HostedZoneId": "Z2FDTNDATAQYW2"
      }
    }
  }]
}'
```

### 2. CloudFront Distribution 업데이트
```bash
# 커스텀 도메인 추가
aws cloudfront update-distribution \
  --id E8HKFQFSQLNHZ \
  --distribution-config '{
    "Aliases": {
      "Quantity": 1,
      "Items": ["g2-clone.ai"]
    },
    "ViewerCertificate": {
      "ACMCertificateArn": "arn:aws:acm:us-east-1:ACCOUNT:certificate/9c87fd8a-3506-4a55-86dc-03bfeb6b22d8",
      "SSLSupportMethod": "sni-only",
      "MinimumProtocolVersion": "TLSv1.2_2021"
    }
  }'
```

### 3. SSL 인증서 검증
- **인증서 상태**: 발급됨
- **도메인 검증**: 완료 필요
- **CloudFront 연결**: 대기 중

## 🚀 배포 후 확인사항

1. **DNS 전파 확인**:
   ```bash
   nslookup g2-clone.ai
   ```

2. **SSL 인증서 확인**:
   ```bash
   curl -I https://g2-clone.ai
   ```

3. **CloudFront 상태 확인**:
   ```bash
   aws cloudfront get-distribution --id E8HKFQFSQLNHZ
   ```

## 📝 참고사항

- SSL 인증서는 us-east-1 리전에 생성되어야 함
- CloudFront 배포 완료까지 15-20분 소요
- DNS 전파는 최대 48시간 소요 가능

---

**마지막 업데이트**: 2025-11-10
**상태**: 설정 대기 중