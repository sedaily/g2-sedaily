"""
DynamoDB Streams 트리거 Lambda
새 퀴즈 업로드 시 자동으로 프론트엔드 배포
"""

import json
import boto3
import os
from datetime import datetime

s3 = boto3.client('s3')
cloudfront = boto3.client('cloudfront')
sns = boto3.client('sns')

S3_BUCKET = os.environ.get('S3_BUCKET', 'g2-frontend-ver2')
CLOUDFRONT_ID = os.environ.get('CLOUDFRONT_ID', 'E8HKFQFSQLNHZ')
SNS_TOPIC_ARN = os.environ.get('SNS_TOPIC_ARN', '')

def lambda_handler(event, context):
    """
    DynamoDB Streams 이벤트 처리
    """
    print(f"Received {len(event['Records'])} records")
    
    new_quizzes = []
    
    for record in event['Records']:
        if record['eventName'] in ['INSERT', 'MODIFY']:
            # 새 퀴즈 감지
            new_image = record['dynamodb'].get('NewImage', {})
            game_type = new_image.get('gameType', {}).get('S', '')
            quiz_date = new_image.get('quizDate', {}).get('S', '')
            
            if game_type and quiz_date:
                new_quizzes.append(f"{game_type} - {quiz_date}")
                print(f"New quiz detected: {game_type} on {quiz_date}")
    
    if not new_quizzes:
        print("No new quizzes to deploy")
        return {'statusCode': 200, 'body': 'No action needed'}
    
    # 배포 트리거
    try:
        # CloudFront 캐시 무효화
        invalidation = cloudfront.create_invalidation(
            DistributionId=CLOUDFRONT_ID,
            InvalidationBatch={
                'Paths': {
                    'Quantity': 1,
                    'Items': ['/*']
                },
                'CallerReference': f'auto-deploy-{datetime.now().timestamp()}'
            }
        )
        
        invalidation_id = invalidation['Invalidation']['Id']
        print(f"CloudFront invalidation created: {invalidation_id}")
        
        # SNS 알림
        if SNS_TOPIC_ARN:
            message = f"""
🚀 자동 배포 완료

새 퀴즈:
{chr(10).join(f'- {q}' for q in new_quizzes)}

CloudFront 무효화 ID: {invalidation_id}
시간: {datetime.now().isoformat()}

5-10분 후 반영됩니다.
            """
            
            sns.publish(
                TopicArn=SNS_TOPIC_ARN,
                Subject='G2 자동 배포 완료',
                Message=message
            )
            print("SNS notification sent")
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Auto-deploy triggered',
                'quizzes': new_quizzes,
                'invalidation_id': invalidation_id
            })
        }
        
    except Exception as e:
        print(f"Error during auto-deploy: {str(e)}")
        
        # 에러 알림
        if SNS_TOPIC_ARN:
            sns.publish(
                TopicArn=SNS_TOPIC_ARN,
                Subject='G2 자동 배포 실패',
                Message=f'에러: {str(e)}\n시간: {datetime.now().isoformat()}'
            )
        
        raise e
