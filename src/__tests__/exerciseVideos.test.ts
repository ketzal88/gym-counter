import { describe, it, expect } from 'vitest';
import { TEMPLATES_GREEK_GOD } from '@/services/protocolEngine';
import { hasVideo, getYouTubeUrl } from '@/data/exerciseVideos';

describe('Greek God exercise videos', () => {
    it('every greek_god exercise has a resolvable video link', () => {
        const missing: string[] = [];
        for (const day of Object.values(TEMPLATES_GREEK_GOD)) {
            for (const acc of day.accessories) {
                if (!hasVideo(acc.id) || !getYouTubeUrl(acc.id)) {
                    missing.push(acc.id);
                }
            }
        }
        expect(missing).toEqual([]);
    });
});
