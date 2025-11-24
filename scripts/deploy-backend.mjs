#!/usr/bin/env node

/**
 * 개선된 백엔드 배포 스크립트
 */

import { execSync } from 'child_process';
import fs from 'fs';
import { CONFIG } from './config.mjs';
import { retryWithBackoff, safeExec, saveDeployLog, checkLambdaExists } from './utils.mjs';

class BackendDeployer {
  constructor() {
    this.startTime = Date.now();
    this.deployLog = {
      timestamp: new Date().toISOString(),
      region: CONFIG.AWS.REGION,
      deployments: []
    };
  }

  async deploy() {
    console.log('🚀 Enhanced Backend Deployment Starting...\n');

    try {
      this.validateEnvironment();
      await this.deployChatbotLambda();
      await this.deployQuizLambda();
      await this.createCloudWatchDashboard();
      this.reportSuccess();
    } catch (error) {
      this.handleError(error);
    }
  }

  validateEnvironment() {
    console.log('🔍 Validating environment...');

    try {
      safeExec('aws --version', { silent: true });
    } catch {
      throw new Error('AWS CLI not found');
    }

    try {
      safeExec('serverless --version', { silent: true });
    } catch {
      throw new Error('Serverless Framework not found. Install: npm install -g serverless');
    }

    if (!checkLambdaExists(CONFIG.AWS.LAMBDA_CHATBOT)) {
      throw new Error(`Lambda function not found: ${CONFIG.AWS.LAMBDA_CHATBOT}`);
    }

    console.log('✅ Environment validation passed\n');
  }

  async deployChatbotLambda() {
    console.log('🤖 Deploying Chatbot Lambda...');

    await retryWithBackoff(
      () => {
        safeExec(`cd backend && serverless deploy --stage dev --region ${CONFIG.AWS.REGION}`);
      },
      'Chatbot Lambda deployment'
    );

    this.deployLog.deployments.push({
      component: 'chatbot-lambda',
      function: CONFIG.AWS.LAMBDA_CHATBOT,
      status: 'success',
      timestamp: new Date().toISOString()
    });

    console.log('✅ Chatbot Lambda deployed\n');
  }

  async deployQuizLambda() {
    console.log('📊 Deploying Quiz Lambda...');

    const zipFile = 'aws/unified-quiz-lambda/quiz-lambda.zip';
    
    if (fs.existsSync(zipFile)) {
      fs.unlinkSync(zipFile);
    }

    safeExec('cd aws/unified-quiz-lambda && zip -r quiz-lambda.zip . -x "*.zip"');

    await retryWithBackoff(
      () => {
        safeExec(
          `aws lambda update-function-code --function-name ${CONFIG.AWS.LAMBDA_QUIZ} --zip-file fileb://aws/unified-quiz-lambda/quiz-lambda.zip --region ${CONFIG.AWS.REGION}`
        );
      },
      'Quiz Lambda deployment'
    );

    this.deployLog.deployments.push({
      component: 'quiz-lambda',
      function: CONFIG.AWS.LAMBDA_QUIZ,
      status: 'success',
      timestamp: new Date().toISOString()
    });

    console.log('✅ Quiz Lambda deployed\n');
  }

  async createCloudWatchDashboard() {
    console.log('📊 Creating CloudWatch Dashboard...');

    const dashboardBody = {
      widgets: [
        {
          type: "metric",
          properties: {
            metrics: [
              ["G2/Chatbot", "BigKindsAPISuccess"],
              ["G2/Chatbot", "BigKindsAPIError"],
              ["G2/Quiz", "QuizAPI_GET"],
              ["G2/Quiz", "QuizAPI_POST"]
            ],
            period: 300,
            stat: "Sum",
            region: CONFIG.AWS.REGION,
            title: "G2 Platform Metrics"
          }
        }
      ]
    };

    try {
      safeExec(
        `aws cloudwatch put-dashboard --dashboard-name "G2-Platform" --dashboard-body '${JSON.stringify(dashboardBody)}' --region ${CONFIG.AWS.REGION}`,
        { silent: true }
      );
      console.log('✅ CloudWatch Dashboard created\n');
    } catch (error) {
      console.warn('⚠️ CloudWatch Dashboard creation failed:', error.message);
      console.warn('   Continuing deployment...\n');
    }
  }

  handleError(error) {
    console.error('\n❌ Backend Deployment Failed!\n');
    console.error(`Error: ${error.message}\n`);

    this.deployLog.status = 'failed';
    this.deployLog.error = error.message;
    saveDeployLog(this.deployLog);

    console.log('💡 Troubleshooting:');
    console.log('1. Check AWS credentials: aws configure list');
    console.log('2. Verify Serverless config: serverless info');
    console.log('3. Check function permissions');
    console.log(`4. Verify region: ${CONFIG.AWS.REGION}`);

    process.exit(1);
  }

  reportSuccess() {
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(1);
    
    this.deployLog.status = 'success';
    this.deployLog.duration = duration;
    saveDeployLog(this.deployLog);

    console.log('🎉 Backend Deployment Successful!\n');
    console.log(`⏱️  Duration: ${duration}s`);
    console.log(`🤖 Chatbot Function: ${CONFIG.AWS.LAMBDA_CHATBOT}`);
    console.log(`📊 Quiz Function: ${CONFIG.AWS.LAMBDA_QUIZ}`);
    console.log(`🌐 Region: ${CONFIG.AWS.REGION}`);
    console.log('\n💡 Next Steps:');
    console.log('- Update frontend API endpoints');
    console.log('- Test API functionality');
    console.log('- Monitor CloudWatch metrics');
  }
}

const deployer = new BackendDeployer();
deployer.deploy().catch(console.error);
