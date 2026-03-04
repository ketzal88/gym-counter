const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
const BUSINESS_CHANNEL = process.env.SLACK_BUSINESS_CHANNEL_ID;
const ERROR_CHANNEL = process.env.SLACK_ERROR_CHANNEL_ID;

interface SlackBlock {
  type: string;
  text?: { type: string; text: string; emoji?: boolean };
  fields?: { type: string; text: string }[];
  elements?: { type: string; text: string }[];
}

async function sendSlackMessage(channel: string, text: string, blocks?: SlackBlock[]) {
  if (!SLACK_BOT_TOKEN || !channel) return;

  try {
    await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SLACK_BOT_TOKEN}`,
      },
      body: JSON.stringify({ channel, text, blocks }),
    });
  } catch (error) {
    console.error('Failed to send Slack message:', error);
  }
}

export async function notifyNewUser(email: string, name: string, method: string) {
  if (!BUSINESS_CHANNEL) return;

  await sendSlackMessage(BUSINESS_CHANNEL, `New user: ${email}`, [
    {
      type: 'header',
      text: { type: 'plain_text', text: '🆕 Nuevo usuario registrado', emoji: true },
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Email:*\n${email}` },
        { type: 'mrkdwn', text: `*Nombre:*\n${name || 'Sin nombre'}` },
        { type: 'mrkdwn', text: `*Método:*\n${method}` },
        { type: 'mrkdwn', text: `*Fecha:*\n${new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}` },
      ],
    },
  ]);
}

export async function notifySubscription(
  event: 'started' | 'cancelled' | 'payment_failed' | 'trial_ending' | 'updated',
  userId: string,
  email: string,
  tier?: string,
) {
  if (!BUSINESS_CHANNEL) return;

  const config: Record<string, { emoji: string; title: string }> = {
    started: { emoji: '💳', title: 'Nueva suscripción' },
    cancelled: { emoji: '❌', title: 'Suscripción cancelada' },
    payment_failed: { emoji: '⚠️', title: 'Pago fallido' },
    trial_ending: { emoji: '⏳', title: 'Trial por vencer' },
    updated: { emoji: '🔄', title: 'Suscripción actualizada' },
  };

  const { emoji, title } = config[event];

  const fields = [
    { type: 'mrkdwn', text: `*Usuario:*\n${email}` },
    { type: 'mrkdwn', text: `*User ID:*\n${userId}` },
  ];

  if (tier) {
    fields.push({ type: 'mrkdwn', text: `*Plan:*\n${tier}` });
  }

  fields.push({
    type: 'mrkdwn',
    text: `*Fecha:*\n${new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}`,
  });

  await sendSlackMessage(BUSINESS_CHANNEL, `${emoji} ${title}: ${email}`, [
    {
      type: 'header',
      text: { type: 'plain_text', text: `${emoji} ${title}`, emoji: true },
    },
    { type: 'section', fields },
  ]);
}

export async function notifyError(source: string, message: string, stack?: string) {
  if (!ERROR_CHANNEL) return;

  const blocks: SlackBlock[] = [
    {
      type: 'header',
      text: { type: 'plain_text', text: '🔴 Error en la app', emoji: true },
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Fuente:*\n${source}` },
        { type: 'mrkdwn', text: `*Fecha:*\n${new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}` },
      ],
    },
    {
      type: 'section',
      text: { type: 'mrkdwn', text: `*Error:*\n\`\`\`${message}\`\`\`` },
    },
  ];

  if (stack) {
    blocks.push({
      type: 'section',
      text: { type: 'mrkdwn', text: `*Stack:*\n\`\`\`${stack.slice(0, 2500)}\`\`\`` },
    });
  }

  await sendSlackMessage(ERROR_CHANNEL, `Error in ${source}: ${message}`, blocks);
}

export async function notifyFeedback(email: string, message: string) {
  if (!BUSINESS_CHANNEL) return;

  await sendSlackMessage(BUSINESS_CHANNEL, `Feedback from ${email}`, [
    {
      type: 'header',
      text: { type: 'plain_text', text: '💬 Feedback de usuario', emoji: true },
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*De:*\n${email}` },
        { type: 'mrkdwn', text: `*Fecha:*\n${new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}` },
      ],
    },
    {
      type: 'section',
      text: { type: 'mrkdwn', text: `*Mensaje:*\n> ${message}` },
    },
  ]);
}
