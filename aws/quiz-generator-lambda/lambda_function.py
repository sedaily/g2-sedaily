#!/usr/bin/env python3
"""
서울경제 AI GAMES - 퀴즈 자동 생성 Lambda 함수
BigKinds API → Step1 스크리닝 → Step2 문제 제작 → DynamoDB 저장
"""

import os
import json
import boto3
import requests
from datetime import datetime, timedelta
from pathlib import Path

# 설정
AWS_REGION = os.environ.get('AWS_REGION', 'us-east-1')
BEDROCK_MODEL_ID = 'anthropic.claude-3-haiku-20240307-v1:0'  # Claude 3 Haiku (빠르고 안정적)
DYNAMODB_TABLE = os.environ.get('DYNAMODB_TABLE', 'sedaily-quiz-data')
BIGKINDS_API_KEY = os.environ.get('BIGKINDS_API_KEY')

# AWS 클라이언트 (타임아웃 설정)
from botocore.config import Config

bedrock_config = Config(
    read_timeout=300,  # 5분
    connect_timeout=60,
    retries={'max_attempts': 3}
)

bedrock = boto3.client('bedrock-runtime', region_name=AWS_REGION, config=bedrock_config)
dynamodb = boto3.resource('dynamodb', region_name=AWS_REGION)


def lambda_handler(event, context):
    """
    Lambda 메인 핸들러
    EventBridge에서 매일 자동 호출
    """
    print("=" * 60)
    print("🎮 서울경제 AI GAMES - 퀴즈 자동 생성 시작")
    print("=" * 60)
    
    max_retries = 2  # 최대 재시도 횟수
    
    try:
        # 1. BigKinds에서 뉴스 가져오기
        articles = fetch_bigkinds_news(count=12)
        
        # 2. Step 1: 기사 스크리닝
        screening_result, article_url_maps = step1_screen_articles(articles)
        article_url_map, article_url_map_normalized = article_url_maps
        
        # 3. Step 2: 문제 제작 (재시도 로직)
        quiz_data = None
        for attempt in range(max_retries + 1):
            quiz_output = step2_generate_quiz(screening_result, retry_count=attempt, max_retries=max_retries)
            
            # 4. JSON 파싱
            quiz_data = parse_quiz_output(quiz_output, article_url_map, article_url_map_normalized)
            
            # 5. 품질 검증
            is_valid, errors = validate_quiz(quiz_data)
            
            if is_valid:
                print(f"✅ 시도 {attempt + 1}에서 성공!")
                break
            else:
                if attempt < max_retries:
                    print(f"⚠️ 시도 {attempt + 1} 실패. 재시도 중...")
                else:
                    raise Exception(f"품질 검증 실패 (최대 재시도 초과): {errors}")
        
        # 6. DynamoDB 저장
        today = datetime.now().strftime('%Y-%m-%d')
        save_to_dynamodb(quiz_data, today)
        
        print("\n" + "=" * 60)
        print("✅ 전체 프로세스 완료!")
        print("=" * 60)
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': '퀴즈 생성 완료',
                'date': today,
                'attempts': attempt + 1,
                'questions': {
                    'BlackSwan': len(quiz_data.get('BlackSwan', [])),
                    'PrisonersDilemma': len(quiz_data.get('PrisonersDilemma', [])),
                    'SignalDecoding': len(quiz_data.get('SignalDecoding', []))
                }
            }, ensure_ascii=False)
        }
        
    except Exception as e:
        print(f"\n❌ 오류 발생: {str(e)}")
        import traceback
        traceback.print_exc()
        
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': str(e)
            }, ensure_ascii=False)
        }


def normalize_title(title):
    """기사 제목 정규화 (매칭용)"""
    import re
    # 공백, 특수문자 제거하고 소문자로 변환
    normalized = re.sub(r'[^\w가-힣]', '', title)
    return normalized.lower()


