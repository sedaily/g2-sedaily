import { NextRequest, NextResponse } from 'next/server';

interface ChatRequest {
  message: string;
  conversationId?: string;
}

interface ChatResponse {
  response: string;
  conversationId: string;
  sources?: Array<{
    title: string;
    provider: string;
    published_at: string;
    url?: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const { message, conversationId }: ChatRequest = await request.json();

    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const lambdaUrl = process.env.NEXT_PUBLIC_CHAT_LAMBDA_URL;
    if (!lambdaUrl) {
      return NextResponse.json(
        { error: 'Chat service not configured' },
        { status: 500 }
      );
    }

    const lambdaResponse = await fetch(lambdaUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        conversationId: conversationId || `chat_${Date.now()}`
      })
    });

    if (!lambdaResponse.ok) {
      throw new Error(`Lambda error: ${lambdaResponse.status}`);
    }

    const result: ChatResponse = await lambdaResponse.json();

    return NextResponse.json(result);

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}