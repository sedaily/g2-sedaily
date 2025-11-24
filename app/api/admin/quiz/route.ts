import { NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = 'sedaily-quiz-data';

// 퀴즈 저장
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { gameType, quizDate, data } = body;

    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        gameType,
        quizDate,
        data,
        updatedAt: new Date().toISOString()
      }
    }));

    return NextResponse.json({ success: true, message: '퀴즈가 저장되었습니다.' });
  } catch (error) {
    console.error('Quiz save error:', error);
    return NextResponse.json(
      { success: false, error: '저장 실패' },
      { status: 500 }
    );
  }
}

// 퀴즈 조회
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const gameType = searchParams.get('gameType');
    const quizDate = searchParams.get('quizDate');

    if (gameType && quizDate) {
      // 특정 퀴즈 조회
      const result = await docClient.send(new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: 'gameType = :gt AND quizDate = :qd',
        ExpressionAttributeValues: {
          ':gt': gameType,
          ':qd': quizDate
        }
      }));

      return NextResponse.json({
        success: true,
        data: result.Items?.[0] || null
      });
    }

    // 전체 퀴즈 조회
    const result = await docClient.send(new ScanCommand({
      TableName: TABLE_NAME
    }));

    return NextResponse.json({
      success: true,
      data: result.Items || []
    });
  } catch (error) {
    console.error('Quiz fetch error:', error);
    return NextResponse.json(
      { success: false, error: '조회 실패' },
      { status: 500 }
    );
  }
}
