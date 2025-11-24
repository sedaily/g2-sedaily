import json
import boto3
import os
from datetime import datetime
from decimal import Decimal
import logging
from typing import Dict, Any, Optional

# 로깅 설정
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# 상수 정의
AWS_REGION = os.environ.get('AWS_REGION', 'us-east-1')
DYNAMODB_TABLE = os.environ.get('DYNAMODB_TABLE')

if not DYNAMODB_TABLE:
    raise ValueError('DYNAMODB_TABLE environment variable is required')

# DynamoDB 설정
dynamodb = boto3.resource('dynamodb', region_name=AWS_REGION)
table = dynamodb.Table(DYNAMODB_TABLE)

def decimal_default(obj):
    """DynamoDB Decimal 타입을 JSON으로 변환"""
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError(f'Object of type {type(obj)} is not JSON serializable')

def create_response(status_code: int, body: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    """표준 API 응답 생성"""
    return {
        'statusCode': status_code,
        'headers': headers,
        'body': json.dumps(body, default=decimal_default)
    }

def lambda_handler(event, context):
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
    
    try:
        # CORS preflight 처리
        if event.get('httpMethod') == 'OPTIONS':
            return create_response(200, {}, headers)
        
        method = event.get('httpMethod', 'GET')
        path = event.get('path', '')
        
        # 메트릭 전송
        send_cloudwatch_metric(f'QuizAPI_{method}', 1)
        
        # POST: 퀴즈 저장 (관리자 페이지용)
        if method == 'POST':
            return handle_save_quiz(event, headers)
        
        # GET: 퀴즈 조회 (사용자 페이지용)
        elif method == 'GET':
            return handle_get_quiz(event, headers, path)
        
        else:
            return create_response(405, {'error': 'Method not allowed'}, headers)
        
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        return create_response(400, {'error': str(e)}, headers)
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return create_response(500, {'error': 'Internal server error'}, headers)

def handle_save_quiz(event, headers):
    """퀴즈 저장 처리"""
    try:
        body = json.loads(event.get('body', '{}'))
        game_type = body.get('gameType')
        quiz_date = body.get('quizDate')
        data = body.get('data', {})
        
        # Quizlet 데이터 처리
        if game_type == 'Quizlet':
            terms = data.get('terms', [])
            set_name = data.get('setName', '')
            
            if not all([game_type, quiz_date, terms, set_name]):
                return create_response(400, {
                    'error': 'Missing required fields for Quizlet: gameType, quizDate, terms, setName'
                }, headers)
        else:
            # 일반 퀴즈 데이터 처리
            questions = data.get('questions', [])
            
            if not all([game_type, quiz_date, questions]):
                return create_response(400, {
                    'error': 'Missing required fields: gameType, quizDate, questions'
                }, headers)
        
        # 기존 데이터 확인
        try:
            existing = table.get_item(Key={'PK': f"QUIZ#{game_type}", 'SK': quiz_date})
            action = 'Updating' if 'Item' in existing else 'Creating'
            logger.info(f"{action} quiz: {game_type} {quiz_date}")
        except Exception as e:
            logger.warning(f"Error checking existing item: {e}")
        
        # 데이터 저장
        if game_type == 'Quizlet':
            # Quizlet 데이터 저장
            table.put_item(Item={
                'PK': f"QUIZ#{game_type}",
                'SK': quiz_date,
                'gameType': game_type,
                'quizDate': quiz_date,
                'data': data,  # 전체 data 객체 저장
                'termCount': len(terms),
                'setName': set_name,
                'createdAt': datetime.utcnow().isoformat(),
                'updatedAt': datetime.utcnow().isoformat()
            })
            
            logger.info(f"Successfully saved {len(terms)} terms for Quizlet set '{set_name}' on {quiz_date}")
            send_cloudwatch_metric('QuizSaved_Quizlet', 1)
            
            return create_response(200, {
                'success': True, 
                'message': f'Quizlet set saved successfully: {set_name}',
                'termCount': len(terms)
            }, headers)
        else:
            # 일반 퀴즈 데이터 저장
            table.put_item(Item={
                'PK': f"QUIZ#{game_type}",
                'SK': quiz_date,
                'gameType': game_type,
                'quizDate': quiz_date,
                'questions': questions,
                'questionCount': len(questions),
                'createdAt': datetime.utcnow().isoformat(),
                'updatedAt': datetime.utcnow().isoformat()
            })
            
            logger.info(f"Successfully saved {len(questions)} questions for {game_type} on {quiz_date}")
            send_cloudwatch_metric(f'QuizSaved_{game_type}', 1)
            
            return create_response(200, {
                'success': True, 
                'message': f'Quiz saved successfully for {game_type} on {quiz_date}',
                'questionCount': len(questions)
            }, headers)
        
    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON in request body: {e}")
        return create_response(400, {'error': 'Invalid JSON format'}, headers)
    except boto3.exceptions.Boto3Error as e:
        logger.error(f"DynamoDB error in handle_save_quiz: {e}")
        return create_response(500, {'error': 'Database error'}, headers)
    except Exception as e:
        logger.error(f"Unexpected error in handle_save_quiz: {e}")
        return create_response(500, {'error': 'Failed to save quiz'}, headers)

def handle_get_quiz(event, headers, path):
    """퀴즈 조회 처리"""
    try:
        # /all 경로: 모든 퀴즈 데이터 반환
        if path.endswith('/all') or event.get('queryStringParameters', {}).get('action') == 'all':
            response = table.scan()
            items = response.get('Items', [])
            
            # 게임 페이지 호환 형식으로 변환 (List comprehension 사용)
            quiz_items = [
                {
                    'gameType': item.get('gameType'),
                    'quizDate': item.get('quizDate'),
                    'data': {'questions': item.get('questions', [])},
                    'questionCount': item.get('questionCount', 0),
                    'updatedAt': item.get('updatedAt')
                }
                for item in items
            ]
            
            send_cloudwatch_metric('QuizFetch_All', 1)
            return create_response(200, quiz_items, headers)
        
        # 날짜별 API: /gameType/date 형식
        path_parts = [p for p in path.split('/') if p]
        if len(path_parts) >= 2:
            game_type = path_parts[-2]  # 뒤에서 두 번째
            quiz_date = path_parts[-1]   # 마지막
            
            response = table.get_item(Key={'PK': f"QUIZ#{game_type}", 'SK': quiz_date})
            
            if 'Item' not in response:
                send_cloudwatch_metric('QuizNotFound', 1)
                return create_response(404, {
                    'error': f'Quiz not found for {game_type} on {quiz_date}'
                }, headers)
            
            item = response['Item']
            
            send_cloudwatch_metric(f'QuizFetch_{game_type}', 1)
            
            # Quizlet 데이터 형식 처리
            if game_type == 'Quizlet':
                return create_response(200, {
                    'success': True,
                    'setName': item.get('data', {}).get('setName', ''),
                    'terms': item.get('data', {}).get('terms', []),
                    'data': item.get('data', {}),
                    'gameType': item.get('gameType'),
                    'quizDate': item.get('quizDate'),
                    'updatedAt': item.get('updatedAt')
                }, headers)
            
            # 일반 퀴즈 데이터 형식
            return create_response(200, {
                'success': True,
                'questions': item.get('questions', []),
                'data': {'questions': item.get('questions', [])},
                'gameType': item.get('gameType'),
                'quizDate': item.get('quizDate'),
                'questionCount': item.get('questionCount', 0),
                'updatedAt': item.get('updatedAt')
            }, headers)
        
        # 메타데이터 API: /meta/gameType 형식
        if 'meta' in path_parts and len(path_parts) >= 2:
            game_type = path_parts[-1]
            
            # 특정 게임 타입의 모든 날짜 조회
            response = table.query(
                KeyConditionExpression=boto3.dynamodb.conditions.Key('PK').eq(f"QUIZ#{game_type}")
            )
            
            dates = sorted([item['SK'] for item in response.get('Items', [])], reverse=True)
            
            send_cloudwatch_metric(f'MetaFetch_{game_type}', 1)
            return create_response(200, {
                'success': True,
                'dates': dates,
                'gameType': game_type,
                'count': len(dates)
            }, headers)
        
        # 기존 쿼리 파라미터 방식 (하위 호환성)
        params = event.get('queryStringParameters') or {}
        game_type = params.get('gameType')
        quiz_date = params.get('quizDate')
        
        if not game_type or not quiz_date:
            return create_response(400, {
                'error': 'Missing parameters: gameType and quizDate required'
            }, headers)
        
        response = table.get_item(Key={'PK': f"QUIZ#{game_type}", 'SK': quiz_date})
        
        if 'Item' not in response:
            return create_response(404, {
                'error': f'Quiz not found for {game_type} on {quiz_date}'
            }, headers)
        
        return create_response(200, {
            'success': True,
            'data': response['Item']
        }, headers)
        
    except boto3.exceptions.Boto3Error as e:
        logger.error(f"DynamoDB error in handle_get_quiz: {e}")
        return create_response(500, {'error': 'Database error'}, headers)
    except Exception as e:
        logger.error(f"Unexpected error in handle_get_quiz: {e}")
        return create_response(500, {'error': 'Failed to get quiz'}, headers)

def send_cloudwatch_metric(metric_name: str, value: float, unit: str = 'Count') -> None:
    """
    CloudWatch 커스텀 메트릭 전송
    """
    try:
        cloudwatch = boto3.client('cloudwatch', region_name=AWS_REGION)
        cloudwatch.put_metric_data(
            Namespace='G2/Quiz',
            MetricData=[
                {
                    'MetricName': metric_name,
                    'Value': value,
                    'Unit': unit,
                    'Timestamp': datetime.utcnow()
                }
            ]
        )
    except boto3.exceptions.Boto3Error as e:
        logger.warning(f"Failed to send CloudWatch metric {metric_name}: {str(e)}")
    except Exception as e:
        logger.warning(f"Unexpected error sending metric {metric_name}: {str(e)}")