#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import { CONFIG } from './config.mjs';

console.log('📊 Performance Monitoring Dashboard\n');

/**
 * CloudWatch 메트릭 조회
 */
function getCloudWatchMetrics(metricName, namespace, period = 300) {
  try {
    const endTime = new Date();
    const startTime = new Date(endTime - 3600000); // 1시간 전

    const result = execSync(
      `aws cloudwatch get-metric-statistics \
        --namespace "${namespace}" \
        --metric-name "${metricName}" \
        --start-time ${startTime.toISOString()} \
        --end-time ${endTime.toISOString()} \
        --period ${period} \
        --statistics Average,Sum,Maximum \
        --region ${CONFIG.AWS.REGION}`,
      { encoding: 'utf-8' }
    );

    const data = JSON.parse(result);
    return data.Datapoints || [];
  } catch {
    return [];
  }
}

/**
 * Lambda 함수 메트릭
 */
function getLambdaMetrics(functionName) {
  const invocations = getCloudWatchMetrics('Invocations', 'AWS/Lambda');
  const errors = getCloudWatchMetrics('Errors', 'AWS/Lambda');
  const duration = getCloudWatchMetrics('Duration', 'AWS/Lambda');

  return {
    invocations: invocations.reduce((sum, d) => sum + (d.Sum || 0), 0),
    errors: errors.reduce((sum, d) => sum + (d.Sum || 0), 0),
    avgDuration: duration.length > 0 
      ? (duration.reduce((sum, d) => sum + (d.Average || 0), 0) / duration.length).toFixed(2)
      : 0
  };
}

/**
 * CloudFront 메트릭
 */
function getCloudFrontMetrics() {
  const requests = getCloudWatchMetrics('Requests', 'AWS/CloudFront');
  const bytesDownloaded = getCloudWatchMetrics('BytesDownloaded', 'AWS/CloudFront');
  const errorRate = getCloudWatchMetrics('4xxErrorRate', 'AWS/CloudFront');

  return {
    requests: requests.reduce((sum, d) => sum + (d.Sum || 0), 0),
    bandwidth: (bytesDownloaded.reduce((sum, d) => sum + (d.Sum || 0), 0) / 1024 / 1024).toFixed(2),
    errorRate: errorRate.length > 0
      ? (errorRate.reduce((sum, d) => sum + (d.Average || 0), 0) / errorRate.length).toFixed(2)
      : 0
  };
}

/**
 * DynamoDB 메트릭
 */
function getDynamoDBMetrics() {
  try {
    const result = execSync(
      `aws dynamodb describe-table --table-name ${CONFIG.AWS.DYNAMODB_TABLE} --region ${CONFIG.AWS.REGION}`,
      { encoding: 'utf-8' }
    );
    
    const data = JSON.parse(result);
    return {
      itemCount: data.Table?.ItemCount || 0,
      tableSizeBytes: ((data.Table?.TableSizeBytes || 0) / 1024).toFixed(2),
      status: data.Table?.TableStatus || 'UNKNOWN'
    };
  } catch {
    return { itemCount: 0, tableSizeBytes: 0, status: 'ERROR' };
  }
}

/**
 * 배포 로그 분석
 */
