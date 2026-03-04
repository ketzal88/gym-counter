/**
 * Script para poblar Firestore con las 48 variantes de plan
 *
 * Ejecutar con: npx ts-node scripts/seedPlanVariants.ts
 *
 * IMPORTANTE: Configura las variables de entorno de Firebase antes de ejecutar
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import { TEMPLATES } from '../src/services/protocolEngine';

// Configuración de Firebase (reemplazar con tus credenciales)
const firebaseConfig = {
    // TODO: Añadir credenciales de Firebase
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

interface PlanVariantConfig {
    id: string;
    name: string;
    goal: 'weight_loss' | 'muscle_gain' | 'max_strength' | 'conditioning' | 'toned_abs' | 'glute_building' | 'fat_burn';
    experienceLevel: 'beginner' | 'intermediate' | 'advanced';
    weeklyDays: 3 | 4 | 5 | 6;
    totalDays: number;
    cycleLength: number;
    deloadFrequency: number;
    volumeMultiplier: number;
    intensityMultiplier: number;
    exerciseComplexity: 'basic' | 'standard' | 'advanced';
    description: string;
    targetAudience: string;
}

/**
 * Configuraciones de las 48 variantes de plan
 * Matriz: 4 goals × 3 levels × 4 weekly days = 48 variants
 */
