import { describe, it, expect } from 'vitest';
import type Stripe from 'stripe';
import { mapStatus, idOf, currentPeriod } from '@/lib/stripeWebhook';
import { slackEscape, maskEmail } from '@/lib/slack';

describe('mapStatus', () => {
    it('maps trialing/active and everything else to cancelled', () => {
        expect(mapStatus('trialing')).toBe('trial');
        expect(mapStatus('active')).toBe('active');
        expect(mapStatus('past_due')).toBe('cancelled');
        expect(mapStatus('canceled')).toBe('cancelled');
    });
});

describe('idOf', () => {
    it('handles id strings, expanded objects and null', () => {
        expect(idOf('sub_1')).toBe('sub_1');
        expect(idOf({ id: 'sub_2' })).toBe('sub_2');
        expect(idOf(null)).toBeNull();
        expect(idOf(undefined)).toBeNull();
    });
});

describe('currentPeriod', () => {
    it('reads the first item period in ms', () => {
        const sub = { items: { data: [{ current_period_start: 10, current_period_end: 20 }] } } as unknown as Stripe.Subscription;
        expect(currentPeriod(sub)).toEqual({ startMs: 10000, endMs: 20000 });
    });
    it('returns null without items', () => {
        expect(currentPeriod({ items: { data: [] } } as unknown as Stripe.Subscription)).toBeNull();
    });
});

describe('slack helpers', () => {
    it('escapes mrkdwn control chars and code fences', () => {
        expect(slackEscape('<!channel> & ```x```')).toBe("&lt;!channel&gt; &amp; '''x'''");
        expect(slackEscape('abcdef', 3)).toBe('abc');
    });
    it('masks emails', () => {
        expect(maskEmail('someone@example.com')).toBe('so***@example.com');
        expect(maskEmail('nope')).toBe('***');
    });
});
