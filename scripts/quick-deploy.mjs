#!/usr/bin/env node

import { execSync } from 'child_process';

const BUCKET_NAME = 'g2-frontend-ver2';
const CLOUDFRONT_ID = 'E1C1UNHJ75JZMZ';

console.log('⚡ Quick Deploy Started...\n');

try {
  // 1. 빌드
  console.log('📦 Building...');
  execSync('pnpm run build:export', { stdio: 'inherit' });
  
  // 2. S3 업로드
  console.log('\n📤 Uploading to S3...');
  execSync(`aws s3 sync ./out s3://${BUCKET_NAME} --delete --exclude '*.txt'`, { stdio: 'inherit' });
  
  // 3. CloudFront 무효화
  console.log('\n🔄 Invalidating CloudFront...');
  execSync(`aws cloudfront create-invalidation --distribution-id ${CLOUDFRONT_ID} --paths "/*"`, { stdio: 'inherit' });
  
  console.log('\n🎉 Quick Deploy Complete!');
  console.log(`🌐 Live at: https://d37wz4zxwakwl0.cloudfront.net`);
  console.log(`🔗 Custom Domain: https://g2-clone.ai (setup pending)`);
  
} catch (error) {
  console.error('❌ Deploy failed:', error.message);
  process.exit(1);
}