#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import { CONFIG } from './config.mjs';
import { retryWithBackoff, safeExec, saveDeployLog } from './utils.mjs';

console.log('⚡ Quick Deploy Started...\n');

const deployLog = {
  timestamp: new Date().toISOString(),
  mode: 'quick-deploy',
  steps: []
};

function validateDeployment() {
  console.log('🔍 Pre-deployment validation...');
  
  try {
    safeExec('aws --version', { silent: true });
  } catch {
    throw new Error('AWS CLI not found. Please install AWS CLI.');
  }
  
  try {
    safeExec('aws sts get-caller-identity', { silent: true });
  } catch {
    throw new Error('AWS credentials not configured. Run: aws configure');
  }
  
  try {
    safeExec(`aws s3 ls s3://${CONFIG.AWS.S3_BUCKET}`, { silent: true });
  } catch {
    throw new Error(`Cannot access S3 bucket: ${CONFIG.AWS.S3_BUCKET}`);
  }
  
  console.log('✅ Pre-deployment validation passed');
  deployLog.steps.push({ step: 'validation', status: 'success' });
}

async function safeUploadToS3() {
  console.log('\n📤 Uploading to S3...');
  
  if (!fs.existsSync('./out')) {
    throw new Error('Build output directory ./out not found');
  }
  
  for (const file of CONFIG.CRITICAL_FILES) {
    if (!fs.existsSync(`./out/${file}`)) {
      console.warn(`⚠️ Critical file missing: ${file}`);
    }
  }
  
  console.log('🗑️ Step 1: Cleaning old files...');
  try {
    safeExec(
      `aws s3 rm s3://${CONFIG.AWS.S3_BUCKET} --recursive --exclude "robots.txt" --exclude "sitemap.xml"`,
      { silent: true, timeout: CONFIG.TIMEOUTS.S3_CLEAN, ignoreError: true }
    );
  } catch {
    console.log('ℹ️ Clean step skipped (continuing...)');
  }
  
  console.log('⬆️ Step 2: Uploading all files...');
  await retryWithBackoff(
    () => {
      safeExec(
        `aws s3 cp ./out s3://${CONFIG.AWS.S3_BUCKET} --recursive --exclude "*.txt" --exclude "index.txt"`,
        { timeout: CONFIG.TIMEOUTS.S3_UPLOAD }
      );
    },
    'S3 upload'
  );
  
  console.log('📋 Step 3: Verifying critical files...');
  const criticalUploads = [
    { local: './out/index.html', s3: 'index.html' },
    { local: './out/404.html', s3: '404.html' },
    { local: './public/404.html', s3: '404.html', fallback: true }
  ];
  
  for (const upload of criticalUploads) {
    if (fs.existsSync(upload.local)) {
      try {
        safeExec(
          `aws s3 cp ${upload.local} s3://${CONFIG.AWS.S3_BUCKET}/${upload.s3} --cache-control "max-age=300"`,
          { silent: true }
        );
        console.log(`✅ Uploaded: ${upload.s3}`);
        if (upload.fallback) break;
      } catch (err) {
        if (!upload.fallback) {
          console.warn(`⚠️ Failed to upload ${upload.s3}`);
        }
      }
    }
  }
  
  deployLog.steps.push({ step: 's3-upload', status: 'success' });
}

(async () => {
  const startTime = Date.now();
  
  try {
    validateDeployment();
    
    console.log('🛡️ Running deploy guard...');
    safeExec('node scripts/deploy-guard.mjs pre');
    deployLog.steps.push({ step: 'pre-guard', status: 'success' });
    
    const apiExists = fs.existsSync('app/api');
    if (apiExists) {
      console.log('🔧 Temporarily moving API routes...');
      safeExec('mv app/api app/api_temp');
    }
    
    console.log('📦 Building...');
    safeExec('pnpm run build:export');
    deployLog.steps.push({ step: 'build', status: 'success' });
    
    if (apiExists) {
      console.log('🔄 Restoring API routes...');
      safeExec('mv app/api_temp app/api');
    }
    
    await safeUploadToS3();
    
    console.log('\n🔄 Invalidating CloudFront...');
    safeExec(`aws cloudfront create-invalidation --distribution-id ${CONFIG.AWS.CLOUDFRONT_ID} --paths "/*"`);
    deployLog.steps.push({ step: 'cloudfront-invalidation', status: 'success' });
    
    console.log('\n🔍 Post-deployment verification...');
    safeExec('node scripts/deploy-guard.mjs post');
    deployLog.steps.push({ step: 'post-guard', status: 'success' });
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    deployLog.status = 'success';
    deployLog.duration = duration;
    saveDeployLog(deployLog);
    
    console.log('\n🎉 Quick Deploy Complete!');
    console.log(`⏱️  Duration: ${duration}s`);
    console.log(`🌐 Live at: ${CONFIG.URLS.WEBSITE}`);
    console.log(`🔗 CloudFront: ${CONFIG.URLS.CLOUDFRONT}`);
    console.log('\n⏰ CloudFront cache invalidation may take 5-10 minutes to complete.');
    
  } catch (error) {
    if (fs.existsSync('app/api_temp')) {
      console.log('🔄 Restoring API routes after error...');
      try {
        safeExec('mv app/api_temp app/api');
        console.log('✅ API routes restored successfully');
      } catch (restoreError) {
        console.error('⚠️ Failed to restore API routes:', restoreError.message);
      }
    }
    
    deployLog.status = 'failed';
    deployLog.error = error.message;
    saveDeployLog(deployLog);
    
    console.error('❌ Deploy failed:', error.message);
    console.log('\n💡 Troubleshooting tips:');
    console.log('- Check AWS credentials: aws configure list');
    console.log(`- Verify S3 bucket access: aws s3 ls s3://${CONFIG.AWS.S3_BUCKET}`);
    console.log('- Check build output: ls -la out/');
    console.log(`- Manual 404.html upload: aws s3 cp public/404.html s3://${CONFIG.AWS.S3_BUCKET}/404.html`);
    process.exit(1);
  }
})();
