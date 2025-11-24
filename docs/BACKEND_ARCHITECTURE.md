# 서울경제 뉴스게임 플랫폼 백엔드 아키텍처

## 📋 개요

서울경제 뉴스게임 플랫폼의 서버리스 백엔드 시스템 분석 및 구조 정리

**주요 기능**: RAG 기반 AI 챗봇, 퀴즈 데이터 관리, 경제 뉴스 검색  
**아키텍처**: AWS Lambda + DynamoDB + Bedrock + BigKinds API  
**리전**: us-east-1 (Bedrock Claude 3 Sonnet 지원)  
**마지막 업데이트**: 2025-11-24 (코드 품질 개선 완료)

---

## 🏗️ 전체 백엔드 아키텍처

### 서버리스 구조
```
Frontend → API Gateway → Lambda Functions → External APIs
                              ↓
                         DynamoDB + Bedrock + BigKinds
```

### 핵심 컴포넌트
1. **AI 챗봇 시스템**: RAG 기반 Claude 3 Sonnet
2. **퀴즈 데이터 시스템**: DynamoDB 기반 CRUD
3. **뉴스 검색 시스템**: BigKinds API 통합
4. **API Gateway**: CORS 지원 REST API

---

## 🤖 AI 챗봇 시스템 (메인)

### Lambda 함수: `sedaily-chatbot-dev-handler`

**파일**: `backend/lambda/enhanced-chatbot-handler.py`

**핵심 기능**:
- **RAG 아키텍처**: 3단계 지식 통합
- **Intelligent Fallback**: API 실패 시 순수 Claude 응답
- **게임별 전문화**: BlackSwan, PrisonersDilemma, SignalDecoding

**기술 스택**:
```python
Runtime: Python 3.11
Memory: 1024MB
Timeout: 60초
Region: us-east-1
Dependencies: boto3, requests, beautifulsoup4, backoff, lxml
```

**코드 최적화**:
- 17개 상수 정의로 매직 넘버 제거
- 구체적 예외 처리 (Timeout, RequestException, Boto3Error)
- 민감 정보 자동 마스킹 (API 키, 이메일, 전화번호)
- CloudWatch 메트릭 수집 (BigKindsAPIAttempt, BigKindsAPISuccess, BigKindsAPIError)

### RAG 지식 베이스 구조

**3단계 지식 통합**:
```python
def build_rag_knowledge_base():
    # 1. BigKinds API 뉴스 (최근 30일)
    bigkinds_data = fetch_bigkinds_knowledge()
    
    # 2. 퀴즈 관련 기사 URL
    article_data = fetch_quiz_article_knowledge()
    
    # 3. 퀴즈 문제 컨텍스트
    quiz_context = question_text
```

**지식 소스 우선순위**:
1. **BigKinds 뉴스**: 실시간 경제 뉴스 (3건)
2. **퀴즈 기사**: 문제 관련 원문 기사
3. **퀴즈 컨텍스트**: 현재 문제 내용

### Claude 3 Sonnet 통합

**Bedrock 설정**:
```python
# 상수 정의
AWS_REGION = 'us-east-1'
BEDROCK_MODEL_ID = 'anthropic.claude-3-sonnet-20240229-v1:0'
CLAUDE_MAX_TOKENS = 1000
CLAUDE_TEMPERATURE = 0.7
CLAUDE_TOP_P = 0.9

# 클라이언트 초기화
bedrock = boto3.client(
    service_name='bedrock-runtime',
    region_name=AWS_REGION
)
```

**게임별 시스템 프롬프트**:
- **BlackSwan**: 위기/리스크 분석 특화
- **PrisonersDilemma**: 게임이론 특화  
- **SignalDecoding**: 경제지표 분석 특화

**응답 최적화**:
- 길이: 250-350자
- 스타일: 전문적 경제 분석
- 언어: 자연스러운 한국어

### Intelligent Fallback 시스템

