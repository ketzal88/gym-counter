import { NextRequest, NextResponse } from 'next/server';
import { notifyNewUser, notifyError, notifyFeedback } from '@/lib/slack';
import { auth } from '@/lib/firebase-admin';
import { rateLimit, tooManyRequests } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
    // Todos los tipos exigen usuario autenticado: sin esto cualquiera escribe en los canales de Slack.
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    let decoded;
    try {
      decoded = await auth.verifyIdToken(authHeader.split('Bearer ')[1]);
    } catch {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { type, payload } = body ?? {};

    if (!(await rateLimit(`notify_${decoded.uid}`, 20, 10 * 60 * 1000))) {
      return NextResponse.json(tooManyRequests, { status: 429 });
    }

    switch (type) {
      case 'new_user': {
        // Datos del token, no del body. Un solo aviso por usuario por día.
        if (!(await rateLimit(`notify_new_user_${decoded.uid}`, 1, 24 * 60 * 60 * 1000))) break;
        const method = decoded.firebase?.sign_in_provider === 'google.com' ? 'Google' : 'Email';
        await notifyNewUser(decoded.uid, decoded.email || 'unknown', method);
        break;
      }

      case 'error': {
        const { source, message, stack } = payload ?? {};
        await notifyError(String(source || 'unknown'), String(message || 'Unknown error'), stack ? String(stack) : undefined);
        break;
      }

      case 'feedback': {
        await notifyFeedback(decoded.uid, decoded.email || 'unknown', String(payload?.message || ''));
        break;
      }

      default:
        return NextResponse.json({ message: 'Unknown notification type' }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Notify API error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
