/**
 * 배포 유틸리티 함수
 */

import { execSync } from 'child_process';
import fs from 'fs';
import { CONFIG } from './config.mjs';

/**
 * Exponential backoff 재시도 로직
 */
export async function retryWithBackoff(fn, context = '') {
  let lastError;
  let delay = CONFIG.RETRY.INITIAL_DELAY;

  for (let attempt = 1; attempt <= CONFIG.RETRY.MAX_ATTEMPTS; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt >= CONFIG.RETRY.MAX_ATTEMPTS) {
        throw new Error(`${context} failed after ${CONFIG.RETRY.MAX_ATTEMPTS} attempts: ${error.message}`);
      }

      console.warn(`   ⚠️ Attempt ${attempt} failed: ${error.message}`);
      console.log(`   🔄 Retrying in ${delay / 1000}s...`);
      
      await sleep(delay);
      delay = Math.min(delay * CONFIG.RETRY.BACKOFF_MULTIPLIER, CONFIG.RETRY.MAX_DELAY);
    }
  }

  throw lastError;
}

/**
 * Sleep 함수
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 안전한 명령 실행
 */
export function safeExec(command, options = {}) {
  try {
    return execSync(command, {
      encoding: 'utf8',
      stdio: options.silent ? 'pipe' : 'inherit',
      timeout: options.timeout || CONFIG.TIMEOUTS.HTTP_REQUEST,
      ...options
    });
  } catch (error) {
    if (options.ignoreError) {
      return null;
    }
    throw error;
  }
}

/**
 * 파일 존재 확인 및 생성
 */
export function ensureFile(filePath, content) {
  if (!fs.existsSync(filePath)) {
    const dir = filePath.substring(0, filePath.lastIndexOf('/'));
    if (dir && !fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, content);
    return true;
  }
  return false;
}

/**
 * 배포 로그 저장
 */
export function saveDeployLog(logData) {
  const logDir = '.deploy-logs';
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const logFile = `${logDir}/deploy-${timestamp}.json`;
  
  fs.writeFileSync(logFile, JSON.stringify(logData, null, 2));
  console.log(`📝 Deploy log saved: ${logFile}`);
  
  return logFile;
}

/**
 * HTTP 상태 코드 확인
 */
export function checkHttpStatus(url, expectedStatus = 200) {
  try {
    const result = safeExec(
      `curl -s -o /dev/null -w "%{http_code}" "${url}"`,
      { silent: true, timeout: CONFIG.TIMEOUTS.HTTP_REQUEST }
    );
    return parseInt(result.trim()) === expectedStatus;
  } catch {
    return false;
  }
}

/**
 * Lambda 함수 존재 확인
 */
export function checkLambdaExists(functionName) {
  try {
    safeExec(
      `aws lambda get-function --function-name ${functionName} --region ${CONFIG.AWS.REGION}`,
      { silent: true, ignoreError: false }
    );
    return true;
  } catch {
    return false;
  }
}

/**
 * S3 버킷 접근 확인
 */
export function checkS3Access(bucketName) {
  try {
    safeExec(
      `aws s3 ls s3://${bucketName}`,
      { silent: true, ignoreError: false }
    );
    return true;
  } catch {
    return false;
  }
}

export default {
  retryWithBackoff,
  sleep,
  safeExec,
  ensureFile,
  saveDeployLog,
  checkHttpStatus,
  checkLambdaExists,
  checkS3Access
};