**다층 폴백 전략**:
```python
try:
    # 1차: RAG 기반 Claude 응답
    claude_response = generate_claude_rag_response()
except boto3.exceptions.Boto3Error as e:
    logger.error(f"Bedrock API error: {str(e)}")
    # 2차: 게임별 대체 응답
    fallback_response = generate_fallback_response()
except json.JSONDecodeError as e:
    logger.error(f"Claude response parsing error: {str(e)}")
    fallback_response = generate_fallback_response()
except Exception as e:
    logger.error(f"Claude unexpected error: {str(e)}")
    fallback_response = generate_fallback_response()
```

**에러 처리 개선**:
- 구체적 예외 타입별 처리
- 상세한 에러 로깅
- 민감 정보 마스킹 적용

---

## 📊 퀴즈 데이터 시스템

### DynamoDB 구조

**테이블**: `sedaily-quiz-data`

**키 구조**:
```
PK (Partition Key): "QUIZ#{gameType}"
SK (Sort Key): "{date}" (YYYY-MM-DD)
```

**데이터 스키마**:
```json
{
  "PK": "QUIZ#BlackSwan",
  "SK": "2025-11-20",
  "gameType": "BlackSwan",
  "quizDate": "2025-11-20",
  "questions": [...],
  "questionCount": 5,
  "createdAt": "2025-11-20T10:00:00.000Z",
  "updatedAt": "2025-11-20T10:00:00.000Z"
}
```

### 퀴즈 API Lambda

**파일**: `aws/unified-quiz-lambda/quiz-handler.py`

**지원 기능**:
- **CRUD 작업**: 퀴즈 생성, 조회, 수정, 삭제
- **날짜별 API**: `/gameType/date` 형식
- **메타데이터 API**: `/meta/gameType` (날짜 목록)
- **Quizlet 지원**: 카드 매칭 게임 데이터

**코드 최적화**:
- `create_response()` 헬퍼 함수로 중복 제거
- List comprehension으로 성능 개선
- CloudWatch 메트릭 수집 (QuizAPI_*, QuizSaved_*, QuizFetch_*)
- 환경 변수 필수화 및 검증
- 구체적 예외 처리 (Boto3Error, JSONDecodeError)

**API 엔드포인트**:
```
POST /quizzes          # 퀴즈 저장
GET  /quizzes/all      # 전체 퀴즈 조회
GET  /quizzes/{type}/{date}  # 날짜별 조회
GET  /meta/{type}      # 메타데이터 조회
```

### 데이터 타입 지원

**일반 퀴즈**:
```json
{
  "gameType": "BlackSwan",
  "quizDate": "2025-11-20",
  "questions": [
    {
      "id": "q1",
      "questionType": "객관식",
      "question": "문제 내용",
      "options": ["선택1", "선택2", "선택3", "선택4"],
      "answer": "정답",
      "explanation": "해설"
    }
  ]
}
```

**Quizlet 데이터**:
```json
{
  "gameType": "Quizlet",
  "quizDate": "2025-11-20",
  "data": {
    "setName": "경제 용어 세트",
    "terms": [
      {
        "id": 1,
        "term": "GDP",
        "definition": "국내총생산",
        "description": "한 나라의 경제 규모를 나타내는 지표"
      }
    ]
  }
}
```

---

## 📰 BigKinds API 통합

### 뉴스 검색 시스템

**API 설정**:
```python
# Python Lambda에서 사용
BIGKINDS_API_URL = 'https://www.bigkinds.or.kr/api/news/search.do'
BIGKINDS_TIMEOUT = 10
BIGKINDS_MAX_RETRIES = 2
BIGKINDS_MAX_TIME = 20
NEWS_SEARCH_DAYS = 30
NEWS_RESULT_LIMIT = 3

# Backoff 재시도 로직
@backoff.on_exception(
    backoff.expo,
    (requests.RequestException, requests.Timeout),
    max_tries=BIGKINDS_MAX_RETRIES,
    max_time=BIGKINDS_MAX_TIME
)
def call_bigkinds_api(keywords: str, api_key: str):
    # API 호출 로직
```

**검색 파라미터**:
```json
{
  "query": "검색 키워드",
  "published_at": {
    "from": "2025-10-20",
    "until": "2025-11-20"
  },
  "category": ["경제", "사회", "정치"],
  "provider": [],
  "return_size": 3
}
```

### 키워드 추출 로직

