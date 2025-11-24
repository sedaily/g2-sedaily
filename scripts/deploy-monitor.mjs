#!/usr/bin/env node

/**
 * 배포 모니터링 시스템 - 완전한 모니터링 및 메트릭 수집
 */

import { execSync } from 'child_process';
import fs from 'fs';
import https from 'https';

const CONFIG = {
  WEBSITE_URL: 'https://g2.sedaily.ai',
  CLOUDFRONT_URL: 'https://d1nbq51yydvkc9.cloudfront.net',
  LAMBDA_FUNCTION: 'sedaily-chatbot-dev-handler',
  QUIZ_FUNCTION: 'sedaily-quiz-dev-handler',
  S3_BUCKET: 'g2-frontend-ver2',
  CLOUDFRONT_ID: 'E8HKFQFSQLNHZ'
};

class DeployMonitor {
  constructor() {
    this.metrics = {
      website: { status: 'unknown', responseTime: 0 },
      lambda: { chatbot: 'unknown', quiz: 'unknown' },
      cloudfront: { status: 'unknown', cacheHitRate: 0 },
      s3: { fileCount: 0, totalSize: 0 }
    };
  }

  async monitor() {
    console.log('📊 G2 Platform Monitoring Dashboard\n');
    console.log(`⏰ ${new Date().toLocaleString()}\n`);
    
    try {
      // 병렬로 모든 상태 확인
      await Promise.all([
        this.checkWebsiteHealth(),
        this.checkLambdaFunctions(),
        this.checkCloudFrontMetrics(),
        this.checkS3Status(),
        this.checkAPIEndpoints()
      ]);
      
      // 종합 리포트 생성
      this.generateReport();
      
      // CloudWatch 메트릭 전송
      await this.sendMetricsToCloudWatch();
      
    } catch (error) {
      console.error('❌ Monitoring failed:', error.message);
    }
  }

  async checkWebsiteHealth() {
    console.log('🌐 Website Health Check...');
    
    const testUrls = [
      { name: 'Homepage', url: CONFIG.WEBSITE_URL },
      { name: 'Games Hub', url: `${CONFIG.WEBSITE_URL}/games` },
      { name: 'Admin Panel', url: `${CONFIG.WEBSITE_URL}/admin/quiz` },
      { name: 'Game G1', url: `${CONFIG.WEBSITE_URL}/games/g1` },
      { name: '404 Test', url: `${CONFIG.WEBSITE_URL}/nonexistent`, expected: 404 }
    ];

    for (const test of testUrls) {
      try {
        const startTime = Date.now();
        const result = execSync(`curl -s -o /dev/null -w "%{http_code}" ${test.url}`, { 
          encoding: 'utf8',
          timeout: 10000
        });
        const responseTime = Date.now() - startTime;
        const statusCode = parseInt(result.trim());
        const expected = test.expected || 200;
        
        const status = statusCode === expected ? '✅' : '❌';
        console.log(`   ${test.name}: ${status} ${statusCode} (${responseTime}ms)`);
        
        if (test.name === 'Homepage') {
          this.metrics.website.status = statusCode === 200 ? 'healthy' : 'unhealthy';
          this.metrics.website.responseTime = responseTime;
        }
        
      } catch (error) {
        console.log(`   ${test.name}: ❌ Timeout or Error`);
      }
    }
  }

  async checkLambdaFunctions() {
    console.log('\n🔧 Lambda Functions Status...');
    
    const functions = [
      { name: 'Chatbot', functionName: CONFIG.LAMBDA_FUNCTION },
      { name: 'Quiz API', functionName: CONFIG.QUIZ_FUNCTION }
    ];

    for (const func of functions) {
      try {
        const result = execSync(`aws lambda get-function --function-name ${func.functionName}`, { 
          encoding: 'utf8' 
        });
        
        const lambdaInfo = JSON.parse(result);
        const config = lambdaInfo.Configuration;
        
        console.log(`   ${func.name}: ✅ Active`);
        console.log(`     Runtime: ${config.Runtime}`);
        console.log(`     Memory: ${config.MemorySize}MB`);
        console.log(`     Timeout: ${config.Timeout}s`);
        console.log(`     Last Modified: ${new Date(config.LastModified).toLocaleString()}`);
        
        // 함수 호출 테스트
        await this.testLambdaFunction(func.functionName, func.name);
        
        if (func.name === 'Chatbot') {
          this.metrics.lambda.chatbot = 'healthy';
        } else {
          this.metrics.lambda.quiz = 'healthy';
        }
        
      } catch (error) {
        console.log(`   ${func.name}: ❌ Error - ${error.message}`);
        if (func.name === 'Chatbot') {
          this.metrics.lambda.chatbot = 'unhealthy';
        } else {
          this.metrics.lambda.quiz = 'unhealthy';
        }
      }
    }
  }

