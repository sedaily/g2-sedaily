# g2-clone.ai 커스텀 도메인 설정 가이드

## 📋 현재 상태
- CloudFront 배포 ID: `E1C1UNHJ75JZMZ`
- 기본 도메인: `https://d37wz4zxwakwl0.cloudfront.net`
- 인증서 ARN: `arn:aws:acm:us-east-1:887078546492:certificate/dfc2dd1b-7ff1-46d8-b0ce-e3abf542477e`

## 🔧 DNS 검증 단계

### 1. DNS 검증 레코드 확인
```bash
aws acm describe-certificate \
  --certificate-arn arn:aws:acm:us-east-1:887078546492:certificate/dfc2dd1b-7ff1-46d8-b0ce-e3abf542477e \
  --query 'Certificate.DomainValidationOptions[0].ResourceRecord' \
  --output table
```

### 2. 도메인 DNS 설정
- `g2-clone.ai` 도메인의 DNS 관리 패널에 접속
- ACM에서 제공하는 CNAME 레코드 추가:
  - Name: `_xxxxx.g2-clone.ai`
  - Value: `_xxxxx.acm-validations.aws.`

### 3. 인증서 검증 완료 확인
```bash
aws acm list-certificates --region us-east-1 \
  --query 'CertificateSummaryList[?DomainName==`g2-clone.ai` && Status==`ISSUED`]'
```

## 🚀 CloudFront 커스텀 도메인 적용

### 인증서가 ISSUED 상태가 되면:

1. **CloudFront 설정 업데이트**
```bash
# cloudfront-custom-domain.json 파일 사용
aws cloudfront update-distribution \
  --id E1C1UNHJ75JZMZ \
  --distribution-config file://cloudfront-custom-domain.json \
  --if-match E1Y4OZHIWJYGXK
```

2. **DNS A 레코드 추가**
도메인 DNS 설정에서:
- Type: `A` (또는 `ALIAS`)
- Name: `g2-clone.ai`
- Value: `d37wz4zxwakwl0.cloudfront.net`

## 📁 준비된 파일
- `cloudfront-custom-domain.json`: 커스텀 도메인 적용용 CloudFront 설정
- `quick-deploy.mjs`: 배포 스크립트 (커스텀 도메인 정보 포함)

## ✅ 완료 후 확인
- https://g2-clone.ai 접속 테스트
- SSL 인증서 유효성 확인