**게임별 키워드 매핑**:
```python
game_keywords = {
    'BlackSwan': ['위기', '리스크'],
    'PrisonersDilemma': ['경쟁', '협력'],
    'SignalDecoding': ['지표', '신호']
}

# 최적화된 키워드 추출
MAX_KEYWORDS = 5

def extract_search_keywords(user_question, game_type):
    # 한국어 조사 제거 및 명사 추출
    cleaned = re.sub(r'[?!.,]', '', user_question)
    words = cleaned.split()
    
    base_keywords = [
        re.sub(r'(이|가|을|를|은|는|에|의|도|만|부터|까지|에서|로|으로)$', '', word)
        for word in words
        if len(re.sub(r'(이|가|을|를|은|는|에|의|도|만|부터|까지|에서|로|으로)$', '', word)) >= 2
    ][:3]
    
    base_keywords.extend(game_keywords.get(game_type, []))
    base_keywords.append('경제')
    
    return ' '.join(base_keywords[:MAX_KEYWORDS])
```

**키워드 추출 과정**:
1. 사용자 질문에서 핵심 단어 추출
2. 게임별 관련 키워드 추가
3. 경제 관련 키워드 보강
4. 최대 5개 키워드로 제한

---

## 🔌 API Gateway 구조

### 엔드포인트 매핑

**챗봇 API**:
```
POST /chat
OPTIONS /chat (CORS)
```

**퀴즈 API**:
```
GET  /quizzes/all
GET  /quizzes/{gameType}/{date}
GET  /meta/{gameType}
POST /quizzes
```

### CORS 설정

**허용 설정**:
```json
{
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
}
```

---

## 🛠️ 배포 및 관리

### Lambda 배포

**Serverless Framework**:
```yaml
# serverless.yml
service: g2-chatbot-backend
provider:
  name: aws
  runtime: python3.11
  region: us-east-1  # Bedrock Claude 3 Sonnet 지원
  stage: dev
  memorySize: 1024
  timeout: 60
  environment:
    BIGKINDS_API_KEY: ${env:BIGKINDS_API_KEY}
    AWS_REGION: us-east-1
  iamRoleStatements:
    - Effect: Allow
      Action:
        - logs:CreateLogGroup
        - logs:CreateLogStream
        - logs:PutLogEvents
      Resource: 
        - "arn:aws:logs:us-east-1:*:log-group:/aws/lambda/*"
    - Effect: Allow
      Action:
        - bedrock:InvokeModel
      Resource:
        - "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0"
    - Effect: Allow
      Action:
        - cloudwatch:PutMetricData
      Resource: "*"
    - Effect: Allow
      Action:
        - secretsmanager:GetSecretValue
      Resource:
        - "arn:aws:secretsmanager:us-east-1:*:secret:g2/*"

custom:
  pythonRequirements:
    dockerizePip: true
    layer: true
    slim: true
    strip: false
    pythonBin: python3.11
    zip: true
    useStaticCache: true
    useDownloadCache: true
```

**배포 명령어**:
```bash
# Enhanced 챗봇 배포 (직접 업로드)
cd backend
zip -r enhanced-chatbot.zip lambda/
aws lambda update-function-code \
  --function-name sedaily-chatbot-dev-handler \
  --zip-file fileb://enhanced-chatbot.zip \
  --region us-east-1

# Serverless Framework 배포 (권장)
cd backend
serverless deploy --stage dev --region us-east-1

# Quiz Handler 배포
cd aws/unified-quiz-lambda
zip -r quiz-handler.zip .
aws lambda update-function-code \
  --function-name quiz-handler \
  --zip-file fileb://quiz-handler.zip \
  --region us-east-1
```

### 환경 변수

**필수 환경 변수**:
```bash
# Enhanced Chatbot Lambda
BIGKINDS_API_KEY=your_bigkinds_api_key
AWS_REGION=us-east-1

# Quiz Handler Lambda
DYNAMODB_TABLE=sedaily-quiz-data  # 필수 (검증됨)
AWS_REGION=us-east-1
```

### 모니터링

**CloudWatch 로그**:
- `/aws/lambda/sedaily-chatbot-dev-handler`
- `/aws/lambda/quiz-handler`

