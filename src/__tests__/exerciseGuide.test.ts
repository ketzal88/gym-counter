import { describe, it, expect } from 'vitest';
import {
    TEMPLATES,
    TEMPLATES_TONED_ABS,
    TEMPLATES_GLUTE_BUILDING,
    TEMPLATES_FAT_BURN,
    TEMPLATES_GREEK_GOD,
    TEMPLATES_GREEK_EXTRA_HOME,
    TEMPLATES_POSTPARTUM,
    POSTPARTUM_DAILY_BASE,
    TEMPLATE_QUICK,
} from '@/services/protocolEngine';
import { EXERCISE_GUIDES, getExerciseGuide } from '@/data/exerciseGuide';

/** Todos los ids de ejercicio que el motor puede llegar a mostrar. */
function allEngineExerciseIds(): Set<string> {
    const ids = new Set<string>();
    const dayMaps = [
        TEMPLATES,
        TEMPLATES_TONED_ABS,
        TEMPLATES_GLUTE_BUILDING,
        TEMPLATES_FAT_BURN,
        TEMPLATES_GREEK_GOD,
        TEMPLATES_POSTPARTUM,
    ];
    for (const map of dayMaps) {
        for (const day of Object.values(map)) {
            for (const acc of day.accessories) ids.add(acc.id);
        }
    }
    for (const acc of TEMPLATES_GREEK_EXTRA_HOME.accessories) ids.add(acc.id);
    for (const ex of POSTPARTUM_DAILY_BASE) ids.add(ex.id);
    for (const acc of TEMPLATE_QUICK.accessories) ids.add(acc.id);
    return ids;
}

describe('exerciseGuide mapping', () => {
    it('no tiene guías huérfanas: toda key existe como ejercicio del motor', () => {
        const engineIds = allEngineExerciseIds();
        const orphans = Object.keys(EXERCISE_GUIDES).filter(id => !engineIds.has(id));
        expect(orphans).toEqual([]);
    });

    it('toda guía trae pasos en ambos locales', () => {
        const broken = Object.entries(EXERCISE_GUIDES)
            .filter(([, g]) => g.steps.es.length === 0 || g.steps.en.length === 0)
            .map(([id]) => id);
        expect(broken).toEqual([]);
    });

    it('es y en describen el mismo movimiento (misma cantidad de pasos)', () => {
        const mismatched = Object.entries(EXERCISE_GUIDES)
            .filter(([, g]) => g.steps.es.length !== g.steps.en.length)
            .map(([id, g]) => `${id}: es=${g.steps.es.length} en=${g.steps.en.length}`);
        expect(mismatched).toEqual([]);
    });

    it('getExerciseGuide devuelve undefined para un id sin guía', () => {
        expect(getExerciseGuide('metcon_15')).toBeUndefined();
    });
});

describe('exerciseGuide coverage', () => {
    // TODO(gabriel): decidir la política de cobertura — ver la explicación en el chat.
    //
    // Hoy 82 de ~140 ejercicios tienen guía. Los que faltan NO son un olvido: el
    // dataset no tiene un equivalente fiel (no existe "plancha" ni "sentadilla sin
    // peso" a secas, ni hip thrust, ni bulgarian split squat), o son cosas nuestras
    // (metcons, EMOM/AMRAP, skills de calistenia, respiración/TVA de posparto).
    //
    // La pregunta es qué pasa cuando alguien agregue un ejercicio nuevo al motor.
    it.todo('un ejercicio nuevo del motor no queda sin guía por accidente');
});
