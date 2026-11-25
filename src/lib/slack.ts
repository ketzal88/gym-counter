const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
const BUSINESS_CHANNEL = process.env.SLACK_BUSINESS_CHANNEL_ID;
const ERROR_CHANNEL = process.env.SLACK_ERROR_CHANNEL_ID;

interface SlackBlock {
  type: string;
  text?: { type: string; text: string; emoji?: boolean };
  fields?: { type: string; text: string }[];
  elements?: { type: string; text: string }[];
}

/** Escapa los caracteres de control de mrkdwn (menciones, links) y los cierres de bloque de código. */
export function slackEscape(value: string, max = 1500): string {
  return value
    .slice(0, max)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/```/g, "'''");
}

/** El canal es interno, pero no hace falta el email completo: alcanza para reconocerlo + el uid. */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return '***';
  return `${local.slice(0, 2)}***@${domain}`;
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
      // Si Slack se cuelga no puede demorar la respuesta (ej. el webhook de Stripe).
      signal: AbortSignal.timeout(5000),
    });
  } catch (error) {
    console.error('Failed to send Slack message:', error);
  }
}

const nowAR = () => new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' });

export async function notifyNewUser(userId: string, email: string, method: string) {
  if (!BUSINESS_CHANNEL) return;

  const who = slackEscape(maskEmail(email));
  await sendSlackMessage(BUSINESS_CHANNEL, `New user: ${who}`, [
    {
      type: 'header',
      text: { type: 'plain_text', text: '🆕 Nuevo usuario registrado', emoji: true },
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Email:*\n${who}` },
        { type: 'mrkdwn', text: `*User ID:*\n${slackEscape(userId)}` },
        { type: 'mrkdwn', text: `*Método:*\n${slackEscape(method)}` },
        { type: 'mrkdwn', text: `*Fecha:*\n${nowAR()}` },
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
  const who = slackEscape(maskEmail(email));

  const fields = [
    { type: 'mrkdwn', text: `*Usuario:*\n${who}` },
    { type: 'mrkdwn', text: `*User ID:*\n${slackEscape(userId)}` },
  ];

  if (tier) {
    fields.push({ type: 'mrkdwn', text: `*Plan:*\n${slackEscape(tier)}` });
  }

  fields.push({ type: 'mrkdwn', text: `*Fecha:*\n${nowAR()}` });

  await sendSlackMessage(BUSINESS_CHANNEL, `${emoji} ${title}: ${who}`, [
    {
      type: 'header',
      text: { type: 'plain_text', text: `${emoji} ${title}`, emoji: true },
    },
    { type: 'section', fields },
  ]);
}

export async function notifyError(source: string, message: string, stack?: string) {
  if (!ERROR_CHANNEL) return;

  const src = slackEscape(source, 100);
  const msg = slackEscape(message, 1500);

  const blocks: SlackBlock[] = [
    {
      type: 'header',
      text: { type: 'plain_text', text: '🔴 Error en la app', emoji: true },
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Fuente:*\n${src}` },
        { type: 'mrkdwn', text: `*Fecha:*\n${nowAR()}` },
      ],
    },
    {
      type: 'section',
      text: { type: 'mrkdwn', text: `*Error:*\n\`\`\`${msg}\`\`\`` },
    },
  ];

  if (stack) {
    blocks.push({
      type: 'section',
      text: { type: 'mrkdwn', text: `*Stack:*\n\`\`\`${slackEscape(stack, 2500)}\`\`\`` },
    });
  }

  await sendSlackMessage(ERROR_CHANNEL, `Error in ${src}: ${msg}`, blocks);
}

export async function notifyFeedback(userId: string, email: string, message: string) {
  if (!BUSINESS_CHANNEL) return;

  const who = slackEscape(maskEmail(email));
  await sendSlackMessage(BUSINESS_CHANNEL, `Feedback from ${who}`, [
    {
      type: 'header',
      text: { type: 'plain_text', text: '💬 Feedback de usuario', emoji: true },
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*De:*\n${who} (${slackEscape(userId)})` },
        { type: 'mrkdwn', text: `*Fecha:*\n${nowAR()}` },
      ],
    },
    {
      type: 'section',
      text: { type: 'mrkdwn', text: `*Mensaje:*\n> ${slackEscape(message, 2500).replace(/\n/g, '\n> ')}` },
    },
  ]);
}
