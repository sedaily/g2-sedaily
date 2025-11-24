/**
 * 통합 배포 설정 파일
 */

export const CONFIG = {
  // AWS 리소스
  AWS: {
    REGION: 'us-east-1',
    S3_BUCKET: 'g2-frontend-ver2',
    CLOUDFRONT_ID: 'E8HKFQFSQLNHZ',
    LAMBDA_CHATBOT: 'sedaily-chatbot-dev-handler',
    LAMBDA_QUIZ: 'quiz-handler',
    DYNAMODB_TABLE: 'sedaily-quiz-data'
  },

  // URL
  URLS: {
    WEBSITE: 'https://g2.sedaily.ai',
    CLOUDFRONT: 'https://d1nbq51yydvkc9.cloudfront.net',
    API_BASE: 'https://api.g2.sedaily.ai/dev'
  },

  // 타임아웃 (밀리초)
  TIMEOUTS: {
    S3_CLEAN: 60000,      // 1분
    S3_UPLOAD: 300000,    // 5분
    HTTP_REQUEST: 10000,  // 10초
    LAMBDA_TEST: 15000    // 15초
  },

  // 재시도 설정
  RETRY: {
    MAX_ATTEMPTS: 3,
    INITIAL_DELAY: 2000,  // 2초
    MAX_DELAY: 30000,     // 30초
    BACKOFF_MULTIPLIER: 2
  },

  // 중요 파일
  CRITICAL_FILES: [
    'index.html',
    '404.html',
    'admin/quiz/index.html',
    'games/g1/index.html',
    'games/g2/index.html',
    'games/g3/index.html',
    'games/quizlet/index.html'
  ],

  // 테스트 URL
  TEST_URLS: [
    { name: 'Homepage', path: '/', expected: 200 },
    { name: 'Games Hub', path: '/games', expected: 200 },
    { name: 'Admin Panel', path: '/admin/quiz', expected: 200 },
    { name: 'Game G1', path: '/games/g1', expected: 200 },
    { name: 'Game G2', path: '/games/g2', expected: 200 },
    { name: 'Game G3', path: '/games/g3', expected: 200 },
    { name: 'Quizlet', path: '/games/quizlet', expected: 200 },
    { name: '404 Test', path: '/nonexistent-page', expected: 404 }
  ]
};

export default CONFIG;
