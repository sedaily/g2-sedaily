import { NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const gameType = searchParams.get('gameType');

    if (!gameType) {
      return NextResponse.json(
        { success: false, error: 'gameType required' },
        { status: 400 }
      );
    }

    const result = await docClient.send(new ScanCommand({
      TableName: 'sedaily-quiz-data',
      FilterExpression: 'gameType = :gt',
      ExpressionAttributeValues: {
        ':gt': gameType
      }
    }));

    const items = result.Items || [];
    const sorted = items.sort((a, b) => 
      b.quizDate.localeCompare(a.quizDate)
    );

    return NextResponse.json({
      success: true,
      data: sorted[0] || null,
      updatedAt: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
  } catch (error) {
    console.error('Latest quiz error:', error);
    return NextResponse.json(
      { success: false, error: '조회 실패' },
      { status: 500 }
    );
  }
}
