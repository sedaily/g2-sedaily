#!/usr/bin/env node

import { execSync } from 'child_process';
import { CONFIG } from './config.mjs';
import { sendNotification } from './notification.mjs';

console.log('🔄 Auto-Redeploy System Started...\n');

/**
 * DynamoDB에서 최신 퀴즈 업데이트 시간 확인
 */
async function checkForNewQuizzes() {
  try {
    const result = execSync(
      `aws dynamodb scan --table-name ${CONFIG.AWS.DYNAMODB_TABLE} --select COUNT --region ${CONFIG.AWS.REGION}`,
      { encoding: 'utf-8' }
    );
    
    const data = JSON.parse(result);
    return data.Count || 0;
  } catch (error) {
    console.error('❌ Failed to check DynamoDB:', error.message);
    return null;
  }
}

/**
 * 자동 재배포 실행
 */
async function triggerRedeploy(reason) {
  console.log(`\n🚀 Triggering redeploy: ${reason}`);
  
  try {
    await sendNotification({
      type: 'info',
      title: '자동 재배포 시작',
      message: `사유: ${reason}`,
      timestamp: new Date().toISOString()
    });

    execSync('pnpm deploy:quick', { stdio: 'inherit' });
    
    await sendNotification({
      type: 'success',
      title: '자동 재배포 완료',
      message: `배포 성공: ${CONFIG.URLS.WEBSITE}`,
      timestamp: new Date().toISOString()
    });
    
    console.log('✅ Auto-redeploy completed successfully');
    return true;
  } catch (error) {
    await sendNotification({
      type: 'error',
      title: '자동 재배포 실패',
      message: error.message,
      timestamp: new Date().toISOString()
    });
    
    console.error('❌ Auto-redeploy failed:', error.message);
    return false;
  }
}

/**
 * 메인 모니터링 루프
 */
async function monitorQuizUpdates() {
  let lastCount = await checkForNewQuizzes();
  console.log(`📊 Initial quiz count: ${lastCount}`);
  
  setInterval(async () => {
    const currentCount = await checkForNewQuizzes();
    
    if (currentCount === null) return;
    
    if (currentCount > lastCount) {
      console.log(`\n🆕 New quiz detected! (${lastCount} → ${currentCount})`);
      await triggerRedeploy(`새 퀴즈 업로드 감지 (${currentCount - lastCount}개)`);
      lastCount = currentCount;
    }
  }, 5 * 60 * 1000); // 5분마다 체크
}

// CLI 모드
const args = process.argv.slice(2);

if (args[0] === 'once') {
  // 1회 실행
  const count = await checkForNewQuizzes();
  console.log(`Current quiz count: ${count}`);
  process.exit(0);
} else if (args[0] === 'force') {
  // 강제 재배포
  await triggerRedeploy('수동 강제 재배포');
  process.exit(0);
} else {
  // 모니터링 모드
  console.log('🔍 Monitoring mode started (checking every 5 minutes)');
  console.log('Press Ctrl+C to stop\n');
  await monitorQuizUpdates();
}
