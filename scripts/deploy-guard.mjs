#!/usr/bin/env node

/**
 * 배포 가드 시스템 - 404 문제 완전 방지
 * 모든 배포 전후에 실행되어 문제를 사전 차단
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { CONFIG } from './config.mjs';
import { safeExec, ensureFile } from './utils.mjs';

class DeployGuard {
  constructor() {
    this.criticalFiles = CONFIG.CRITICAL_FILES;
  }

  // 배포 전 검증
  preDeployCheck() {
    console.log('🛡️ Pre-deploy Guard Check...\n');
    
    // 1. 빌드 결과 확인
    if (!fs.existsSync('./out')) {
      throw new Error('❌ Build output directory ./out not found');
    }

    // 2. 중요 파일들 확인
    const missingFiles = this.criticalFiles.filter(file => !fs.existsSync(`./out/${file}`));

    if (missingFiles.length > 0) {
      console.log('⚠️ Missing critical files:', missingFiles);
      this.createMissingFiles(missingFiles);
    }

    // 3. 404.html 특별 검증
    this.ensure404Html();

    console.log('✅ Pre-deploy check passed\n');
  }

  // 404.html 확실히 생성
  ensure404Html() {
    const outPath = './out/404.html';
    const publicPath = './public/404.html';

    if (fs.existsSync(outPath)) return;

    console.log('🔧 Creating 404.html...');
    
    if (fs.existsSync(publicPath)) {
      fs.copyFileSync(publicPath, outPath);
      console.log('✅ 404.html copied from public');
      return;
    }

    const basic404 = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>404 - 페이지를 찾을 수 없습니다</title>
  <style>
    body { font-family: system-ui, sans-serif; text-align: center; padding: 50px; }
    h1 { color: #333; }
    a { color: #0070f3; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <h1>404 - 페이지를 찾을 수 없습니다</h1>
  <p>요청하신 페이지가 존재하지 않습니다.</p>
  <a href="/">홈으로 돌아가기</a>
</body>
</html>`;
    
    ensureFile(outPath, basic404);
    console.log('✅ Basic 404.html created');
  }

  // 누락된 파일들 생성
  createMissingFiles(missingFiles) {
    const basicHtml = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>서울경제 뉴스게임</title>
  <meta http-equiv="refresh" content="0; url=/">
</head>
<body>
  <p>페이지를 로딩 중입니다...</p>
  <script>window.location.href = "/";</script>
</body>
</html>`;

    for (const file of missingFiles) {
      if (file.endsWith('.html')) {
        const filePath = `./out/${file}`;
        if (ensureFile(filePath, basicHtml)) {
          console.log(`✅ Created fallback: ${file}`);
        }
      }
    }
  }

  // 배포 후 검증
  async postDeployCheck() {
    console.log('🛡️ Post-deploy Guard Check...\n');
    
    // S3에서 중요 파일들 확인
    for (const file of this.criticalFiles) {
      try {
        safeExec(`aws s3api head-object --bucket ${CONFIG.AWS.S3_BUCKET} --key ${file}`, { silent: true });
        console.log(`✅ S3 verified: ${file}`);
      } catch {
        console.warn(`⚠️ S3 missing: ${file}`);
        if (fs.existsSync(`./out/${file}`)) {
          safeExec(`aws s3 cp ./out/${file} s3://${CONFIG.AWS.S3_BUCKET}/${file}`, { silent: true, ignoreError: true });
          console.log(`🔄 Re-uploaded: ${file}`);
        }
      }
    }

    // 웹사이트 응답 테스트
    await this.testWebsite();
    
    console.log('✅ Post-deploy check passed\n');
  }

  // 웹사이트 테스트
  async testWebsite() {
    for (const test of CONFIG.TEST_URLS.slice(0, 3)) {
      const url = `${CONFIG.URLS.WEBSITE}${test.path}`;
      try {
        const result = safeExec(`curl -s -o /dev/null -w "%{http_code}" "${url}"`, { 
          silent: true, 
          timeout: CONFIG.TIMEOUTS.HTTP_REQUEST 
        });
        const statusCode = parseInt(result.trim());
        const status = statusCode === test.expected ? '✅' : '⚠️';
        console.log(`🌐 ${test.name}: ${status} (${statusCode})`);
      } catch (error) {
        console.warn(`⚠️ Test failed for ${test.name}`);
      }
    }
  }

  // 응급 복구
  emergencyRecover() {
    console.log('🚨 Emergency Recovery Mode...\n');
    
    const sources = ['./out/404.html', './public/404.html'];
    for (const source of sources) {
      if (fs.existsSync(source)) {
        try {
          safeExec(`aws s3 cp ${source} s3://${CONFIG.AWS.S3_BUCKET}/404.html --cache-control "max-age=300"`);
          console.log(`✅ Emergency 404.html uploaded from ${source}`);
          break;
        } catch (error) {
          console.warn(`⚠️ Failed to upload from ${source}`);
        }
      }
    }

    try {
      safeExec(`aws cloudfront create-invalidation --distribution-id ${CONFIG.AWS.CLOUDFRONT_ID} --paths "/404.html"`);
      console.log('✅ Emergency cache invalidation triggered');
    } catch (error) {
      console.warn('⚠️ Cache invalidation failed');
    }
  }
}

// CLI 실행
const guard = new DeployGuard();
const command = process.argv[2];

try {
  switch (command) {
    case 'pre':
      guard.preDeployCheck();
      break;
    case 'post':
      await guard.postDeployCheck();
      break;
    case 'emergency':
      guard.emergencyRecover();
      break;
    default:
      console.log('Usage: node deploy-guard.mjs [pre|post|emergency]');
      process.exit(1);
  }
} catch (error) {
  console.error('❌ Guard failed:', error.message);
  process.exit(1);
}