**주요 메트릭**:
- 응답 시간: 평균 2-5초
- 성공률: 95% 이상
- BigKinds API 성공률: 85% (폴백 시스템으로 보완)

**커스텀 메트릭** (Namespace: G2/Chatbot, G2/Quiz):
- `BigKindsAPIAttempt`: BigKinds API 호출 시도
- `BigKindsAPISuccess`: BigKinds API 성공
- `BigKindsAPIError`: BigKinds API 실패
- `QuizAPI_GET/POST`: 퀴즈 API 요청 타입별
- `QuizSaved_{gameType}`: 게임별 퀴즈 저장
- `QuizFetch_{gameType}`: 게임별 퀴즈 조회
- `QuizNotFound`: 퀴즈 미발견

---

## 🔧 성능 최적화

### 캐싱 전략

**다층 캐싱**:
1. **클라이언트**: localStorage (15분)
2. **서버**: 메모리 캐시 (10분)
3. **API**: DynamoDB 쿼리 최적화

### 응답 시간 최적화

**BigKinds API**:
- 타임아웃: 10초 (BIGKINDS_TIMEOUT)
- 재시도: 2회 (exponential backoff, 최대 20초)
- 결과 제한: 3건 (NEWS_RESULT_LIMIT)
- 검색 기간: 30일 (NEWS_SEARCH_DAYS)

**Claude API**:
- 타임아웃: 30초
- 토큰 제한: 1000개
- Temperature: 0.7

### 비용 최적화

**Lambda 설정**:
- 메모리: 1024MB (성능/비용 균형)
- 동시 실행: 10개 제한
- 프로비저닝: 없음 (온디맨드)

---

## 🚨 에러 처리 및 복구

### 에러 처리 전략

**BigKinds API 실패**:
```python
try:
    bigkinds_data = call_bigkinds_api()
except requests.Timeout:
    logger.warning("BigKinds API timeout")
    return None
except requests.RequestException as e:
    logger.error(f"BigKinds API request error: {str(e)}")
    return None
except KeyError as e:
    logger.error(f"BigKinds API response parsing error: {str(e)}")
    return None
```

**Claude API 실패**:
```python
try:
    claude_response = bedrock.invoke_model()
except boto3.exceptions.Boto3Error as e:
    logger.error(f"Bedrock API error: {str(e)}")
    return generate_fallback_response()
except json.JSONDecodeError as e:
    logger.error(f"Claude response parsing error: {str(e)}")
    return generate_fallback_response()
except Exception as e:
    logger.error(f"Claude unexpected error: {str(e)}")
    return generate_fallback_response()
```

**DynamoDB 실패**:
```python
try:
    quiz_data = table.get_item()
except boto3.exceptions.Boto3Error as e:
    logger.error(f"DynamoDB error: {e}")
    return create_response(500, {'error': 'Database error'}, headers)
except Exception as e:
    logger.error(f"Unexpected error: {e}")
    return create_response(500, {'error': 'Failed to get quiz'}, headers)
```

### 로그 및 디버깅

**구조화된 로깅**:
```python
# 민감 정보 마스킹 적용
masked_question = mask_sensitive_data(user_question)
logger.info(f"RAG Query: {masked_question[:50]}... (Game: {game_type})")
logger.error(f"BigKinds API error: {str(e)}")
logger.warning("BigKinds API key not found")

# 마스킹 함수
def mask_sensitive_data(text: str) -> str:
    # API 키 마스킹 (8자 이상의 영숫자)
    text = re.sub(r'([a-zA-Z0-9]{8})[a-zA-Z0-9]{16,}', r'\1****', text)
    # 이메일 마스킹
    text = re.sub(r'([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})', r'****@\2', text)
    # 전화번호 마스킹
    text = re.sub(r'\d{3}-\d{4}-\d{4}', '***-****-****', text)
    return text
```

---

## 🔐 보안 및 권한

### IAM 권한

