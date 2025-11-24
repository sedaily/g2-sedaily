#!/usr/bin/env node

import { execSync } from 'child_process';
import { CONFIG } from './config.mjs';

console.log('☁️ AWS Advanced Setup\n');

const exec = (cmd) => {
  try {
    return execSync(cmd, { encoding: 'utf-8' });
  } catch (error) {
    console.error(`❌ Failed: ${cmd}`);
    return null;
  }
};

// 1. DynamoDB Streams 활성화
function enableDynamoDBStreams() {
  console.log('📊 Enabling DynamoDB Streams...');
  const result = exec(`
    aws dynamodb update-table \
      --table-name ${CONFIG.AWS.DYNAMODB_TABLE} \
      --stream-specification StreamEnabled=true,StreamViewType=NEW_AND_OLD_IMAGES \
      --region ${CONFIG.AWS.REGION}
  `);
  console.log(result ? '✅ DynamoDB Streams enabled' : '⚠️ Already enabled or failed');
}

// 2. SNS 토픽 생성
function createSNSTopic() {
  console.log('\n📢 Creating SNS Topic...');
  const result = exec(`
    aws sns create-topic \
      --name g2-notifications \
      --region ${CONFIG.AWS.REGION}
  `);
  if (result) {
    const topicArn = JSON.parse(result).TopicArn;
    console.log(`✅ SNS Topic created: ${topicArn}`);
    return topicArn;
  }
  console.log('⚠️ Topic already exists or failed');
  return null;
}

// 3. CloudWatch Alarm 생성
function createCloudWatchAlarms() {
  console.log('\n⏰ Creating CloudWatch Alarms...');
  
  // Lambda 에러 알람
  exec(`
    aws cloudwatch put-metric-alarm \
      --alarm-name g2-lambda-errors \
      --alarm-description "Lambda error rate > 5%" \
      --metric-name Errors \
      --namespace AWS/Lambda \
      --dimensions Name=FunctionName,Value=${CONFIG.AWS.LAMBDA_CHATBOT} \
      --statistic Sum \
      --period 300 \
      --threshold 5 \
      --comparison-operator GreaterThanThreshold \
      --region ${CONFIG.AWS.REGION}
  `);
  
  // DynamoDB 읽기 용량 알람
  exec(`
    aws cloudwatch put-metric-alarm \
      --alarm-name g2-dynamodb-read-capacity \
      --alarm-description "DynamoDB read capacity > 80%" \
      --metric-name ConsumedReadCapacityUnits \
      --namespace AWS/DynamoDB \
      --dimensions Name=TableName,Value=${CONFIG.AWS.DYNAMODB_TABLE} \
      --statistic Average \
      --period 300 \
      --threshold 80 \
      --comparison-operator GreaterThanThreshold \
      --region ${CONFIG.AWS.REGION}
  `);
  
  console.log('✅ CloudWatch Alarms created');
}

// 4. S3 버킷 정책 강화
function updateS3BucketPolicy() {
  console.log('\n🔒 Updating S3 Bucket Policy...');
  
  const policy = {
    Version: '2012-10-17',
    Statement: [{
      Sid: 'CloudFrontOnly',
      Effect: 'Allow',
      Principal: {
        Service: 'cloudfront.amazonaws.com'
      },
      Action: 's3:GetObject',
      Resource: `arn:aws:s3:::${CONFIG.AWS.S3_BUCKET}/*`,
      Condition: {
        StringEquals: {
          'AWS:SourceArn': `arn:aws:cloudfront::*:distribution/${CONFIG.AWS.CLOUDFRONT_ID}`
        }
      }
    }]
  };
  
  const policyFile = '/tmp/s3-policy.json';
  require('fs').writeFileSync(policyFile, JSON.stringify(policy, null, 2));
  
  exec(`aws s3api put-bucket-policy --bucket ${CONFIG.AWS.S3_BUCKET} --policy file://${policyFile}`);
  console.log('✅ S3 Bucket Policy updated');
}

// 5. CloudWatch Dashboard 생성
function createCloudWatchDashboard() {
  console.log('\n📊 Creating CloudWatch Dashboard...');
  
  const dashboard = {
    widgets: [
      {
        type: 'metric',
        properties: {
          metrics: [
            ['AWS/Lambda', 'Invocations', { stat: 'Sum', label: 'Lambda Invocations' }],
            ['AWS/Lambda', 'Errors', { stat: 'Sum', label: 'Lambda Errors' }],
            ['AWS/DynamoDB', 'ConsumedReadCapacityUnits', { stat: 'Sum', label: 'DynamoDB Reads' }],
            ['AWS/CloudFront', 'Requests', { stat: 'Sum', label: 'CloudFront Requests' }]
          ],
          period: 300,
          stat: 'Average',
          region: CONFIG.AWS.REGION,
          title: 'G2 Platform Overview',
          yAxis: { left: { min: 0 } }
        }
      }
    ]
  };
  
  const dashboardFile = '/tmp/dashboard.json';
  require('fs').writeFileSync(dashboardFile, JSON.stringify(dashboard));
  
  exec(`
    aws cloudwatch put-dashboard \
      --dashboard-name G2-Platform \
      --dashboard-body file://${dashboardFile} \
      --region ${CONFIG.AWS.REGION}
  `);
  
  console.log('✅ CloudWatch Dashboard created');
  console.log(`🔗 View at: https://console.aws.amazon.com/cloudwatch/home?region=${CONFIG.AWS.REGION}#dashboards:name=G2-Platform`);
}

// 6. Lambda 환경 변수 업데이트
function updateLambdaConfig() {
  console.log('\n⚙️ Updating Lambda Configuration...');
  
  exec(`
    aws lambda update-function-configuration \
      --function-name ${CONFIG.AWS.LAMBDA_CHATBOT} \
      --timeout 60 \
      --memory-size 1024 \
      --region ${CONFIG.AWS.REGION}
  `);
  
  console.log('✅ Lambda configuration updated');
}

// 메인 실행
const args = process.argv.slice(2);

if (args[0] === 'all') {
  enableDynamoDBStreams();
  createSNSTopic();
  createCloudWatchAlarms();
  updateS3BucketPolicy();
  createCloudWatchDashboard();
  updateLambdaConfig();
  console.log('\n🎉 AWS Advanced Setup Complete!');
} else if (args[0] === 'streams') {
  enableDynamoDBStreams();
} else if (args[0] === 'sns') {
  createSNSTopic();
} else if (args[0] === 'alarms') {
  createCloudWatchAlarms();
} else if (args[0] === 's3') {
  updateS3BucketPolicy();
} else if (args[0] === 'dashboard') {
  createCloudWatchDashboard();
} else if (args[0] === 'lambda') {
  updateLambdaConfig();
} else {
  console.log(`
Usage: node scripts/aws-setup.mjs [command]

Commands:
  all        - Run all setup steps
  streams    - Enable DynamoDB Streams
  sns        - Create SNS Topic
  alarms     - Create CloudWatch Alarms
  s3         - Update S3 Bucket Policy
  dashboard  - Create CloudWatch Dashboard
  lambda     - Update Lambda Configuration

Example:
  node scripts/aws-setup.mjs all
  node scripts/aws-setup.mjs dashboard
  `);
}
