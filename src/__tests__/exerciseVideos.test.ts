import { describe, it, expect } from 'vitest';
import {
    TEMPLATES_GREEK_GOD,
    TEMPLATES_GREEK_EXTRA_HOME,
    TEMPLATES_POSTPARTUM,
    POSTPARTUM_DAILY_BASE,
} from '@/services/protocolEngine';
import { hasVideo, getYouTubeUrl } from '@/data/exerciseVideos';

describe('Greek God exercise videos', () => {
    it('every greek_god exercise (incl. day 4 gym + home variants) has a resolvable video link', () => {
        const days = [...Object.values(TEMPLATES_GREEK_GOD), TEMPLATES_GREEK_EXTRA_HOME];
        const missing: string[] = [];
        for (const day of days) {
            for (const acc of day.accessories) {
                if (!hasVideo(acc.id) || !getYouTubeUrl(acc.id)) {
                    missing.push(acc.id);
                }
            }
        }
        expect(missing).toEqual([]);
    });
});

describe('Postpartum exercise videos', () => {
    it('every postpartum workout exercise (A/B/C phases) has a resolvable video link', () => {
        const missing: string[] = [];
        for (const day of Object.values(TEMPLATES_POSTPARTUM)) {
            for (const acc of day.accessories) {
                if (!hasVideo(acc.id) || !getYouTubeUrl(acc.id)) {
                    missing.push(acc.id);
                }
            }
        }
        expect(missing).toEqual([]);
    });

    it('every daily-base reconnection exercise has a resolvable video link', () => {
        const missing = POSTPARTUM_DAILY_BASE
            .filter(ex => !hasVideo(ex.id) || !getYouTubeUrl(ex.id))
            .map(ex => ex.id);
        expect(missing).toEqual([]);
    });
});