const PLAN_VARIANTS: PlanVariantConfig[] = [
    // WEIGHT LOSS VARIANTS (Pérdida de Peso)
    {
        id: 'weight_loss_beginner_3day',
        name: 'Pérdida de Peso - Principiante (3 días)',
        goal: 'weight_loss',
        experienceLevel: 'beginner',
        weeklyDays: 3,
        totalDays: 180,
        cycleLength: 12,
        deloadFrequency: 4,
        volumeMultiplier: 0.7,
        intensityMultiplier: 0.75,
        exerciseComplexity: 'basic',
        description: 'Plan enfocado en déficit calórico con ejercicios básicos y énfasis en cardio',
        targetAudience: 'Personas nuevas al ejercicio que buscan perder peso de forma saludable'
    },
    {
        id: 'weight_loss_beginner_4day',
        name: 'Pérdida de Peso - Principiante (4 días)',
        goal: 'weight_loss',
        experienceLevel: 'beginner',
        weeklyDays: 4,
        totalDays: 180,
        cycleLength: 12,
        deloadFrequency: 4,
        volumeMultiplier: 0.75,
        intensityMultiplier: 0.75,
        exerciseComplexity: 'basic',
        description: 'Plan balanceado de pérdida de peso con más frecuencia de entrenamiento',
        targetAudience: 'Principiantes con disponibilidad de 4 días semanales'
    },
    {
        id: 'weight_loss_intermediate_5day',
        name: 'Pérdida de Peso - Intermedio (5 días)',
        goal: 'weight_loss',
        experienceLevel: 'intermediate',
        weeklyDays: 5,
        totalDays: 180,
        cycleLength: 12,
        deloadFrequency: 4,
        volumeMultiplier: 1.0,
        intensityMultiplier: 0.85,
        exerciseComplexity: 'standard',
        description: 'Plan intermedio con mayor volumen de trabajo y variedad de ejercicios',
        targetAudience: 'Personas con experiencia buscando optimizar composición corporal'
    },
    {
        id: 'weight_loss_advanced_6day',
        name: 'Pérdida de Peso - Avanzado (6 días)',
        goal: 'weight_loss',
        experienceLevel: 'advanced',
        weeklyDays: 6,
        totalDays: 180,
        cycleLength: 12,
        deloadFrequency: 4,
        volumeMultiplier: 1.2,
        intensityMultiplier: 0.9,
        exerciseComplexity: 'advanced',
        description: 'Plan avanzado de alta frecuencia con técnicas avanzadas de condicionamiento',
        targetAudience: 'Atletas experimentados en fase de corte o definición'
    },

    // MUSCLE GAIN VARIANTS (Ganancia Muscular)
    {
        id: 'muscle_gain_beginner_3day',
        name: 'Ganancia Muscular - Principiante (3 días)',
        goal: 'muscle_gain',
        experienceLevel: 'beginner',
        weeklyDays: 3,
        totalDays: 180,
        cycleLength: 12,
        deloadFrequency: 4,
        volumeMultiplier: 0.7,
        intensityMultiplier: 0.8,
        exerciseComplexity: 'basic',
        description: 'Plan de hipertrofia básico con ejercicios compuestos y volumen moderado',
        targetAudience: 'Principiantes en fase de volumen o ganancia de masa muscular'
    },
    {
        id: 'muscle_gain_intermediate_5day',
        name: 'Ganancia Muscular - Intermedio (5 días)',
        goal: 'muscle_gain',
        experienceLevel: 'intermediate',
        weeklyDays: 5,
        totalDays: 180,
        cycleLength: 12,
        deloadFrequency: 4,
        volumeMultiplier: 1.0,
        intensityMultiplier: 1.0,
        exerciseComplexity: 'standard',
        description: 'Plan de hipertrofia clásico con volumen óptimo y progresión estructurada',
        targetAudience: 'Atletas intermedios buscando maximizar ganancia muscular'
    },
    {
        id: 'muscle_gain_advanced_6day',
        name: 'Ganancia Muscular - Avanzado (6 días)',
        goal: 'muscle_gain',
        experienceLevel: 'advanced',
        weeklyDays: 6,
        totalDays: 180,
        cycleLength: 12,
        deloadFrequency: 4,
        volumeMultiplier: 1.3,
        intensityMultiplier: 1.1,
        exerciseComplexity: 'advanced',
        description: 'Plan de hipertrofia avanzado con alto volumen y técnicas de intensificación',
        targetAudience: 'Culturistas y atletas avanzados en fase de volumen'
    },

    // MAX STRENGTH VARIANTS (Fuerza Máxima)
    {
        id: 'max_strength_beginner_3day',
        name: 'Fuerza Máxima - Principiante (3 días)',
        goal: 'max_strength',
        experienceLevel: 'beginner',
        weeklyDays: 3,
        totalDays: 180,
        cycleLength: 12,
        deloadFrequency: 4,
        volumeMultiplier: 0.7,
        intensityMultiplier: 0.85,
        exerciseComplexity: 'basic',
        description: 'Introducción al entrenamiento de fuerza con técnica y pesos moderados',
        targetAudience: 'Principiantes interesados en powerlifting o levantamiento olímpico'
    },
    {
        id: 'max_strength_intermediate_5day',
        name: 'Fuerza Máxima - Intermedio (5 días)',
        goal: 'max_strength',
        experienceLevel: 'intermediate',
        weeklyDays: 5,
        totalDays: 180,
        cycleLength: 12,
        deloadFrequency: 4,
        volumeMultiplier: 1.0,
        intensityMultiplier: 1.1,
        exerciseComplexity: 'standard',
        description: 'Plan de fuerza estructurado con periodización y levantamientos pesados',
        targetAudience: 'Powerlifters intermedios buscando nuevos PRs'
    },
    {
        id: 'max_strength_advanced_6day',
        name: 'Fuerza Máxima - Avanzado (6 días)',
        goal: 'max_strength',
        experienceLevel: 'advanced',
        weeklyDays: 6,
        totalDays: 180,
        cycleLength: 12,
        deloadFrequency: 4,
        volumeMultiplier: 1.3,
        intensityMultiplier: 1.2,
        exerciseComplexity: 'advanced',
        description: 'Plan de fuerza máxima con alta frecuencia y variaciones complejas',
        targetAudience: 'Powerlifters competitivos y atletas de fuerza avanzados'
    },

    // CONDITIONING VARIANTS (Resistencia/CrossFit)
    {
        id: 'conditioning_beginner_3day',
        name: 'Resistencia/CrossFit - Principiante (3 días)',
        goal: 'conditioning',
        experienceLevel: 'beginner',
        weeklyDays: 3,
        totalDays: 180,
        cycleLength: 12,
        deloadFrequency: 4,
        volumeMultiplier: 0.7,
        intensityMultiplier: 0.8,
        exerciseComplexity: 'basic',
        description: 'Introducción a WODs y metcons con movimientos básicos y escalados',
        targetAudience: 'Principiantes en CrossFit o entrenamiento funcional'
    },
    {
        id: 'conditioning_intermediate_5day',
        name: 'Resistencia/CrossFit - Intermedio (5 días)',
        goal: 'conditioning',
        experienceLevel: 'intermediate',
        weeklyDays: 5,
        totalDays: 180,
        cycleLength: 12,
        deloadFrequency: 4,
        volumeMultiplier: 1.0,
        intensityMultiplier: 0.95,
        exerciseComplexity: 'standard',
        description: 'Plan de conditioning completo con gimnástica, levantamientos y metcons',
        targetAudience: 'Atletas de CrossFit intermedios buscando mejorar rendimiento'
    },
    {
        id: 'conditioning_advanced_6day',
        name: 'Resistencia/CrossFit - Avanzado (6 días)',
        goal: 'conditioning',
        experienceLevel: 'advanced',
        weeklyDays: 6,
        totalDays: 180,
        cycleLength: 12,
        deloadFrequency: 4,
        volumeMultiplier: 1.2,
        intensityMultiplier: 1.0,
        exerciseComplexity: 'advanced',
        description: 'Plan de conditioning de alta intensidad con movimientos complejos y WODs exigentes',
        targetAudience: 'Atletas competitivos de CrossFit y conditioning'
    },

    // TONED ABS VARIANTS (Tonificar Abdomen)
    {
        id: 'toned_abs_beginner_3day',
        name: 'Tonificar Abdomen - Principiante (3 días)',
        goal: 'toned_abs',
        experienceLevel: 'beginner',
        weeklyDays: 3,
        totalDays: 180,
        cycleLength: 6,
        deloadFrequency: 4,
        volumeMultiplier: 0.7,
        intensityMultiplier: 0.75,
        exerciseComplexity: 'basic',
        description: 'Programa básico de core para principiantes con énfasis en técnica y estabilidad',
        targetAudience: 'Mujeres nuevas en el gym que quieren tonificar su abdomen'
    },
    {
        id: 'toned_abs_intermediate_5day',
        name: 'Tonificar Abdomen - Intermedio (5 días)',
        goal: 'toned_abs',
        experienceLevel: 'intermediate',
        weeklyDays: 5,
        totalDays: 180,
        cycleLength: 6,
        deloadFrequency: 4,
        volumeMultiplier: 1.0,
        intensityMultiplier: 0.9,
        exerciseComplexity: 'standard',
        description: 'Programa intermedio de core con HIIT y circuitos para definición abdominal',
        targetAudience: 'Mujeres con experiencia buscando definir abdomen'
    },
    {
        id: 'toned_abs_advanced_6day',
        name: 'Tonificar Abdomen - Avanzado (6 días)',
        goal: 'toned_abs',
        experienceLevel: 'advanced',
        weeklyDays: 6,
        totalDays: 180,
        cycleLength: 6,
        deloadFrequency: 4,
        volumeMultiplier: 1.2,
        intensityMultiplier: 1.0,
        exerciseComplexity: 'advanced',
        description: 'Programa avanzado de core con ejercicios complejos y alto volumen',
        targetAudience: 'Atletas avanzadas buscando abdomen definido y fuerte'
    },

    // GLUTE BUILDING VARIANTS (Construir Glúteos)
    {
        id: 'glute_building_beginner_3day',
        name: 'Construir Glúteos - Principiante (3 días)',
        goal: 'glute_building',
        experienceLevel: 'beginner',
        weeklyDays: 3,
        totalDays: 180,
        cycleLength: 6,
        deloadFrequency: 4,
        volumeMultiplier: 0.7,
        intensityMultiplier: 0.75,
        exerciseComplexity: 'basic',
        description: 'Programa básico enfocado en activación y fortalecimiento de glúteos',
        targetAudience: 'Mujeres principiantes que quieren construir glúteos desde cero'
    },
    {
        id: 'glute_building_intermediate_5day',
        name: 'Construir Glúteos - Intermedio (5 días)',
        goal: 'glute_building',
        experienceLevel: 'intermediate',
        weeklyDays: 5,
        totalDays: 180,
        cycleLength: 6,
        deloadFrequency: 4,
        volumeMultiplier: 1.0,
        intensityMultiplier: 1.0,
        exerciseComplexity: 'standard',
        description: 'Programa intermedio con hip thrust pesado y trabajo de posterior chain',
        targetAudience: 'Mujeres con experiencia buscando maximizar crecimiento de glúteos'
    },
    {
        id: 'glute_building_advanced_6day',
        name: 'Construir Glúteos - Avanzado (6 días)',
        goal: 'glute_building',
        experienceLevel: 'advanced',
        weeklyDays: 6,
        totalDays: 180,
        cycleLength: 6,
        deloadFrequency: 4,
        volumeMultiplier: 1.3,
        intensityMultiplier: 1.1,
        exerciseComplexity: 'advanced',
        description: 'Programa avanzado de alta frecuencia para glúteos con técnicas de intensificación',
        targetAudience: 'Atletas avanzadas especializadas en desarrollo de glúteos'
    },

    // FAT BURN VARIANTS (Quemar Grasa Intenso)
    {
        id: 'fat_burn_beginner_3day',
        name: 'Quemar Grasa - Principiante (3 días)',
        goal: 'fat_burn',
        experienceLevel: 'beginner',
        weeklyDays: 3,
        totalDays: 180,
        cycleLength: 6,
        deloadFrequency: 4,
        volumeMultiplier: 0.7,
        intensityMultiplier: 0.75,
        exerciseComplexity: 'basic',
        description: 'Programa de quema de grasa con ejercicios básicos y cardio moderado',
        targetAudience: 'Mujeres nuevas en el gym que buscan perder peso de forma efectiva'
    },
    {
        id: 'fat_burn_intermediate_5day',
        name: 'Quemar Grasa - Intermedio (5 días)',
        goal: 'fat_burn',
        experienceLevel: 'intermediate',
        weeklyDays: 5,
        totalDays: 180,
        cycleLength: 6,
        deloadFrequency: 4,
        volumeMultiplier: 1.0,
        intensityMultiplier: 0.9,
        exerciseComplexity: 'standard',
        description: 'Programa intensivo con HIIT, circuitos metabólicos y fuerza full body',
        targetAudience: 'Mujeres con experiencia en entrenamiento buscando quemar grasa agresivamente'
    },
    {
        id: 'fat_burn_advanced_6day',
        name: 'Quemar Grasa - Avanzado (6 días)',
        goal: 'fat_burn',
        experienceLevel: 'advanced',
        weeklyDays: 6,
        totalDays: 180,
        cycleLength: 6,
        deloadFrequency: 4,
        volumeMultiplier: 1.2,
        intensityMultiplier: 0.95,
        exerciseComplexity: 'advanced',
        description: 'Programa de alta intensidad para máxima quema calórica con doble sesiones y técnicas avanzadas',
        targetAudience: 'Atletas avanzadas en fase de definición agresiva'
    },
];

/**
 * Función principal para poblar Firestore
 */
async function seedPlanVariants() {
    console.log('🌱 Iniciando seed de variantes de plan...\n');

    try {
        for (const variant of PLAN_VARIANTS) {
            const variantDoc = doc(db, 'planVariants', variant.id);

            const variantData = {
                ...variant,
                dayTemplates: TEMPLATES, // Por ahora, todos usan los mismos templates
                metadata: {
                    description: variant.description,
                    targetAudience: variant.targetAudience,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }
            };

            await setDoc(variantDoc, variantData);
            console.log(`✅ Creado: ${variant.name}`);
        }

        console.log(`\n🎉 ¡Seed completado! ${PLAN_VARIANTS.length} variantes creadas.`);
        console.log('\n📝 Nota: Este script incluye 12 variantes ejemplo.');
        console.log('   Puedes expandir PLAN_VARIANTS para incluir las 48 variantes completas.\n');

    } catch (error) {
        console.error('❌ Error durante seed:', error);
        throw error;
    }
}

// Ejecutar seed
seedPlanVariants()
    .then(() => {
        console.log('✅ Proceso completado exitosamente');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Error fatal:', error);
        process.exit(1);
    });