def convert_newsid_to_sedaily_url(news_id):
    """
    BigKinds news_id를 서울경제 원문 URL로 변환
    BigKinds 페이지를 스크래핑하여 "언론사URL" 버튼의 링크를 추출
    """
    if not news_id:
        return ''
    
    try:
        # BigKinds 기사 상세 페이지 URL
        bigkinds_url = f"https://www.bigkinds.or.kr/v2/news/newsDetailView.do?newsId={news_id}"
        
        # 페이지 요청
        response = requests.get(bigkinds_url, timeout=10)
        if response.status_code != 200:
            print(f"   ⚠️ BigKinds 페이지 로드 실패: {news_id}")
            return bigkinds_url
        
        # HTML 파싱하여 언론사URL 버튼 찾기
        import re
        # <button ... onclick="location.href='URL'">언론사URL</button> 패턴 찾기
        match = re.search(r"onclick=\"location\.href='([^']+)'\"[^>]*>언론사URL", response.text)
        if match:
            provider_url = match.group(1)
            # ?ref=kpf 파라미터 제거
            provider_url = provider_url.split('?')[0]
            print(f"   ✅ 스크래핑 성공: {provider_url}")
            return provider_url
        else:
            print(f"   ⚠️ 언론사URL 버튼 못 찾음: {news_id}")
            return bigkinds_url
            
    except Exception as e:
        print(f"   ⚠️ 스크래핑 오류: {str(e)}")
        # fallback: BigKinds URL 반환
        return f"https://www.bigkinds.or.kr/v2/news/newsDetailView.do?newsId={news_id}"


def load_prompt_files(step_dir):
    """프롬프트, 지침, 메모리, 파일들 로드"""
    prompt = (step_dir / 'prompt.txt').read_text(encoding='utf-8')
    instructions = (step_dir / 'instructions.txt').read_text(encoding='utf-8')
    memory = (step_dir / 'memory.txt').read_text(encoding='utf-8')
    
    # files 디렉토리의 모든 파일 로드
    files_dir = step_dir / 'files'
    reference_files = {}
    if files_dir.exists():
        for file_path in files_dir.glob('*.txt'):
            reference_files[file_path.name] = file_path.read_text(encoding='utf-8')
    
    return {
        'prompt': prompt,
        'instructions': instructions,
        'memory': memory,
        'reference_files': reference_files
    }


def fetch_bigkinds_news(count=12):
    """BigKinds API에서 최근 경제 뉴스 가져오기"""
    print(f"\n📰 BigKinds API에서 뉴스 {count}개 가져오는 중...")
    
    if not BIGKINDS_API_KEY:
        raise ValueError("BIGKINDS_API_KEY 환경 변수가 설정되지 않았습니다")
    
    end_date = datetime.now()
    start_date = end_date - timedelta(days=7)
    
    payload = {
        'access_key': BIGKINDS_API_KEY,
        'argument': {
            'query': '',
            'published_at': {
                'from': start_date.strftime('%Y-%m-%d'),
                'until': end_date.strftime('%Y-%m-%d')
            },
            'provider': ['서울경제'],
            'category': ['경제'],
            'sort': {'date': 'desc'},
            'hilight': 200,
            'return_from': 0,
            'return_size': count,
            'fields': ['title', 'content', 'published_at', 'provider', 'category', 'hilight', 'news_id', 'url', 'byline', 'provider_link_page']  # 추가 필드 요청
        }
    }
    
    try:
        response = requests.post(
            'https://tools.kinds.or.kr/search/news',
            json=payload,
            headers={'Content-Type': 'application/json'},
            timeout=15
        )
        
        if response.status_code != 200:
            print(f"❌ API 응답 코드: {response.status_code}")
            raise Exception(f"BigKinds API 오류: {response.status_code}")
        
        data = response.json()
        
        if data.get('result') != 0:
            print(f"❌ API result 코드: {data.get('result')}")
            raise Exception(f"BigKinds API returned error result: {data.get('result')}")
        
        articles = data.get('return_object', {}).get('documents', [])
        
        print(f"✅ {len(articles)}개 뉴스 가져오기 완료")
        return articles
        
    except requests.exceptions.JSONDecodeError as e:
        print(f"❌ JSON 파싱 오류")
        raise Exception(f"BigKinds API 응답이 JSON 형식이 아닙니다: {str(e)}")


def call_claude(system_prompt, user_prompt, max_tokens=4000):
    """AWS Bedrock Claude 호출"""
    request_body = {
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": max_tokens,
        "system": system_prompt,
        "messages": [
            {
                "role": "user",
                "content": user_prompt
            }
        ],
        "temperature": 0.7,
        "top_p": 0.9
    }
    
    response = bedrock.invoke_model(
        modelId=BEDROCK_MODEL_ID,
        body=json.dumps(request_body)
    )
    
    response_body = json.loads(response['body'].read())
    return response_body['content'][0]['text']


