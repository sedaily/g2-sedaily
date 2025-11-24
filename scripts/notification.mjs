#!/usr/bin/env node

import https from 'https';

const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK_URL;
const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK_URL;

const EMOJI_MAP = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
  deploy: '🚀'
};

const COLOR_MAP = {
  success: '#00ff00',
  error: '#ff0000',
  warning: '#ffaa00',
  info: '#0099ff',
  deploy: '#9900ff'
};

/**
 * Slack 알림 전송
 */
async function sendSlackNotification({ type, title, message, timestamp }) {
  if (!SLACK_WEBHOOK) return false;

  const payload = {
    text: `${EMOJI_MAP[type] || '📢'} *${title}*`,
    attachments: [{
      color: COLOR_MAP[type] || '#cccccc',
      fields: [
        { title: 'Message', value: message, short: false },
        { title: 'Time', value: new Date(timestamp).toLocaleString('ko-KR'), short: true },
        { title: 'Environment', value: 'Production', short: true }
      ]
    }]
  };

  return new Promise((resolve) => {
    const url = new URL(SLACK_WEBHOOK);
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    };

    const req = https.request(options, (res) => {
      resolve(res.statusCode === 200);
    });

    req.on('error', () => resolve(false));
    req.write(JSON.stringify(payload));
    req.end();
  });
}

/**
 * Discord 알림 전송
 */
async function sendDiscordNotification({ type, title, message, timestamp }) {
  if (!DISCORD_WEBHOOK) return false;

  const payload = {
    embeds: [{
      title: `${EMOJI_MAP[type] || '📢'} ${title}`,
      description: message,
      color: parseInt(COLOR_MAP[type]?.replace('#', '') || 'cccccc', 16),
      timestamp: timestamp,
      footer: { text: 'G2 Deploy System' }
    }]
  };

  return new Promise((resolve) => {
    const url = new URL(DISCORD_WEBHOOK);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    };

    const req = https.request(options, (res) => {
      resolve(res.statusCode === 204);
    });

    req.on('error', () => resolve(false));
    req.write(JSON.stringify(payload));
    req.end();
  });
}

/**
 * 통합 알림 전송
 */
export async function sendNotification(options) {
  const results = await Promise.all([
    sendSlackNotification(options),
    sendDiscordNotification(options)
  ]);

  const [slackSent, discordSent] = results;
  
  if (slackSent) console.log('📤 Slack notification sent');
  if (discordSent) console.log('📤 Discord notification sent');
  
  return slackSent || discordSent;
}

// CLI 테스트
if (import.meta.url === `file://${process.argv[1]}`) {
  await sendNotification({
    type: 'info',
    title: 'Test Notification',
    message: 'This is a test message from G2 notification system',
    timestamp: new Date().toISOString()
  });
}
