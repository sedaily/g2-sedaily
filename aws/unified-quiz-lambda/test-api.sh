#!/bin/bash

# API 엔드포인트 설정 (배포 후 실제 URL로 변경)
API_URL="https://your-api-gateway-url.execute-api.ap-northeast-2.amazonaws.com/prod"

echo "🧪 Quiz API 테스트 시작..."

# 1. 퀴즈 저장 테스트 (POST)
echo "📝 1. 퀴즈 저장 테스트..."
curl -X POST "$API_URL/quizzes" \
  -H "Content-Type: application/json" \
  -d @test-data.json \
  -w "\nStatus: %{http_code}\n" \
  -s

echo -e "\n"

# 2. 전체 퀴즈 조회 테스트 (GET /all)
echo "📋 2. 전체 퀴즈 조회 테스트..."
curl -X GET "$API_URL/quizzes/all" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n" \
  -s

echo -e "\n"

# 3. 날짜별 퀴즈 조회 테스트 (GET /gameType/date)
echo "📅 3. 날짜별 퀴즈 조회 테스트..."
curl -X GET "$API_URL/quizzes/BlackSwan/2025-01-17" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n" \
  -s

echo -e "\n"

# 4. 메타데이터 조회 테스트 (GET /meta/gameType)
echo "📊 4. 메타데이터 조회 테스트..."
curl -X GET "$API_URL/quizzes/meta/BlackSwan" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n" \
  -s

echo -e "\n"

# 5. CORS 테스트 (OPTIONS)
echo "🌐 5. CORS 테스트..."
curl -X OPTIONS "$API_URL/quizzes" \
  -H "Origin: https://g2.sedaily.ai" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -w "\nStatus: %{http_code}\n" \
  -s

echo "✅ API 테스트 완료!"