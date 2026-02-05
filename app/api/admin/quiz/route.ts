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
    const { gameType, date, data } = body;  // quizDate → date

    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        gameType,
        date,  // quizDate → date
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
    const date = searchParams.get('date');  // quizDate → date

    if (gameType && date) {
      // 특정 퀴즈 조회
      const result = await docClient.send(new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: 'gameType = :gt AND #date = :d',  // date는 예약어라서 alias 사용
        ExpressionAttributeNames: {
          '#date': 'date'
        },
        ExpressionAttributeValues: {
          ':gt': gameType,
          ':d': date
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
