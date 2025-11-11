#!/usr/bin/env node

import { execSync } from 'child_process';

const BUCKET_NAME = 'g2-frontend-ver2';
const CLOUDFRONT_ID = 'E1C1UNHJ75JZMZ';

console.log('🚀 Full Deploy (Frontend + Backend)...\n');

try {
  // 1. Frontend 배포
  console.log('📦 Building frontend...');
  execSync('pnpm run build:export', { stdio: 'inherit' });
  
  console.log('\n📤 Deploying frontend...');
  execSync(`aws s3 sync ./out s3://${BUCKET_NAME} --delete --exclude '*.txt'`, { stdio: 'inherit' });
  
  // 2. Backend 배포 (Direct Lambda Update)
  console.log('\n🔧 Deploying backend...');
  console.log('Creating Lambda deployment package...');
  execSync('cd backend/lambda && zip -r ../enhanced-chatbot.zip .', { stdio: 'inherit' });
  
  console.log('Updating Lambda function...');
  execSync('cd backend && aws lambda update-function-code --function-name sedaily-chatbot-dev-handler --zip-file fileb://enhanced-chatbot.zip', { stdio: 'inherit' });
  
  // 3. CloudFront 무효화
  console.log('\n🔄 Invalidating CloudFront...');
  execSync(`aws cloudfront create-invalidation --distribution-id ${CLOUDFRONT_ID} --paths "/*"`, { stdio: 'inherit' });
  
  console.log('\n🎉 Full deployment complete!');
  console.log(`🌐 Live at: https://d37wz4zxwakwl0.cloudfront.net`);
  console.log(`🔗 Custom Domain: https://g2-clone.ai (setup pending)`);
  
} catch (error) {
  console.error('❌ Deploy failed:', error.message);
  process.exit(1);
}