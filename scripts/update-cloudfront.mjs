#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';

const DISTRIBUTION_ID = 'E8HKFQFSQLNHZ';
const QUIZ_API = '8p2pmss2i7.execute-api.us-east-1.amazonaws.com';
const CHATBOT_API = 'vylrpmvwg7.execute-api.ap-northeast-2.amazonaws.com';

console.log('🔧 CloudFront 설정 업데이트 중...\n');

// 1. 현재 설정 가져오기
console.log('1️⃣ 현재 설정 가져오기...');
const configJson = execSync(`aws cloudfront get-distribution-config --id ${DISTRIBUTION_ID}`, { encoding: 'utf8' });
const configData = JSON.parse(configJson);
const etag = configData.ETag;
const config = configData.DistributionConfig;

console.log(`   ETag: ${etag}`);
console.log(`   현재 Origins: ${config.Origins.Quantity}개\n`);

// 2. API Gateway Origins 추가
console.log('2️⃣ API Gateway Origins 추가...');

const newOrigins = [
  ...config.Origins.Items,
  {
    Id: 'quiz-api-gateway',
    DomainName: QUIZ_API,
    OriginPath: '/prod',
    CustomHeaders: { Quantity: 0 },
    CustomOriginConfig: {
      HTTPPort: 80,
      HTTPSPort: 443,
      OriginProtocolPolicy: 'https-only',
      OriginSslProtocols: {
        Quantity: 1,
        Items: ['TLSv1.2']
      },
      OriginReadTimeout: 30,
      OriginKeepaliveTimeout: 5
    },
    ConnectionAttempts: 3,
    ConnectionTimeout: 10,
    OriginShield: { Enabled: false },
    OriginAccessControlId: ''
  },
  {
    Id: 'chatbot-api-gateway',
    DomainName: CHATBOT_API,
    OriginPath: '/dev',
    CustomHeaders: { Quantity: 0 },
    CustomOriginConfig: {
      HTTPPort: 80,
      HTTPSPort: 443,
      OriginProtocolPolicy: 'https-only',
      OriginSslProtocols: {
        Quantity: 1,
        Items: ['TLSv1.2']
      },
      OriginReadTimeout: 30,
      OriginKeepaliveTimeout: 5
    },
    ConnectionAttempts: 3,
    ConnectionTimeout: 10,
    OriginShield: { Enabled: false },
    OriginAccessControlId: ''
  }
];

config.Origins.Items = newOrigins;
config.Origins.Quantity = newOrigins.length;

console.log(`   ✅ Quiz API Origin 추가`);
console.log(`   ✅ Chatbot API Origin 추가\n`);

// 3. Cache Behaviors 추가
console.log('3️⃣ API 경로 라우팅 설정...');

const apiCacheBehaviors = [
  {
    PathPattern: '/api/quiz/*',
    TargetOriginId: 'quiz-api-gateway',
    ViewerProtocolPolicy: 'redirect-to-https',
    AllowedMethods: {
      Quantity: 7,
      Items: ['GET', 'HEAD', 'OPTIONS', 'PUT', 'POST', 'PATCH', 'DELETE'],
      CachedMethods: {
        Quantity: 2,
        Items: ['GET', 'HEAD']
      }
    },
    Compress: true,
    CachePolicyId: '4135ea2d-6df8-44a3-9df3-4b5a84be39ad', // CachingDisabled
    OriginRequestPolicyId: 'b689b0a8-53d0-40ab-baf2-68738e2966ac', // AllViewerExceptHostHeader
    ResponseHeadersPolicyId: '5cc3b908-e619-4b99-88e5-2cf7f45965bd', // CORS-With-Preflight
    SmoothStreaming: false,
    FieldLevelEncryptionId: '',
    TrustedSigners: {
      Enabled: false,
      Quantity: 0
    },
    TrustedKeyGroups: {
      Enabled: false,
      Quantity: 0
    },
    LambdaFunctionAssociations: {
      Quantity: 0
    },
    FunctionAssociations: {
      Quantity: 0
    }
  },
  {
    PathPattern: '/api/admin/*',
    TargetOriginId: 'quiz-api-gateway',
    ViewerProtocolPolicy: 'redirect-to-https',
    AllowedMethods: {
      Quantity: 7,
      Items: ['GET', 'HEAD', 'OPTIONS', 'PUT', 'POST', 'PATCH', 'DELETE'],
      CachedMethods: {
        Quantity: 2,
        Items: ['GET', 'HEAD']
      }
    },
    Compress: true,
    CachePolicyId: '4135ea2d-6df8-44a3-9df3-4b5a84be39ad',
    OriginRequestPolicyId: 'b689b0a8-53d0-40ab-baf2-68738e2966ac',
    ResponseHeadersPolicyId: '5cc3b908-e619-4b99-88e5-2cf7f45965bd',
    SmoothStreaming: false,
    FieldLevelEncryptionId: '',
    TrustedSigners: {
      Enabled: false,
      Quantity: 0
    },
    TrustedKeyGroups: {
      Enabled: false,
      Quantity: 0
    },
    LambdaFunctionAssociations: {
      Quantity: 0
    },
    FunctionAssociations: {
      Quantity: 0
    }
  },
  {
    PathPattern: '/api/chat/*',
    TargetOriginId: 'chatbot-api-gateway',
    ViewerProtocolPolicy: 'redirect-to-https',
    AllowedMethods: {
      Quantity: 7,
      Items: ['GET', 'HEAD', 'OPTIONS', 'PUT', 'POST', 'PATCH', 'DELETE'],
      CachedMethods: {
        Quantity: 2,
        Items: ['GET', 'HEAD']
      }
    },
    Compress: true,
    CachePolicyId: '4135ea2d-6df8-44a3-9df3-4b5a84be39ad',
    OriginRequestPolicyId: 'b689b0a8-53d0-40ab-baf2-68738e2966ac',
    ResponseHeadersPolicyId: '5cc3b908-e619-4b99-88e5-2cf7f45965bd',
    SmoothStreaming: false,
    FieldLevelEncryptionId: '',
    TrustedSigners: {
      Enabled: false,
      Quantity: 0
    },
    TrustedKeyGroups: {
      Enabled: false,
      Quantity: 0
    },
    LambdaFunctionAssociations: {
      Quantity: 0
    },
    FunctionAssociations: {
      Quantity: 0
    }
  }
];

const existingBehaviors = config.CacheBehaviors?.Items || [];
config.CacheBehaviors = {
  Quantity: apiCacheBehaviors.length + existingBehaviors.length,
  Items: [...apiCacheBehaviors, ...existingBehaviors]
};

console.log(`   ✅ /api/quiz/* → Quiz API`);
console.log(`   ✅ /api/admin/* → Quiz API`);
console.log(`   ✅ /api/chat/* → Chatbot API\n`);

// 4. 설정 저장
console.log('4️⃣ 설정 저장 중...');
writeFileSync('/tmp/cf-config-updated.json', JSON.stringify(config, null, 2));

// 5. CloudFront 업데이트
console.log('5️⃣ CloudFront 업데이트 중...');
try {
  execSync(
    `aws cloudfront update-distribution --id ${DISTRIBUTION_ID} --distribution-config file:///tmp/cf-config-updated.json --if-match ${etag}`,
    { stdio: 'inherit' }
  );
  console.log('\n✅ CloudFront 업데이트 완료!\n');
  console.log('⏱️  배포 시간: 5-10분');
  console.log('🌐 테스트: https://g2.sedaily.ai/api/quiz/latest\n');
} catch (error) {
  console.error('\n❌ 업데이트 실패:', error.message);
  process.exit(1);
}
