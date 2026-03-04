import { NextRequest, NextResponse } from 'next/server';
import { notifyNewUser, notifyError, notifyFeedback } from '@/lib/slack';
import { auth } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, payload } = body;

    switch (type) {
      case 'new_user': {
        const { email, name, method } = payload;
        await notifyNewUser(email || 'unknown', name || 'Sin nombre', method || 'unknown');
        break;
      }

      case 'error': {
        const { source, message, stack } = payload;
        await notifyError(source || 'unknown', message || 'Unknown error', stack);
        break;
      }

      case 'feedback': {
        // Require authentication for feedback
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
          return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        try {
          const token = authHeader.split('Bearer ')[1];
          const decoded = await auth.verifyIdToken(token);
          await notifyFeedback(decoded.email || 'unknown', payload.message || '');
        } catch {
          return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
        }
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