def step1_screen_articles(articles):
    """Step 1: 기사 스크리닝"""
    print("\n🔍 Step 1: 기사 스크리닝 시작...")
    
    # 프롬프트 로드
    prompt_dir = Path(__file__).parent / 'prompts' / 'step1'
    step1_data = load_prompt_files(prompt_dir)
    
    # System prompt 구성
    system_prompt = f"""
{step1_data['prompt']}

{step1_data['instructions']}

참조 파일:
"""
    for filename, content in step1_data['reference_files'].items():
        system_prompt += f"\n### {filename}\n{content}\n"
    
    # User prompt 구성
    articles_text = ""
    for i, article in enumerate(articles, 1):
        articles_text += f"\n\n[기사 {i}]\n"
        articles_text += f"제목: {article.get('title', '')}\n"
        articles_text += f"본문: {article.get('content', '')[:1000]}...\n"
    
    user_prompt = f"""
{step1_data['memory']}

다음 {len(articles)}개의 경제 뉴스 기사를 분석하여 게임별로 적합한 기사를 추천해주세요.

**중요: 각 게임별로 반드시 2개씩, 총 6개 기사를 선정해야 합니다.**
- 블랙스완 게임: 2개
- 죄수의 딜레마 게임: 2개
- 시그널 디코딩 게임: 2개

{articles_text}

분석 시작
"""
    
    # Claude 호출
    response = call_claude(system_prompt, user_prompt, max_tokens=8000)
    
    print("✅ Step 1 완료: 기사 스크리닝 결과 생성")
    
    # 기사 제목-URL 매핑 생성 (정규화된 제목으로)
    article_url_map = {}
    article_url_map_normalized = {}  # 정규화된 제목으로 검색용
    
    for article in articles:
        title = article.get('title', '')
        news_id = article.get('news_id', '')
        published_at = article.get('published_at', '')
        
        # provider_link_page 필드에서 서울경제 원문 URL 가져오기 (우선순위 1)
        url = article.get('provider_link_page', '')
        
        # provider_link_page가 없으면 news_id로 BigKinds URL 생성 (fallback)
        if not url:
            url = convert_newsid_to_sedaily_url(news_id)
        else:
            # ?ref=kpf 파라미터 제거 (깔끔한 URL)
            url = url.split('?')[0]
        
        if title:
            article_data = {
                'url': url,
                'publishedDate': published_at,
                'originalTitle': title
            }
            article_url_map[title] = article_data
            # 정규화된 제목으로도 저장
            normalized_title = normalize_title(title)
            article_url_map_normalized[normalized_title] = article_data
    
    print(f"📋 URL 매핑 생성 완료: {len(article_url_map)}개 기사")
    
    return response, (article_url_map, article_url_map_normalized)


def step2_generate_quiz(selected_articles, retry_count=0, max_retries=2):
    """Step 2: 문제 제작 (텍스트 형식)"""
    print(f"\n✏️ Step 2: 문제 제작 시작... (시도 {retry_count + 1}/{max_retries + 1})")
    
    # 프롬프트 로드
    prompt_dir = Path(__file__).parent / 'prompts' / 'step2'
    step2_data = load_prompt_files(prompt_dir)
    
    # System prompt 구성 (JSON 요구 제거)
    system_prompt = f"""
{step2_data['prompt']}

{step2_data['instructions']}

참조 파일:
"""
    for filename, content in step2_data['reference_files'].items():
        system_prompt += f"\n### {filename}\n{content}\n"
    
    # User prompt 구성
    user_prompt = f"""
{step2_data['memory']}

다음은 1단계 스크리닝 결과입니다.

{selected_articles}

위 스크리닝 결과에서 추천된 기사들을 사용하여 총 6개 문제를 제작하세요.
(블랙스완 2개, 죄수의 딜레마 2개, 시그널 디코딩 2개)
"""
    
    # Claude 호출
    response = call_claude(system_prompt, user_prompt, max_tokens=8000)
    
    print("✅ Step 2 완료: 6개 문제 생성")
    return response