  async testLambdaFunction(functionName, displayName) {
    try {
      const testPayload = functionName.includes('chatbot') 
        ? JSON.stringify({ question: "테스트", gameType: "BlackSwan" })
        : JSON.stringify({ httpMethod: "GET", path: "/health" });
      
      execSync(`aws lambda invoke --function-name ${functionName} --payload '${testPayload}' /tmp/lambda-test.json`, { 
        stdio: 'pipe',
        timeout: 10000
      });
      
      const response = JSON.parse(fs.readFileSync('/tmp/lambda-test.json', 'utf8'));
      
      if (response.statusCode === 200 || response.success) {
        console.log(`     Test: ✅ Responding`);
      } else {
        console.log(`     Test: ⚠️ Error Response`);
      }
      
    } catch (error) {
      console.log(`     Test: ❌ Failed`);
    }
  }

  async checkCloudFrontMetrics() {
    console.log('\n🔄 CloudFront Distribution...');
    
    try {
      const result = execSync(`aws cloudfront get-distribution --id ${CONFIG.CLOUDFRONT_ID}`, { 
        encoding: 'utf8' 
      });
      
      const distribution = JSON.parse(result);
      const dist = distribution.Distribution;
      
      console.log(`   Status: ✅ ${dist.Status}`);
      console.log(`   Domain: ${dist.DomainName}`);
      console.log(`   Price Class: ${dist.DistributionConfig.PriceClass}`);
      console.log(`   Enabled: ${dist.DistributionConfig.Enabled ? '✅' : '❌'}`);
      
      this.metrics.cloudfront.status = dist.Status.toLowerCase();
      
      // CloudWatch 메트릭 조회 (최근 1시간)
      await this.getCloudFrontMetrics();
      
    } catch (error) {
      console.log(`   Status: ❌ Error - ${error.message}`);
      this.metrics.cloudfront.status = 'error';
    }
  }

  async getCloudFrontMetrics() {
    try {
      const endTime = new Date();
      const startTime = new Date(endTime.getTime() - 60 * 60 * 1000); // 1시간 전
      
      const metricsCmd = `aws cloudwatch get-metric-statistics \
        --namespace AWS/CloudFront \
        --metric-name Requests \
        --dimensions Name=DistributionId,Value=${CONFIG.CLOUDFRONT_ID} \
        --start-time ${startTime.toISOString()} \
        --end-time ${endTime.toISOString()} \
        --period 3600 \
        --statistics Sum`;
      
      const result = execSync(metricsCmd, { encoding: 'utf8' });
      const metrics = JSON.parse(result);
      
      if (metrics.Datapoints && metrics.Datapoints.length > 0) {
        const requests = metrics.Datapoints[0].Sum;
        console.log(`   Requests (1h): ${requests}`);
      }
      
    } catch (error) {
      console.log(`   Metrics: ⚠️ Unable to fetch`);
    }
  }

  async checkS3Status() {
    console.log('\n📦 S3 Bucket Status...');
    
    try {
      const result = execSync(`aws s3 ls s3://${CONFIG.S3_BUCKET} --recursive --summarize`, { 
        encoding: 'utf8' 
      });
      
      const lines = result.split('\n');
      const summaryLine = lines.find(line => line.includes('Total Objects:'));
      const sizeLine = lines.find(line => line.includes('Total Size:'));
      
      if (summaryLine && sizeLine) {
        const fileCount = summaryLine.match(/Total Objects: (\d+)/)?.[1] || '0';
        const totalSize = sizeLine.match(/Total Size: (\d+)/)?.[1] || '0';
        const sizeMB = (parseInt(totalSize) / 1024 / 1024).toFixed(2);
        
        console.log(`   Bucket: ✅ ${CONFIG.S3_BUCKET}`);
        console.log(`   Files: ${fileCount}`);
        console.log(`   Size: ${sizeMB} MB`);
        
        this.metrics.s3.fileCount = parseInt(fileCount);
        this.metrics.s3.totalSize = parseInt(totalSize);
      }
      
    } catch (error) {
      console.log(`   Bucket: ❌ Error - ${error.message}`);
    }
  }