function getDeploymentStats() {
  const logDir = '.deploy-logs';
  if (!fs.existsSync(logDir)) return { total: 0, success: 0, failed: 0 };

  const logs = fs.readdirSync(logDir)
    .filter(f => f.endsWith('.json'))
    .map(f => {
      try {
        return JSON.parse(fs.readFileSync(`${logDir}/${f}`, 'utf-8'));
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  return {
    total: logs.length,
    success: logs.filter(l => l.status === 'success').length,
    failed: logs.filter(l => l.status === 'failed').length,
    lastDeploy: logs.length > 0 ? logs[logs.length - 1].timestamp : 'N/A'
  };
}

/**
 * 대시보드 출력
 */
function displayDashboard() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🚀 G2 Platform Monitoring Dashboard');
  console.log('═══════════════════════════════════════════════════════\n');

  // Lambda 챗봇
  console.log('🤖 Lambda Chatbot (sedaily-chatbot-dev-handler)');
  const chatbotMetrics = getLambdaMetrics(CONFIG.AWS.LAMBDA_CHATBOT);
  console.log(`   Invocations: ${chatbotMetrics.invocations}`);
  console.log(`   Errors: ${chatbotMetrics.errors}`);
  console.log(`   Avg Duration: ${chatbotMetrics.avgDuration}ms`);
  console.log(`   Error Rate: ${chatbotMetrics.invocations > 0 ? ((chatbotMetrics.errors / chatbotMetrics.invocations) * 100).toFixed(2) : 0}%\n`);

  // CloudFront
  console.log('🌐 CloudFront Distribution');
  const cfMetrics = getCloudFrontMetrics();
  console.log(`   Requests: ${cfMetrics.requests}`);
  console.log(`   Bandwidth: ${cfMetrics.bandwidth} MB`);
  console.log(`   4xx Error Rate: ${cfMetrics.errorRate}%\n`);

  // DynamoDB
  console.log('💾 DynamoDB (sedaily-quiz-data)');
  const dbMetrics = getDynamoDBMetrics();
  console.log(`   Items: ${dbMetrics.itemCount}`);
  console.log(`   Size: ${dbMetrics.tableSizeBytes} KB`);
  console.log(`   Status: ${dbMetrics.status}\n`);

  // 배포 통계
  console.log('📦 Deployment Statistics');
  const deployStats = getDeploymentStats();
  console.log(`   Total Deploys: ${deployStats.total}`);
  console.log(`   Success: ${deployStats.success} (${deployStats.total > 0 ? ((deployStats.success / deployStats.total) * 100).toFixed(1) : 0}%)`);
  console.log(`   Failed: ${deployStats.failed}`);
  console.log(`   Last Deploy: ${deployStats.lastDeploy}\n`);

  // 시스템 상태
  console.log('🔍 System Health');
  const isHealthy = 
    chatbotMetrics.invocations > 0 &&
    (chatbotMetrics.errors / chatbotMetrics.invocations) < 0.05 &&
    cfMetrics.errorRate < 5 &&
    dbMetrics.status === 'ACTIVE';
  
  console.log(`   Status: ${isHealthy ? '✅ HEALTHY' : '⚠️ NEEDS ATTENTION'}`);
  console.log(`   Website: ${CONFIG.URLS.WEBSITE}`);
  console.log(`   Region: ${CONFIG.AWS.REGION}\n`);

  console.log('═══════════════════════════════════════════════════════');
  console.log(`📅 Generated: ${new Date().toLocaleString('ko-KR')}`);
  console.log('═══════════════════════════════════════════════════════\n');
}

/**
 * HTML 대시보드 생성
 */
function generateHTMLDashboard() {
  const chatbotMetrics = getLambdaMetrics(CONFIG.AWS.LAMBDA_CHATBOT);
  const cfMetrics = getCloudFrontMetrics();
  const dbMetrics = getDynamoDBMetrics();
  const deployStats = getDeploymentStats();

  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>G2 Monitoring Dashboard</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f172a; color: #e2e8f0; padding: 2rem; }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 { font-size: 2rem; margin-bottom: 2rem; color: #60a5fa; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }
    .card { background: #1e293b; border-radius: 12px; padding: 1.5rem; border: 1px solid #334155; }
    .card h2 { font-size: 1.25rem; margin-bottom: 1rem; color: #94a3b8; }
    .metric { display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid #334155; }
    .metric:last-child { border-bottom: none; }
    .metric-label { color: #94a3b8; }
    .metric-value { font-weight: 600; color: #e2e8f0; }
    .status-healthy { color: #10b981; }
    .status-warning { color: #f59e0b; }
    .footer { margin-top: 2rem; text-align: center; color: #64748b; font-size: 0.875rem; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚀 G2 Platform Monitoring Dashboard</h1>
    
    <div class="grid">
      <div class="card">
        <h2>🤖 Lambda Chatbot</h2>
        <div class="metric"><span class="metric-label">Invocations</span><span class="metric-value">${chatbotMetrics.invocations}</span></div>
        <div class="metric"><span class="metric-label">Errors</span><span class="metric-value">${chatbotMetrics.errors}</span></div>
        <div class="metric"><span class="metric-label">Avg Duration</span><span class="metric-value">${chatbotMetrics.avgDuration}ms</span></div>
      </div>

      <div class="card">
        <h2>🌐 CloudFront</h2>
        <div class="metric"><span class="metric-label">Requests</span><span class="metric-value">${cfMetrics.requests}</span></div>
        <div class="metric"><span class="metric-label">Bandwidth</span><span class="metric-value">${cfMetrics.bandwidth} MB</span></div>
        <div class="metric"><span class="metric-label">Error Rate</span><span class="metric-value">${cfMetrics.errorRate}%</span></div>
      </div>

      <div class="card">
        <h2>💾 DynamoDB</h2>
        <div class="metric"><span class="metric-label">Items</span><span class="metric-value">${dbMetrics.itemCount}</span></div>
        <div class="metric"><span class="metric-label">Size</span><span class="metric-value">${dbMetrics.tableSizeBytes} KB</span></div>
        <div class="metric"><span class="metric-label">Status</span><span class="metric-value status-healthy">${dbMetrics.status}</span></div>
      </div>

      <div class="card">
        <h2>📦 Deployments</h2>
        <div class="metric"><span class="metric-label">Total</span><span class="metric-value">${deployStats.total}</span></div>
        <div class="metric"><span class="metric-label">Success</span><span class="metric-value status-healthy">${deployStats.success}</span></div>
        <div class="metric"><span class="metric-label">Failed</span><span class="metric-value">${deployStats.failed}</span></div>
      </div>
    </div>

    <div class="footer">
      <p>Generated: ${new Date().toLocaleString('ko-KR')} | Region: ${CONFIG.AWS.REGION}</p>
      <p>Website: <a href="${CONFIG.URLS.WEBSITE}" style="color: #60a5fa;">${CONFIG.URLS.WEBSITE}</a></p>
    </div>
  </div>
</body>
</html>`;

  fs.writeFileSync('monitoring-dashboard.html', html);
  console.log('✅ HTML dashboard generated: monitoring-dashboard.html');
}

// CLI 실행
const args = process.argv.slice(2);

if (args[0] === 'html') {
  generateHTMLDashboard();
} else if (args[0] === 'watch') {
  console.log('🔄 Watch mode (refreshing every 30 seconds)\n');
  displayDashboard();
  setInterval(() => {
    console.clear();
    displayDashboard();
  }, 30000);
} else {
  displayDashboard();
}
