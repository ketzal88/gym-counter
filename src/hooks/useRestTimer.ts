import { useState, useRef, useCallback, useEffect } from 'react';

const DEFAULT_REST_DURATION = 120;
const STORAGE_KEY = 'gymcounter_rest_duration';

function getStoredDuration(): number {
    if (typeof window === 'undefined') return DEFAULT_REST_DURATION;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        const parsed = parseInt(stored, 10);
        if (parsed >= 30 && parsed <= 300) return parsed;
    }
    return DEFAULT_REST_DURATION;
}

export function useRestTimer() {
    const [restDuration, setRestDuration] = useState(DEFAULT_REST_DURATION);
    const [restTimer, setRestTimer] = useState(0);
    const [timerActive, setTimerActive] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Load stored duration on mount
    useEffect(() => {
        setRestDuration(getStoredDuration());
    }, []);

    const updateRestDuration = useCallback((seconds: number) => {
        const clamped = Math.max(30, Math.min(300, seconds));
        setRestDuration(clamped);
        localStorage.setItem(STORAGE_KEY, clamped.toString());
    }, []);

    const startRestTimer = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        const duration = getStoredDuration();
        setRestTimer(duration);
        setTimerActive(true);

        timerRef.current = setInterval(() => {
            setRestTimer(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!);
                    timerRef.current = null;
                    setTimerActive(false);
                    try {
                        const ctx = new AudioContext();
                        const osc = ctx.createOscillator();
                        const gain = ctx.createGain();
                        osc.connect(gain);
                        gain.connect(ctx.destination);
                        osc.frequency.value = 880;
                        gain.gain.value = 1;
                        osc.start();
                        osc.stop(ctx.currentTime + 0.3);
                    } catch { /* audio not available */ }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, []);

    const cancelRestTimer = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
        setRestTimer(0);
        setTimerActive(false);
    }, []);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return {
        restTimer,
        timerActive,
        restDuration,
        startRestTimer,
        cancelRestTimer,
        updateRestDuration,
        formatTime,
    };
}
