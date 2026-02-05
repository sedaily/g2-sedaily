import { NextResponse } from 'next/server';
import { DynamoDBClient, DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import { CloudWatchClient, GetMetricStatisticsCommand } from '@aws-sdk/client-cloudwatch';

export const revalidate = 0;

const dynamodb = new DynamoDBClient({ region: 'us-east-1' });
const cloudwatch = new CloudWatchClient({ region: 'us-east-1' });

export async function GET() {
  try {
    // DynamoDB 메트릭
    const tableInfo = await dynamodb.send(new DescribeTableCommand({
      TableName: 'sedaily-quiz-data'
    }));

    // CloudWatch Lambda 메트릭 (최근 1시간)
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - 3600000);

    const lambdaInvocations = await cloudwatch.send(new GetMetricStatisticsCommand({
      Namespace: 'AWS/Lambda',
      MetricName: 'Invocations',
      StartTime: startTime,
      EndTime: endTime,
      Period: 3600,
      Statistics: ['Sum'],
      Dimensions: [{
        Name: 'FunctionName',
        Value: 'sedaily-chatbot-dev-handler'
      }]
    }));

    const lambdaErrors = await cloudwatch.send(new GetMetricStatisticsCommand({
      Namespace: 'AWS/Lambda',
      MetricName: 'Errors',
      StartTime: startTime,
      EndTime: endTime,
      Period: 3600,
      Statistics: ['Sum'],
      Dimensions: [{
        Name: 'FunctionName',
        Value: 'sedaily-chatbot-dev-handler'
      }]
    }));

    return NextResponse.json({
      success: true,
      metrics: {
        dynamodb: {
          itemCount: tableInfo.Table?.ItemCount || 0,
          tableSizeBytes: tableInfo.Table?.TableSizeBytes || 0,
          status: tableInfo.Table?.TableStatus || 'UNKNOWN'
        },
        lambda: {
          invocations: lambdaInvocations.Datapoints?.[0]?.Sum || 0,
          errors: lambdaErrors.Datapoints?.[0]?.Sum || 0
        },
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Metrics error:', error);
    return NextResponse.json(
      { success: false, error: '메트릭 조회 실패' },
      { status: 500 }
    );
  }
}
