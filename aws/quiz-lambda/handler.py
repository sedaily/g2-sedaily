import json
import boto3
import os
from datetime import datetime
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ.get('DYNAMODB_TABLE', 'sedaily-quiz-data'))

def decimal_default(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError

def cors_headers():
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Type': 'application/json'
    }

def transform_question(q, index):
    """DynamoDB 퀴즈 데이터를 웹사이트 Question 타입으로 변환"""
    correct_index = int(q.get('correctAnswer', 0))
    options = q.get('options', [])
    
    return {
        'id': f"q{index + 1}",
        'questionType': '객관식',
        'question': q.get('question', ''),
        'options': options,
        'answer': options[correct_index] if correct_index < len(options) else '',
        'explanation': q.get('explanation', ''),
        'newsLink': '#',  # 기사 링크는 나중에 추가
        'tags': '경제·금융',  # 기본 태그
        'relatedArticle': {
            'title': q.get('articleTitle', ''),
            'excerpt': q.get('articleSummary', '')
        }
    }

def lambda_handler(event, context):
    method = event.get('httpMethod')
    path = event.get('path', '').replace('/prod', '')
    
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers(), 'body': ''}
    
    try:
        # GET /quiz/{gameType}/dates
        if method == 'GET' and '/dates' in path:
            parts = [p for p in path.split('/') if p]
            game_type = parts[1] if len(parts) > 1 else None
            if not game_type:
                return {'statusCode': 400, 'headers': cors_headers(), 'body': json.dumps({'error': 'Invalid path'})}
            response = table.query(
                KeyConditionExpression='PK = :pk',
                ExpressionAttributeValues={':pk': f'QUIZ#{game_type}'},
                ProjectionExpression='SK, createdAt'
            )
            dates = [item['SK'].replace('DATE#', '') for item in response.get('Items', [])]
            return {
                'statusCode': 200,
                'headers': cors_headers(),
                'body': json.dumps({'dates': sorted(dates, reverse=True)})
            }
        
        # GET /quiz/{gameType}/{date}
        if method == 'GET' and not '/dates' in path:
            parts = [p for p in path.split('/') if p]
            if len(parts) >= 3:
                game_type = parts[1]
                date = parts[2]
            
            result = table.get_item(
                Key={'PK': f'QUIZ#{game_type}', 'SK': f'DATE#{date}'}
            )
            
            if 'Item' not in result:
                return {
                    'statusCode': 404,
                    'headers': cors_headers(),
                    'body': json.dumps({'error': 'Quiz not found'})
                }
            
            # 데이터 변환
            item = result['Item']
            raw_questions = item.get('questions', [])
            transformed_questions = [transform_question(q, i) for i, q in enumerate(raw_questions)]
            
            response_data = {
                'gameType': item.get('gameType'),
                'date': item.get('date'),
                'questions': transformed_questions
            }
            
            return {
                'statusCode': 200,
                'headers': cors_headers(),
                'body': json.dumps(response_data, default=decimal_default)
            }
        
        # POST /quiz/{gameType}
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            # admin-utils 형식 지원: {gameType, quizDate, data: {questions}}
            game_type = body.get('gameType')
            date = body.get('quizDate') or body.get('date', datetime.now().strftime('%Y-%m-%d'))
            
            # questions 추출
            if 'data' in body and 'questions' in body['data']:
                questions = body['data']['questions']
            else:
                questions = body.get('questions', [])
            
            if not game_type:
                return {'statusCode': 400, 'headers': cors_headers(), 'body': json.dumps({'error': 'gameType required'})}
            
            item = {
                'PK': f'QUIZ#{game_type}',
                'SK': f'DATE#{date}',
                'gameType': game_type,
                'date': date,
                'questions': questions,
                'createdAt': datetime.now().isoformat(),
                'updatedAt': datetime.now().isoformat()
            }
            
            table.put_item(Item=item)
            
            return {
                'statusCode': 201,
                'headers': cors_headers(),
                'body': json.dumps({'message': 'Quiz created', 'date': date})
            }
        
        # DELETE /quiz/{gameType}/{date}
        if method == 'DELETE':
            parts = [p for p in path.split('/') if p]
            if len(parts) >= 3:
                game_type = parts[1]
                date = parts[2]
            
            table.delete_item(
                Key={'PK': f'QUIZ#{game_type}', 'SK': f'DATE#{date}'}
            )
            
            return {
                'statusCode': 200,
                'headers': cors_headers(),
                'body': json.dumps({'message': 'Quiz deleted'})
            }
        
        return {
            'statusCode': 400,
            'headers': cors_headers(),
            'body': json.dumps({'error': 'Invalid request'})
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': cors_headers(),
            'body': json.dumps({'error': str(e)})
        }
