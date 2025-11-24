#!/usr/bin/env node

/**
 * 환경 변수 검증 스크립트
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// .env.local 파일 읽기
try {
  const envPath = join(__dirname, '..', '.env.local');
  const envContent = readFileSync(envPath, 'utf8');
  
  // 환경 변수 파싱
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        process.env[key] = valueParts.join('=');
      }
    }
  });
} catch (error) {
  console.error('❌ .env.local 파일을 찾을 수 없습니다.');
  process.exit(1);
}

console.log('🔍 환경 변수 검증 중...\n');

const requiredVars = [
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_REGION',
  'DYNAMODB_TABLE_NAME',
  'ADMIN_PASSWORD',
  'NEXT_PUBLIC_CHATBOT_API_URL'
];

const optionalVars = [
  'CLOUDFRONT_DISTRIBUTION_ID',
  'BIGKINDS_API_KEY',
  'SLACK_WEBHOOK_URL',
  'DISCORD_WEBHOOK_URL'
];

let hasErrors = false;

console.log('✅ 필수 환경 변수:');
for (const varName of requiredVars) {
  const value = process.env[varName];
  if (!value || value.includes('your_') || value.includes('here')) {
    console.log(`   ❌ ${varName}: 설정 필요`);
    hasErrors = true;
  } else {
    const maskedValue = varName.includes('SECRET') || varName.includes('PASSWORD') 
      ? '***' + value.slice(-4)
      : value.slice(0, 20) + (value.length > 20 ? '...' : '');
    console.log(`   ✅ ${varName}: ${maskedValue}`);
  }
}

console.log('\n📋 선택 환경 변수:');
for (const varName of optionalVars) {
  const value = process.env[varName];
  if (value && !value.includes('your_') && !value.includes('here')) {
    const maskedValue = varName.includes('WEBHOOK') 
      ? value.slice(0, 30) + '...'
      : value;
    console.log(`   ✅ ${varName}: ${maskedValue}`);
  } else {
    console.log(`   ⚪ ${varName}: 미설정 (선택사항)`);
  }
}

if (hasErrors) {
  console.log('\n❌ 필수 환경 변수가 설정되지 않았습니다.');
  console.log('📝 .env.local 파일을 확인하고 실제 값으로 업데이트하세요.');
  console.log('\n💡 AWS 자격증명 확인: aws configure list\n');
  process.exit(1);
} else {
  console.log('\n✅ 모든 필수 환경 변수가 설정되었습니다!');
  console.log('\n🚀 다음 단계:');
  console.log('   1. pnpm build (로컬 빌드 테스트)');
  console.log('   2. vercel --prod (Vercel 배포)\n');
  process.exit(0);
}