def clean_text(text):
    """텍스트에서 이미지와 URL 제거"""
    import re
    
    # 이미지 관련 패턴 제거
    text = re.sub(r'!\[.*?\]\(.*?\)', '', text)  # Markdown 이미지
    text = re.sub(r'<img[^>]*>', '', text)  # HTML 이미지
    text = re.sub(r'\[이미지.*?\]', '', text)  # [이미지] 텍스트
    text = re.sub(r'\(사진.*?\)', '', text)  # (사진...) 텍스트
    
    # URL 제거 (https://www.sedaily.com 등)
    text = re.sub(r'https?://[^\s]+', '', text)
    
    # 연속된 공백 정리
    text = re.sub(r'\s+', ' ', text)
    
    return text.strip()


def parse_quiz_output(quiz_text, article_url_map, article_url_map_normalized):
    """퀴즈 출력 텍스트 파싱 (텍스트 형식)"""
    print("\n🔄 퀴즈 데이터 파싱 중...")
    
    import re
    
    def find_article_url(article_title):
        """기사 제목으로 URL 찾기 (정규화 매칭 포함)"""
        article_title_clean = clean_text(article_title.strip())
        
        # 1차: 정확한 제목 매칭
        if article_title_clean in article_url_map:
            return article_url_map[article_title_clean]
        
        # 2차: 정규화된 제목 매칭
        normalized = normalize_title(article_title_clean)
        if normalized in article_url_map_normalized:
            return article_url_map_normalized[normalized]
        
        # 3차: 부분 매칭 (제목의 앞부분이 일치하는 경우)
        for original_title, article_data in article_url_map.items():
            if article_title_clean[:30] in original_title or original_title[:30] in article_title_clean:
                print(f"   ⚠️ 부분 매칭: '{article_title_clean[:40]}...' ≈ '{original_title[:40]}...'")
                return article_data
        
        # 4차: 더 짧은 부분 매칭 (15자)
        for original_title, article_data in article_url_map.items():
            if len(article_title_clean) >= 15 and len(original_title) >= 15:
                if article_title_clean[:15] in original_title or original_title[:15] in article_title_clean:
                    print(f"   ⚠️ 짧은 부분 매칭: '{article_title_clean[:40]}...' ≈ '{original_title[:40]}...'")
                    return article_data
        
        # 5차: 키워드 매칭 (공백으로 분리된 단어 중 3개 이상 일치)
        article_words = set(article_title_clean.split())
        for original_title, article_data in article_url_map.items():
            original_words = set(original_title.split())
            common_words = article_words & original_words
            if len(common_words) >= 3:
                print(f"   ⚠️ 키워드 매칭 ({len(common_words)}개): '{article_title_clean[:40]}...' ≈ '{original_title[:40]}...'")
                return article_data
        
        print(f"   ❌ URL 못 찾음: '{article_title_clean[:50]}...'")
        print(f"      사용 가능한 기사 제목들:")
        for i, title in enumerate(list(article_url_map.keys())[:3], 1):
            print(f"      {i}. {title[:60]}...")
        
        return {}
    
    import re
    
    try:
        quiz_data = {
            'BlackSwan': [],
            'PrisonersDilemma': [],
            'SignalDecoding': []
        }
        
        # 정답 및 해설 섹션 추출
        answer_section = ""
        answer_match = re.search(r'📋 정답 및 해설(.*?)(?:━━━|💡|$)', quiz_text, re.DOTALL)
        if answer_match:
            answer_section = answer_match.group(1)
        
        # 게임별 정답 및 해설 추출
        answers_explanations = {
            'BlackSwan': [],
            'PrisonersDilemma': [],
            'SignalDecoding': []
        }
        
        # 블랙스완 정답 추출
        bs_answers = re.findall(r'\*\*블랙스완: ([①②③④])\*\*\s*(.*?)(?=\*\*|$)', answer_section, re.DOTALL)
        for ans_symbol, explanation in bs_answers:
            correct_idx = ['①', '②', '③', '④'].index(ans_symbol)
            answers_explanations['BlackSwan'].append({
                'correctAnswer': correct_idx,
                'explanation': explanation.strip()
            })
        
        # 죄수의 딜레마 정답 추출
        pd_answers = re.findall(r'\*\*죄수의 딜레마: ([①②③④])\*\*\s*(.*?)(?=\*\*|$)', answer_section, re.DOTALL)
        for ans_symbol, explanation in pd_answers:
            correct_idx = ['①', '②', '③', '④'].index(ans_symbol)
            answers_explanations['PrisonersDilemma'].append({
                'correctAnswer': correct_idx,
                'explanation': explanation.strip()
            })
        
        # 시그널 디코딩 정답 추출
        sd_answers = re.findall(r'\*\*시그널 디코딩: ([①②③④])\*\*\s*(.*?)(?=\*\*|$)', answer_section, re.DOTALL)
        for ans_symbol, explanation in sd_answers:
            correct_idx = ['①', '②', '③', '④'].index(ans_symbol)
            answers_explanations['SignalDecoding'].append({
                'correctAnswer': correct_idx,
                'explanation': explanation.strip()
            })
        
        # 문제 섹션 추출 (블랙스완)
        bs_problems = re.findall(r'🌊 블랙스완.*?\n\n(.*?)\n\n①\s*(.*?)\n②\s*(.*?)\n③\s*(.*?)\n④\s*(.*?)\n\n📰 관련 기사:\s*(.*?)\n📝\s*"(.*?)"', quiz_text, re.DOTALL)
        for idx, (question, opt1, opt2, opt3, opt4, article_title, article_summary) in enumerate(bs_problems):
            if idx < len(answers_explanations['BlackSwan']):
                article_info = find_article_url(article_title)
                article_title_clean = article_info.get('originalTitle', clean_text(article_title.strip()))
                url = article_info.get('url', '')
                
                if not url:
                    print(f"   ⚠️ 블랙스완 문제 {idx+1} URL 못 찾음: {article_title[:50]}...")
                else:
                    print(f"   ✅ 블랙스완 문제 {idx+1} URL: {url}")
                
                quiz_data['BlackSwan'].append({
                    'question': clean_text(question.strip()),
                    'options': [clean_text(opt1.strip()), clean_text(opt2.strip()), clean_text(opt3.strip()), clean_text(opt4.strip())],
                    'correctAnswer': answers_explanations['BlackSwan'][idx]['correctAnswer'],
                    'explanation': clean_text(answers_explanations['BlackSwan'][idx]['explanation']),
                    'newsLink': url,
                    'relatedArticle': {
                        'title': article_title_clean,
                        'excerpt': clean_text(article_summary.strip())
                    }
                })
        
        # 문제 섹션 추출 (죄수의 딜레마)
        pd_problems = re.findall(r'⚖️ 죄수의 딜레마.*?\n\n(.*?)\n\n①\s*(.*?)\n②\s*(.*?)\n③\s*(.*?)\n④\s*(.*?)\n\n📰 관련 기사:\s*(.*?)\n📝\s*"(.*?)"', quiz_text, re.DOTALL)
        for idx, (question, opt1, opt2, opt3, opt4, article_title, article_summary) in enumerate(pd_problems):
            if idx < len(answers_explanations['PrisonersDilemma']):
                article_info = find_article_url(article_title)
                article_title_clean = article_info.get('originalTitle', clean_text(article_title.strip()))
                url = article_info.get('url', '')
                
                if not url:
                    print(f"   ⚠️ 죄수의 딜레마 문제 {idx+1} URL 못 찾음: {article_title[:50]}...")
                else:
                    print(f"   ✅ 죄수의 딜레마 문제 {idx+1} URL: {url}")
                
                quiz_data['PrisonersDilemma'].append({
                    'question': clean_text(question.strip()),
                    'options': [clean_text(opt1.strip()), clean_text(opt2.strip()), clean_text(opt3.strip()), clean_text(opt4.strip())],
                    'correctAnswer': answers_explanations['PrisonersDilemma'][idx]['correctAnswer'],
                    'explanation': clean_text(answers_explanations['PrisonersDilemma'][idx]['explanation']),
                    'newsLink': url,
                    'relatedArticle': {
                        'title': article_title_clean,
                        'excerpt': clean_text(article_summary.strip())
                    }
                })
        
        # 문제 섹션 추출 (시그널 디코딩)
        sd_problems = re.findall(r'🔍 시그널 디코딩.*?\n\n(.*?)\n\n①\s*(.*?)\n②\s*(.*?)\n③\s*(.*?)\n④\s*(.*?)\n\n📰 관련 기사:\s*(.*?)\n📝\s*"(.*?)"', quiz_text, re.DOTALL)
        for idx, (question, opt1, opt2, opt3, opt4, article_title, article_summary) in enumerate(sd_problems):
            if idx < len(answers_explanations['SignalDecoding']):
                article_info = find_article_url(article_title)
                article_title_clean = article_info.get('originalTitle', clean_text(article_title.strip()))
                url = article_info.get('url', '')
                
                if not url:
                    print(f"   ⚠️ 시그널 디코딩 문제 {idx+1} URL 못 찾음: {article_title[:50]}...")
                else:
                    print(f"   ✅ 시그널 디코딩 문제 {idx+1} URL: {url}")
                
                quiz_data['SignalDecoding'].append({
                    'question': clean_text(question.strip()),
                    'options': [clean_text(opt1.strip()), clean_text(opt2.strip()), clean_text(opt3.strip()), clean_text(opt4.strip())],
                    'correctAnswer': answers_explanations['SignalDecoding'][idx]['correctAnswer'],
                    'explanation': clean_text(answers_explanations['SignalDecoding'][idx]['explanation']),
                    'newsLink': url,
                    'relatedArticle': {
                        'title': article_title_clean,
                        'excerpt': clean_text(article_summary.strip())
                    }
                })
        
        total_questions = sum(len(quiz_data.get(game, [])) for game in ['BlackSwan', 'PrisonersDilemma', 'SignalDecoding'])
        print(f"✅ 파싱 완료 (총 {total_questions}개 문제)")
        
        for game in ['BlackSwan', 'PrisonersDilemma', 'SignalDecoding']:
            count = len(quiz_data.get(game, []))
            print(f"   - {game}: {count}개")
        
        return quiz_data
        
    except Exception as e:
        print(f"⚠️ 파싱 오류: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            'BlackSwan': [],
            'PrisonersDilemma': [],
            'SignalDecoding': []
        }


