import { describe, it, expect } from 'vitest';
import { isSameDay } from '@/utils/date';

describe('isSameDay', () => {
    it('returns true for same day', () => {
        const d1 = new Date(2025, 5, 15, 10, 30);
        const d2 = new Date(2025, 5, 15, 22, 0);
        expect(isSameDay(d1, d2)).toBe(true);
    });

    it('returns false for different days', () => {
        const d1 = new Date(2025, 5, 15);
        const d2 = new Date(2025, 5, 16);
        expect(isSameDay(d1, d2)).toBe(false);
    });

    it('returns false for different months same day number', () => {
        const d1 = new Date(2025, 5, 15);
        const d2 = new Date(2025, 6, 15);
        expect(isSameDay(d1, d2)).toBe(false);
    });

    it('returns false for different years same date', () => {
        const d1 = new Date(2025, 5, 15);
        const d2 = new Date(2026, 5, 15);
        expect(isSameDay(d1, d2)).toBe(false);
    });
});
