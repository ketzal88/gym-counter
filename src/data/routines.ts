export interface Exercise {
    id: string;
    name: string;
    series: number;
    reps: string;
    videoUrl?: string;
}

export interface Routine {
    id: string;
    name: string;
    exercises: Exercise[];
    note?: string;
}

// DEPRECATED: Replaced by Military Protocol (protocolEngine.ts)
/*
export const ROUTINES: Routine[] = [
    {
        id: 'A',
        name: 'RUTINA A – PECHO & TRÍCEPS (FUERZA MILITAR)',
        note: 'Si en fondos haces más de 15, añade lastre.',
        exercises: [
            { id: 'bp', name: 'Bench Press (Barbell)', series: 4, reps: '6–8', videoUrl: 'https://www.youtube.com/watch?v=rT7DgCr-3pg' },
            { id: 'ibp', name: 'Incline Bench Press (Dumbbell)', series: 3, reps: '8–10', videoUrl: 'https://www.youtube.com/watch?v=8iPEnn-ltC8' },
            { id: 'cd', name: 'Chest Dip', series: 3, reps: 'AMRAP', videoUrl: 'https://www.youtube.com/watch?v=2z8JmcrW-As' },
            { id: 'dpu', name: 'Decline Push Up', series: 3, reps: '15–20', videoUrl: 'https://www.youtube.com/watch?v=Yd-1aZxFzYg' },
            { id: 'tp', name: 'Triceps Pushdown', series: 3, reps: '10–12', videoUrl: 'https://www.youtube.com/watch?v=2-LAMcpzODU' },
            { id: 'sc', name: 'Skullcrusher (Dumbbell)', series: 3, reps: '10–12', videoUrl: 'https://www.youtube.com/watch?v=d_KZxkY_0cM' },
        ]
    },
    {
        id: 'B',
        name: 'RUTINA B – ESPALDA & BÍCEPS (POTENCIA)',
        note: 'Dominadas estrictas. Si haces menos de 6, usa asistencia.',
        exercises: [
            { id: 'pu', name: 'Pull Up', series: 4, reps: 'AMRAP', videoUrl: 'https://www.youtube.com/watch?v=eGo4IYlbE5g' },
            { id: 'bor', name: 'Bent Over Row (Barbell)', series: 4, reps: '6–8', videoUrl: 'https://www.youtube.com/watch?v=vT2GjY_Umpw' },
            { id: 'lp', name: 'Lat Pulldown', series: 3, reps: '10–12', videoUrl: 'https://www.youtube.com/watch?v=CAwf7n6Luuc' },
            { id: 'bc', name: 'Bicep Curl (Barbell)', series: 3, reps: '8–10', videoUrl: 'https://www.youtube.com/watch?v=kwG2ipFRgfo' },
            { id: 'hc', name: 'Hammer Curl (Dumbbell)', series: 3, reps: '10–12', videoUrl: 'https://www.youtube.com/watch?v=zC3nLlEvin4' },
            { id: 'cc', name: 'Concentration Curl', series: 3, reps: '12 por brazo', videoUrl: 'https://www.youtube.com/watch?v=0AUGkch3tzc' },
        ]
    },
    {
        id: 'C',
        name: 'RUTINA C – PECHO & BRAZOS (RESISTENCIA MILITAR)',
        note: 'Aquí debe quemar. No bajes el ritmo.',
        exercises: [
            { id: 'icpm', name: 'Incline Chest Press (Machine)', series: 3, reps: '12–15', videoUrl: 'https://www.youtube.com/watch?v=DbFgADa2PL8' },
            { id: 'cf', name: 'Chest Fly (Dumbbell)', series: 3, reps: '12–15', videoUrl: 'https://www.youtube.com/watch?v=eozdVDA78K0' },
            { id: 'pu_c', name: 'Push Up', series: 4, reps: '20', videoUrl: 'https://www.youtube.com/watch?v=IODxDxX7oi4' },
            { id: 'trp', name: 'Triceps Rope Pushdown', series: 3, reps: '15', videoUrl: 'https://www.youtube.com/watch?v=vB5OHsJ3EME' },
            { id: 'bc_d', name: 'Bicep Curl (Dumbbell)', series: 3, reps: '12–15', videoUrl: 'https://www.youtube.com/watch?v=ykJmrZ5v0Oo' },
            { id: 'plank', name: 'Plank', series: 3, reps: '60–90 s', videoUrl: 'https://www.youtube.com/watch?v=pSHjTRCQxIw' },
        ]
    }
];
*/

export const FINISHER = {
    name: '🔥 FINISHER MILITAR (OPCIONAL)',
    note: 'Solo 2–3 días/semana. Circuito – 3 rondas. Descanso: 60 s entre rondas.',
    exercises: [
        { name: 'Burpees', reps: '10', videoUrl: 'https://www.youtube.com/watch?v=TU8QYVW0gDU' },
        { name: 'Jumping Jacks', reps: '20', videoUrl: 'https://www.youtube.com/watch?v=iSSAk4XCsRA' },
        { name: 'Push Ups', reps: '15', videoUrl: 'https://www.youtube.com/watch?v=IODxDxX7oi4' },
    ]
};