def validate_quiz(quiz_data):
    """생성된 퀴즈 품질 검증"""
    print("\n🔍 품질 검증 중...")
    
    errors = []
    warnings = []
    
    # 1. 문제 수 확인 (완화: 최소 1개 이상)
    for game in ['BlackSwan', 'PrisonersDilemma', 'SignalDecoding']:
        count = len(quiz_data.get(game, []))
        if count == 0:
            errors.append(f"{game}: 문제 없음 (최소 1개 필요)")
        elif count != 2:
            warnings.append(f"{game}: {count}개 문제 (2개 권장)")
    
    # 2. 필수 필드 확인 (필수)
    required_fields = ['question', 'options', 'correctAnswer']
    for game, questions in quiz_data.items():
        for i, q in enumerate(questions):
            for field in required_fields:
                if field not in q:
                    errors.append(f"{game} 문제{i+1}: {field} 필드 누락")
            # 선택지 개수 확인
            if 'options' in q and len(q['options']) != 4:
                errors.append(f"{game} 문제{i+1}: 선택지 {len(q['options'])}개 (4개 필요)")
    
    # 3. 정답 번호 확인 (경고만)
    for game, questions in quiz_data.items():
        if len(questions) >= 2:
            answers = [q.get('correctAnswer') for q in questions]
            if len(set(answers)) < 2:
                warnings.append(f"{game}: 정답 번호 중복 ({answers}) - 권장하지 않지만 진행")
    
    is_valid = len(errors) == 0
    
    if is_valid:
        print("✅ 품질 검증 통과")
        if warnings:
            print("⚠️ 경고사항:")
            for warning in warnings:
                print(f"   - {warning}")
    else:
        print(f"❌ 품질 검증 실패:")
        for error in errors:
            print(f"   - {error}")
    
    return is_valid, errors


def save_to_dynamodb(quiz_data, date):
    """DynamoDB에 퀴즈 저장"""
    print("\n💾 DynamoDB에 저장 중...")
    
    table = dynamodb.Table(DYNAMODB_TABLE)
    
    # 게임별로 저장
    for game_type in ['BlackSwan', 'PrisonersDilemma', 'SignalDecoding']:
        questions = quiz_data.get(game_type, [])
        
        item = {
            'PK': f'QUIZ#{game_type}',
            'SK': f'DATE#{date}',
            'gameType': game_type,
            'date': date,  # 기존 필드명 유지
            'questions': questions,
            'createdAt': datetime.now().isoformat(),
            'updatedAt': datetime.now().isoformat()
        }
        
        table.put_item(Item=item)
        print(f"  ✅ {game_type} 저장 완료 ({len(questions)}개 문제)")
    
    print("✅ DynamoDB 저장 완료")