**Lambda 실행 역할** (최소 권한 원칙 적용):
```yaml
iamRoleStatements:
  # CloudWatch Logs (구체적 리소스)
  - Effect: Allow
    Action:
      - logs:CreateLogGroup
      - logs:CreateLogStream
      - logs:PutLogEvents
    Resource: 
      - "arn:aws:logs:us-east-1:*:log-group:/aws/lambda/*"
  
  # Bedrock (특정 모델만)
  - Effect: Allow
    Action:
      - bedrock:InvokeModel
    Resource:
      - "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0"
  
  # CloudWatch Metrics (리소스 ARN 불필요)
  - Effect: Allow
    Action:
      - cloudwatch:PutMetricData
    Resource: "*"
  
  # Secrets Manager (특정 경로만)
  - Effect: Allow
    Action:
      - secretsmanager:GetSecretValue
    Resource:
      - "arn:aws:secretsmanager:us-east-1:*:secret:g2/*"
  
  # DynamoDB (Quiz Handler용)
  - Effect: Allow
    Action:
      - dynamodb:GetItem
      - dynamodb:PutItem
      - dynamodb:Query
      - dynamodb:Scan
    Resource:
      - "arn:aws:dynamodb:us-east-1:*:table/sedaily-quiz-data"
```

### API 보안

**API Key 관리**:
- BigKinds API Key: 환경 변수 저장
- AWS 자격증명: IAM 역할 사용
- 민감 정보: AWS Secrets Manager (향후)

**요청 검증**:
```python
if not user_question:
    return {
        'statusCode': 400,
        'body': json.dumps({'error': '질문이 필요합니다.'})
    }
```

---

## 📈 확장성 및 향후 계획

### 단기 개선 (1개월) ✅ 완료
- [x] 응답 캐싱 시스템 구축
- [x] BigKinds API 재시도 로직 추가 (backoff 라이브러리)
- [x] 응답 품질 메트릭 수집 (CloudWatch 커스텀 메트릭)
- [x] 코드 최적화 (상수 중앙 관리, 17개 상수)
- [x] 에러 처리 구체화 (타입별 예외 처리)
- [x] IAM 권한 최소화 (리소스 ARN 구체화)
- [x] 민감 정보 마스킹 (API 키, 이메일, 전화번호)

### 중기 개선 (3개월)
- [ ] 다중 AI 모델 지원 (GPT-4, Gemini)
- [ ] 실시간 뉴스 스트리밍
- [ ] 사용자별 개인화 응답

### 장기 개선 (6개월)
- [ ] 벡터 데이터베이스 도입 (Pinecone/Weaviate)
- [ ] 실시간 RAG 파이프라인
- [ ] 멀티모달 AI (텍스트 + 이미지)

---

## 🔍 API 문서

### 챗봇 API

**요청**:
```json
POST /chat
{
  "question": "GDP가 경제에 미치는 영향은?",
  "gameType": "BlackSwan",
  "questionText": "다음 중 GDP 증가 요인이 아닌 것은?",
  "quizArticleUrl": "https://example.com/article"
}
```

**응답**:
```json
{
  "response": "GDP는 한 나라의 경제 규모를...",
  "knowledge_sources": 3,
  "timestamp": "2025-11-20T10:00:00.000Z",
  "success": true
}
```

### 퀴즈 API

**날짜별 조회**:
```
GET /quizzes/BlackSwan/2025-11-20
```

**메타데이터 조회**:
```
GET /meta/BlackSwan
```

---

## 📞 지원 및 문의

**Repository**: [sedaily/g2-clone](https://github.com/sedaily/g2-clone)  
**Backend 디렉토리**: `/backend/`  
**Lambda 함수**: `sedaily-chatbot-dev-handler`  
**DynamoDB 테이블**: `sedaily-quiz-data`

**긴급 상황 대응**:
1. CloudWatch 로그 확인
2. Lambda 함수 재시작
3. DynamoDB 상태 확인
4. BigKinds API 상태 확인

---

## 📚 추가 문서

- **[README.md](../README.md)**: 프로젝트 전체 개요
- **[DEPLOYMENT.md](./DEPLOYMENT.md)**: 배포 가이드
- **[DEPLOYMENT_ARCHITECTURE.md](./DEPLOYMENT_ARCHITECTURE.md)**: 배포 아키텍처
- **[404_PREVENTION.md](./404_PREVENTION.md)**: 404 에러 방지

---

*마지막 업데이트: 2025-11-24*  
*문서 버전: 2.4*