  async checkAPIEndpoints() {
    console.log('\n🔌 API Endpoints...');
    
    const endpoints = [
      { name: 'Chatbot API', url: 'https://api.g2.sedaily.ai/dev/chat', method: 'OPTIONS' },
      { name: 'Quiz API', url: 'https://api.g2.sedaily.ai/dev/quizzes/all', method: 'GET' }
    ];

    for (const endpoint of endpoints) {
      try {
        const result = execSync(`curl -s -o /dev/null -w "%{http_code}" -X ${endpoint.method} ${endpoint.url}`, { 
          encoding: 'utf8',
          timeout: 10000
        });
        
        const statusCode = parseInt(result.trim());
        const status = (statusCode >= 200 && statusCode < 400) ? '✅' : '❌';
        console.log(`   ${endpoint.name}: ${status} ${statusCode}`);
        
      } catch (error) {
        console.log(`   ${endpoint.name}: ❌ Timeout`);
      }
    }
  }

  generateReport() {
    console.log('\n📊 System Health Report');
    console.log('═'.repeat(50));
    
    const overallHealth = this.calculateOverallHealth();
    console.log(`Overall Status: ${overallHealth.status} ${overallHealth.emoji}`);
    console.log(`Health Score: ${overallHealth.score}/100`);
    
    console.log('\nComponent Status:');
    console.log(`  Website: ${this.metrics.website.status} (${this.metrics.website.responseTime}ms)`);
    console.log(`  Chatbot Lambda: ${this.metrics.lambda.chatbot}`);
    console.log(`  Quiz Lambda: ${this.metrics.lambda.quiz}`);
    console.log(`  CloudFront: ${this.metrics.cloudfront.status}`);
    console.log(`  S3 Files: ${this.metrics.s3.fileCount} files (${(this.metrics.s3.totalSize/1024/1024).toFixed(2)} MB)`);
    
    // 권장사항
    this.generateRecommendations();
  }

  calculateOverallHealth() {
    let score = 0;
    let maxScore = 0;
    
    // Website (30점)
    maxScore += 30;
    if (this.metrics.website.status === 'healthy') {
      score += 30;
    } else if (this.metrics.website.responseTime > 0) {
      score += 15;
    }
    
    // Lambda Functions (40점)
    maxScore += 40;
    if (this.metrics.lambda.chatbot === 'healthy') score += 20;
    if (this.metrics.lambda.quiz === 'healthy') score += 20;
    
    // CloudFront (20점)
    maxScore += 20;
    if (this.metrics.cloudfront.status === 'deployed') score += 20;
    
    // S3 (10점)
    maxScore += 10;
    if (this.metrics.s3.fileCount > 0) score += 10;
    
    const percentage = Math.round((score / maxScore) * 100);
    
    let status, emoji;
    if (percentage >= 90) {
      status = 'Excellent';
      emoji = '🟢';
    } else if (percentage >= 70) {
      status = 'Good';
      emoji = '🟡';
    } else {
      status = 'Needs Attention';
      emoji = '🔴';
    }
    
    return { status, emoji, score: percentage };
  }

  generateRecommendations() {
    console.log('\n💡 Recommendations:');
    
    if (this.metrics.website.responseTime > 3000) {
      console.log('  ⚠️ Website response time is slow (>3s). Check CloudFront cache.');
    }
    
    if (this.metrics.lambda.chatbot !== 'healthy') {
      console.log('  🔧 Chatbot Lambda needs attention. Check CloudWatch logs.');
    }
    
    if (this.metrics.s3.fileCount === 0) {
      console.log('  📦 S3 bucket appears empty. Run deployment.');
    }
    
    if (this.metrics.website.status === 'healthy' && 
        this.metrics.lambda.chatbot === 'healthy' && 
        this.metrics.lambda.quiz === 'healthy') {
      console.log('  ✅ All systems operational!');
    }
  }

  async sendMetricsToCloudWatch() {
    try {
      const metricsData = [
        {
          MetricName: 'WebsiteResponseTime',
          Value: this.metrics.website.responseTime,
          Unit: 'Milliseconds'
        },
        {
          MetricName: 'SystemHealthScore',
          Value: this.calculateOverallHealth().score,
          Unit: 'Percent'
        },
        {
          MetricName: 'S3FileCount',
          Value: this.metrics.s3.fileCount,
          Unit: 'Count'
        }
      ];
      
      const metricsJson = JSON.stringify(metricsData);
      execSync(`aws cloudwatch put-metric-data --namespace "G2/Platform" --metric-data '${metricsJson}'`, {
        stdio: 'pipe'
      });
      
      console.log('\n📈 Metrics sent to CloudWatch');
      
    } catch (error) {
      console.log('\n⚠️ Failed to send metrics to CloudWatch');
    }
  }
}

// CLI 실행
const command = process.argv[2] || 'monitor';
const monitor = new DeployMonitor();

switch (command) {
  case 'monitor':
  case 'check':
    monitor.monitor().catch(console.error);
    break;
  default:
    console.log('Usage: node deploy-monitor.mjs [monitor|check]');
    process.exit(1);
}