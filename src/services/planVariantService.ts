import { db, PlanVariant } from '@/services/db';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';

// Cache en memoria para variantes
let variantsCache: Record<string, PlanVariant> | null = null;

/**
 * Obtiene una variante de plan específica por ID
 */
export async function getPlanVariant(variantId: string): Promise<PlanVariant | null> {
    try {
        // Verificar cache primero
        if (variantsCache && variantsCache[variantId]) {
            return variantsCache[variantId];
        }

        const variantDoc = await getDoc(doc(db, 'planVariants', variantId));

        if (!variantDoc.exists()) {
            console.error(`Plan variant ${variantId} not found`);
            return null;
        }

        const variant = {
            id: variantDoc.id,
            ...variantDoc.data()
        } as PlanVariant;

        // Actualizar cache
        if (!variantsCache) {
            variantsCache = {};
        }
        variantsCache[variantId] = variant;

        return variant;
    } catch (error) {
        console.error('Error fetching plan variant:', error);
        return null;
    }
}

/**
 * Obtiene todas las variantes de plan (lazy load de cache)
 */
export async function getAllPlanVariants(): Promise<PlanVariant[]> {
    try {
        if (variantsCache) {
            return Object.values(variantsCache);
        }

        const variantsSnapshot = await getDocs(collection(db, 'planVariants'));
        const variants = variantsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as PlanVariant[];

        // Poblar cache
        variantsCache = {};
        variants.forEach(variant => {
            variantsCache![variant.id] = variant;
        });

        return variants;
    } catch (error) {
        console.error('Error fetching all plan variants:', error);
        return [];
    }
}

/**
 * Selecciona la variante de plan apropiada basada en el perfil del usuario
 */
export function selectPlanVariant(profile: {
    fitnessGoal: 'weight_loss' | 'muscle_gain' | 'max_strength' | 'conditioning';
    experienceLevel: 'beginner' | 'intermediate' | 'advanced';
    weeklyAvailability: 3 | 4 | 5 | 6;
}): string {
    const { fitnessGoal, experienceLevel, weeklyAvailability } = profile;

    // Formato: {goal}_{experience}_{days}day
    // Ejemplo: "muscle_gain_intermediate_5day"
    return `${fitnessGoal}_${experienceLevel}_${weeklyAvailability}day`;
}

/**
 * Invalida el cache de variantes (útil para desarrollo/testing)
 */
export function clearVariantsCache(): void {
    variantsCache = null;
}

/**
 * Obtiene variantes filtradas por criterios
 */
export async function getPlanVariantsByGoal(
    goal: 'weight_loss' | 'muscle_gain' | 'max_strength' | 'conditioning'
): Promise<PlanVariant[]> {
    const allVariants = await getAllPlanVariants();
    return allVariants.filter(variant => variant.goal === goal);
}

/**
 * Obtiene el nombre descriptivo de una variante en español
 */
export function getVariantDisplayName(variantId: string): string {
    const goalNames = {
        weight_loss: 'Pérdida de Peso',
        muscle_gain: 'Ganancia Muscular',
        max_strength: 'Fuerza Máxima',
        conditioning: 'Resistencia/CrossFit'
    };

    const levelNames = {
        beginner: 'Principiante',
        intermediate: 'Intermedio',
        advanced: 'Avanzado'
    };

    // Parse variant ID (ej: "muscle_gain_intermediate_5day")
    const parts = variantId.split('_');
    const days = parts[parts.length - 1].replace('day', '');

    let goal = '';
    let level = '';

    if (variantId.includes('weight_loss')) {
        goal = goalNames.weight_loss;
        level = parts[2];
    } else if (variantId.includes('muscle_gain')) {
        goal = goalNames.muscle_gain;
        level = parts[2];
    } else if (variantId.includes('max_strength')) {
        goal = goalNames.max_strength;
        level = parts[2];
    } else if (variantId.includes('conditioning')) {
        goal = goalNames.conditioning;
        level = parts[1];
    }

    const levelDisplay = levelNames[level as keyof typeof levelNames] || level;

    return `${goal} - ${levelDisplay} (${days} días/semana)`;
}
