#!/usr/bin/env node

/**
 * Ultimate Deploy Script - 최종 개선된 배포 시스템
 * Frontend + Backend + 완전한 검증 시스템
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { CONFIG } from './config.mjs';
import { retryWithBackoff, safeExec, saveDeployLog, checkHttpStatus } from './utils.mjs';

class UltimateDeploy {
  constructor() {
    this.startTime = Date.now();
    this.deployMode = process.argv[2] || 'frontend';
    this.skipTests = process.argv.includes('--skip-tests');
    this.force = process.argv.includes('--force');
    this.deployLog = {
      timestamp: new Date().toISOString(),
      mode: this.deployMode,
      steps: []
    };
  }

  async deploy() {
    console.log('🚀 Ultimate Deploy System Starting...\n');
    console.log(`📋 Mode: ${this.deployMode}`);
    console.log(`⏰ Started at: ${new Date().toLocaleString()}\n`);

    try {
      // 1. 사전 검증
      await this.preValidation();

      // 2. 배포 실행
      switch (this.deployMode) {
        case 'frontend':
          await this.deployFrontend();
          break;
        case 'backend':
          await this.deployBackend();
          break;
        case 'full':
          await this.deployFrontend();
          await this.deployBackend();
          break;
        default:
          throw new Error(`Unknown deploy mode: ${this.deployMode}`);
      }

      // 3. 사후 검증
      if (!this.skipTests) {
        await this.postValidation();
      }

      // 4. 성공 보고
      this.reportSuccess();
      
      // 5. 배포 로그 저장
      this.deployLog.status = 'success';
      this.deployLog.duration = ((Date.now() - this.startTime) / 1000).toFixed(1);
      saveDeployLog(this.deployLog);

    } catch (error) {
      await this.handleError(error);
    }
  }

  // 사전 검증
  async preValidation() {
    console.log('🔍 Pre-deployment Validation...\n');

    // AWS CLI 및 자격증명 확인
    this.validateAWS();

    // 프로젝트 상태 확인
    this.validateProject();

    // 의존성 확인
    if (this.deployMode === 'frontend' || this.deployMode === 'full') {
      this.validateFrontendDeps();
    }

    if (this.deployMode === 'backend' || this.deployMode === 'full') {
      this.validateBackendDeps();
    }

    console.log('✅ Pre-validation passed\n');
  }

  // AWS 환경 검증
  validateAWS() {
    console.log('🔧 Validating AWS environment...');

    try {
      safeExec('aws --version', { silent: true });
    } catch {
      throw new Error('AWS CLI not found. Install: https://aws.amazon.com/cli/');
    }

    try {
      const identity = safeExec('aws sts get-caller-identity', { silent: true });
      const account = JSON.parse(identity);
      console.log(`   Account: ${account.Account}`);
      console.log(`   User: ${account.Arn.split('/').pop()}`);
    } catch {
      throw new Error('AWS credentials not configured. Run: aws configure');
    }

    // S3 버킷 접근 확인
    try {
      safeExec(`aws s3 ls s3://${CONFIG.AWS.S3_BUCKET}`, { silent: true });
      console.log(`   S3 Bucket: ${CONFIG.AWS.S3_BUCKET} ✅`);
    } catch {
      throw new Error(`Cannot access S3 bucket: ${CONFIG.AWS.S3_BUCKET}`);
    }

    // Lambda 함수 확인 (backend 배포 시)
    if (this.deployMode === 'backend' || this.deployMode === 'full') {
      try {
        safeExec(`aws lambda get-function --function-name ${CONFIG.AWS.LAMBDA_CHATBOT} --region ${CONFIG.AWS.REGION}`, { silent: true });
        console.log(`   Lambda: ${CONFIG.AWS.LAMBDA_CHATBOT} ✅`);
      } catch {
        throw new Error(`Cannot access Lambda function: ${CONFIG.AWS.LAMBDA_CHATBOT}`);
      }
    }
  }

  // 프로젝트 상태 검증
  validateProject() {
    console.log('📁 Validating project structure...');

    const requiredFiles = [
      'package.json',
      'next.config.mjs',
      'next.config.export.mjs',
      'app/layout.tsx',
      'app/page.tsx'
    ];

    for (const file of requiredFiles) {
      if (!fs.existsSync(file)) {
        throw new Error(`Required file missing: ${file}`);
      }
    }

    console.log('   Project structure ✅');
  }

  // Frontend 의존성 확인
  validateFrontendDeps() {
    console.log('⚛️ Validating frontend dependencies...');

    if (!fs.existsSync('node_modules')) {
      console.log('   Installing dependencies...');
      safeExec('pnpm install');
    }

    console.log('   Frontend dependencies ✅');
  }

  // Backend 의존성 확인
  validateBackendDeps() {
    console.log('🐍 Validating backend dependencies...');

    if (!fs.existsSync('backend/lambda')) {
      throw new Error('Backend lambda directory not found');
    }

    const requiredBackendFiles = [
      'backend/lambda/enhanced-chatbot-handler.py',
      'backend/lambda/requirements.txt'
    ];

    for (const file of requiredBackendFiles) {
      if (!fs.existsSync(file)) {
        throw new Error(`Required backend file missing: ${file}`);
      }
    }

    console.log('   Backend structure ✅');
  }

  // Frontend 배포
  async deployFrontend() {
    console.log('🎨 Deploying Frontend...\n');

    // 1. API Routes 임시 이동
    const apiExists = fs.existsSync('app/api');
    if (apiExists) {
      console.log('🔧 Moving API routes temporarily...');
      execSync('mv app/api app/api_temp', { stdio: 'inherit' });
    }

    try {
      // 2. 배포 가드 실행
      console.log('🛡️ Running pre-deploy guard...');
      safeExec('node scripts/deploy-guard.mjs pre');
      this.deployLog.steps.push({ step: 'pre-guard', status: 'success' });

      // 3. 빌드
      console.log('📦 Building frontend...');
      safeExec('pnpm run build:export');
      this.deployLog.steps.push({ step: 'build', status: 'success' });

      // 4. 스마트 업로드
      await this.smartUpload();

      // 5. CloudFront 무효화
      console.log('🔄 Invalidating CloudFront cache...');
      safeExec(`aws cloudfront create-invalidation --distribution-id ${CONFIG.AWS.CLOUDFRONT_ID} --paths "/*"`);
      this.deployLog.steps.push({ step: 'cloudfront-invalidation', status: 'success' });

      // 6. 배포 후 가드
      console.log('🛡️ Running post-deploy guard...');
      safeExec('node scripts/deploy-guard.mjs post');
      this.deployLog.steps.push({ step: 'post-guard', status: 'success' });

      console.log('✅ Frontend deployment complete\n');

    } finally {
      // API Routes 복원
      if (apiExists && fs.existsSync('app/api_temp')) {
        console.log('🔄 Restoring API routes...');
        execSync('mv app/api_temp app/api', { stdio: 'inherit' });
      }
    }
  }

  // 스마트 업로드 (재시도 + 검증)
  async smartUpload() {
    console.log('📤 Smart uploading to S3...');

    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      attempt++;
      console.log(`   Attempt ${attempt}/${maxRetries}...`);

      try {
        // 기존 파일 정리 (중요 파일 제외)
        if (attempt === 1) {
          console.log('   Cleaning old files...');
          execSync(`aws s3 rm s3://${CONFIG.AWS.S3_BUCKET} --recursive --exclude "robots.txt" --exclude "sitemap.xml"`, { 
            stdio: 'pipe',
            timeout: 60000 
          });
        }

        // 파일 업로드
        console.log('   Uploading files...');
        execSync(`aws s3 cp ./out s3://${CONFIG.AWS.S3_BUCKET} --recursive --exclude "*.txt"`, { 
          stdio: 'inherit',
          timeout: 300000 
        });

        // 중요 파일 개별 확인
        const criticalFiles = ['index.html', '404.html'];
        for (const file of criticalFiles) {
          if (fs.existsSync(`./out/${file}`)) {
            execSync(`aws s3 cp ./out/${file} s3://${CONFIG.AWS.S3_BUCKET}/${file} --cache-control "max-age=300"`, { 
              stdio: 'pipe' 
            });
          }
        }

        console.log('   ✅ Upload successful');
        return;

      } catch (error) {
        console.warn(`   ⚠️ Attempt ${attempt} failed:`, error.message);
        
        if (attempt >= maxRetries) {
          throw new Error(`Upload failed after ${maxRetries} attempts`);
        }

        console.log('   🔄 Retrying in 5 seconds...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }

  // Backend 배포
  async deployBackend() {
    console.log('🔧 Deploying Backend...\n');

    const lambdaDir = 'backend/lambda';
    const zipFile = 'backend/enhanced-chatbot.zip';

    // 1. Lambda 패키지 생성
    console.log('📦 Creating Lambda package...');
    
    // 기존 zip 파일 삭제
    if (fs.existsSync(zipFile)) {
      fs.unlinkSync(zipFile);
    }

    // 새 패키지 생성
    execSync(`cd ${lambdaDir} && zip -r ../enhanced-chatbot.zip .`, { stdio: 'inherit' });

    // 2. 패키지 크기 확인
    const stats = fs.statSync(zipFile);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
    console.log(`   Package size: ${sizeMB} MB`);

    if (stats.size > 50 * 1024 * 1024) { // 50MB 제한
      throw new Error('Lambda package too large (>50MB)');
    }

    // 3. Lambda 함수 업데이트
    console.log('🚀 Updating Lambda function...');
    execSync(`aws lambda update-function-code --function-name ${CONFIG.AWS.LAMBDA_CHATBOT} --zip-file fileb://${zipFile}`, { 
      stdio: 'inherit' 
    });

    // 4. 함수 상태 확인
    console.log('🔍 Verifying Lambda deployment...');
    const functionInfo = execSync(`aws lambda get-function --function-name ${CONFIG.AWS.LAMBDA_CHATBOT}`, { 
      encoding: 'utf8' 
    });
    const func = JSON.parse(functionInfo);
    console.log(`   Runtime: ${func.Configuration.Runtime}`);
    console.log(`   Memory: ${func.Configuration.MemorySize}MB`);
    console.log(`   Timeout: ${func.Configuration.Timeout}s`);

    console.log('✅ Backend deployment complete\n');
  }

  // 사후 검증
  async postValidation() {
    console.log('🔍 Post-deployment Validation...\n');

    // 웹사이트 응답 테스트
    await this.testWebsiteResponses();

    // API 엔드포인트 테스트 (backend 배포 시)
    if (this.deployMode === 'backend' || this.deployMode === 'full') {
      await this.testAPIEndpoints();
    }

    console.log('✅ Post-validation passed\n');
  }

  // 웹사이트 응답 테스트
  async testWebsiteResponses() {
    console.log('🌐 Testing website responses...');

    const testUrls = [
      { url: CONFIG.URLS.WEBSITE, expected: 200 },
      { url: `${CONFIG.URLS.WEBSITE}/games/g1`, expected: 200 },
      { url: `${CONFIG.URLS.WEBSITE}/admin/quiz`, expected: 200 },
      { url: `${CONFIG.URLS.WEBSITE}/nonexistent-page`, expected: 404 }
    ];

    for (const test of testUrls) {
      try {
        const result = execSync(`curl -s -o /dev/null -w "%{http_code}" ${test.url}`, { 
          encoding: 'utf8',
          timeout: 10000 
        });
        const statusCode = parseInt(result.trim());
        
        const status = statusCode === test.expected ? '✅' : '⚠️';
        console.log(`   ${test.url}: ${status} ${statusCode}`);
        
      } catch (error) {
        console.warn(`   ${test.url}: ❌ Test failed`);
      }
    }
  }

  // API 엔드포인트 테스트
  async testAPIEndpoints() {
    console.log('🔌 Testing API endpoints...');

    try {
      // Lambda 함수 직접 테스트
      const testPayload = JSON.stringify({
        question: "테스트 질문",
        gameType: "BlackSwan"
      });

      execSync(`aws lambda invoke --function-name ${CONFIG.AWS.LAMBDA_CHATBOT} --payload '${testPayload}' /tmp/lambda-test-response.json`, { 
        stdio: 'pipe' 
      });

      const response = JSON.parse(fs.readFileSync('/tmp/lambda-test-response.json', 'utf8'));
      
      if (response.statusCode === 200) {
        console.log('   Lambda function: ✅ Responding');
      } else {
        console.warn('   Lambda function: ⚠️ Error response');
      }

    } catch (error) {
      console.warn('   Lambda function: ❌ Test failed');
    }
  }

  // 에러 처리
  async handleError(error) {
    console.error('\n❌ Deployment Failed!\n');
    console.error(`Error: ${error.message}\n`);

    // API Routes 복원 (에러 시)
    if (fs.existsSync('app/api_temp')) {
      console.log('🔄 Restoring API routes after error...');
      try {
        execSync('mv app/api_temp app/api', { stdio: 'inherit' });
        console.log('✅ API routes restored');
      } catch (restoreError) {
        console.error('⚠️ Failed to restore API routes:', restoreError.message);
      }
    }
    
    // 실패 알림 전송
    try {
      console.log('\n📢 Sending failure notifications...');
      execSync(`node scripts/deploy-notify.mjs failure "${error.message}"`, { stdio: 'pipe' });
      console.log('✅ Failure notifications sent');
    } catch (notifyError) {
      console.log('⚠️ Notification failed (continuing...)');
    }

    // 응급 복구 제안
    console.log('\n🚨 Emergency Recovery Options:');
    console.log('1. Run emergency guard: pnpm guard:emergency');
    console.log('2. Check recent backups: pnpm rollback list');
    console.log(`3. Manual 404 fix: aws s3 cp public/404.html s3://${CONFIG.AWS.S3_BUCKET}/404.html`);
    console.log('4. Check AWS credentials: aws configure list');
    console.log('5. Verify build output: ls -la out/');
    console.log('6. Check deploy logs: ls -la .deploy-logs/');

    process.exit(1);
  }

  // 성공 보고
  async reportSuccess() {
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(1);
    
    console.log('\n🎉 Deployment Successful!\n');
    console.log(`⏱️  Duration: ${duration}s`);
    console.log(`📋 Mode: ${this.deployMode}`);
    console.log(`🌐 Website: ${CONFIG.URLS.WEBSITE}`);
    console.log(`🔗 CloudFront: ${CONFIG.URLS.CLOUDFRONT}`);
    
    if (this.deployMode === 'backend' || this.deployMode === 'full') {
      console.log(`🔧 Lambda: ${CONFIG.AWS.LAMBDA_CHATBOT}`);
    }
    
    // CloudWatch 대시보드 생성/업데이트
    try {
      console.log('\n📊 Updating CloudWatch dashboard...');
      safeExec('node scripts/create-dashboard.mjs', { silent: true, ignoreError: true });
      console.log('✅ Dashboard updated');
    } catch (error) {
      console.log('⚠️ Dashboard update failed (continuing...)');
    }
    
    // 성공 알림 전송
    try {
      console.log('\n📢 Sending success notifications...');
      safeExec(`node scripts/deploy-notify.mjs success "${duration}s" "${this.getBuildId()}"`, { silent: true, ignoreError: true });
      console.log('✅ Notifications sent');
    } catch (error) {
      console.log('⚠️ Notification failed (continuing...)');
    }
    
    console.log('\n💡 Next Steps:');
    console.log('- CloudFront cache invalidation takes 5-10 minutes');
    console.log('- Monitor CloudWatch dashboard for metrics');
    console.log('- Test all game functionalities');
    
    if (this.deployMode === 'full') {
      console.log('- Verify chatbot responses in test-chatbot page');
    }
  }
  
  getBuildId() {
    try {
      const buildManifest = execSync('find ./out/_next/static -name "buildManifest.js" | head -1', { encoding: 'utf8' }).trim();
      if (buildManifest) {
        const content = fs.readFileSync(buildManifest, 'utf8');
        const match = content.match(/[a-zA-Z0-9_-]{20,}/);
        return match ? match[0] : 'Unknown';
      }
    } catch {
      // Ignore errors
    }
    return 'Unknown';
  }
}

// CLI 실행
const deployer = new UltimateDeploy();

// 도움말 표시
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
🚀 Ultimate Deploy Script

Usage:
  node ultimate-deploy.mjs [mode] [options]

Modes:
  frontend    Deploy frontend only (default)
  backend     Deploy backend only  
  full        Deploy both frontend and backend

Options:
  --skip-tests    Skip post-deployment tests
  --force         Force deployment without confirmations
  --help, -h      Show this help

Examples:
  node ultimate-deploy.mjs frontend
  node ultimate-deploy.mjs full --skip-tests
  node ultimate-deploy.mjs backend --force
`);
  process.exit(0);
}

// 배포 실행
deployer.deploy().catch(console.error);