import { NextResponse } from 'next/server';
import { CloudFrontClient, CreateInvalidationCommand } from '@aws-sdk/client-cloudfront';

const cloudfront = new CloudFrontClient({ region: 'us-east-1' });
const DISTRIBUTION_ID = 'E8HKFQFSQLNHZ';

export async function POST(request: Request) {
  try {
    const { paths = ['/*'] } = await request.json();

    const command = new CreateInvalidationCommand({
      DistributionId: DISTRIBUTION_ID,
      InvalidationBatch: {
        CallerReference: `admin-${Date.now()}`,
        Paths: {
          Quantity: paths.length,
          Items: paths
        }
      }
    });

    const result = await cloudfront.send(command);

    return NextResponse.json({
      success: true,
      invalidationId: result.Invalidation?.Id,
      message: 'CloudFront 캐시 무효화가 시작되었습니다.'
    });
  } catch (error) {
    console.error('Invalidation error:', error);
    return NextResponse.json(
      { success: false, error: '캐시 무효화 실패' },
      { status: 500 }
    );
  }
}
