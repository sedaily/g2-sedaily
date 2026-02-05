#!/usr/bin/env python3
"""
Lambda 함수 로컬 테스트 스크립트
BigKinds API URL 확인용
"""

import os
import sys
import json
from pathlib import Path

# 현재 디렉토리를 Python 경로에 추가
sys.path.insert(0, str(Path(__file__).parent))

# 환경 변수 설정 (테스트용)
os.environ['AWS_REGION'] = 'us-east-1'
os.environ['DYNAMODB_TABLE'] = 'sedaily-quiz-data-test'

# .env 파일에서 BIGKINDS_API_KEY 로드
env_file = Path(__file__).parent.parent.parent / '.env'
if env_file.exists():
    with open(env_file) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                if key == 'BIGKINDS_API_KEY':
                    os.environ['BIGKINDS_API_KEY'] = value.strip()

from lambda_function import fetch_bigkinds_news

def test_bigkinds_url():
    """BigKinds API에서 URL 필드 확인"""
    print("=" * 60)
    print("🧪 BigKinds API URL 테스트")
    print("=" * 60)
    
    try:
        # 기사 3개만 가져오기 (테스트용)
        articles = fetch_bigkinds_news(count=3)
        
        print(f"\n📊 가져온 기사 수: {len(articles)}개\n")
        
        # 첫 번째 기사의 모든 필드 출력
        if articles:
            print("=" * 60)
            print("첫 번째 기사의 모든 필드:")
            print("=" * 60)
            for key, value in articles[0].items():
                if isinstance(value, str) and len(value) > 100:
                    print(f"{key}: {value[:100]}...")
                else:
                    print(f"{key}: {value}")
            print("=" * 60)
            print()
        
        for i, article in enumerate(articles, 1):
            news_id = article.get('news_id', 'N/A')
            provider_link = article.get('provider_link_page', 'N/A')
            
            # ?ref=kpf 제거
            clean_url = provider_link.split('?')[0] if provider_link != 'N/A' else 'N/A'
            
            print(f"[기사 {i}]")
            print(f"제목: {article.get('title', 'N/A')[:60]}...")
            print(f"News ID: {news_id}")
            print(f"Provider Link (원본): {provider_link}")
            print(f"Provider Link (정리): {clean_url}")
            print(f"발행일: {article.get('published_at', 'N/A')}")
            print()
        
        # provider_link_page 필드 존재 여부 확인
        has_provider_link = all('provider_link_page' in article and article['provider_link_page'] for article in articles)
        
        if has_provider_link:
            print("✅ 모든 기사에 provider_link_page 필드가 존재합니다.")
            print("✅ 서울경제 원문 URL을 직접 사용할 수 있습니다.")
        else:
            print("⚠️ 일부 기사에 provider_link_page 필드가 없습니다.")
            print("⚠️ BigKinds URL을 fallback으로 사용합니다.")
        
        return articles
        
    except Exception as e:
        print(f"\n❌ 오류 발생: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == '__main__':
    test_bigkinds_url()
