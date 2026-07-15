/**
 * Guía de ejecución por ejercicio: músculo objetivo, secundarios y pasos en ES/EN.
 *
 * Fuente de la data: https://github.com/hasaneyldrm/exercises-dataset (MIT License,
 * Copyright (c) 2026 Hasan Emir Yıldırım). Solo se usa la capa de datos —
 * nombres, target, equipment, músculos e instrucciones traducidas.
 *
 * La media del dataset (images/ y videos/, © Gym visual) NO se incluye: requiere
 * licencia propia de https://gymvisual.com/ y no la tenemos. Los videos siguen
 * viniendo de YouTube vía exerciseVideos.ts.
 *
 * El mapeo engine_id -> datasetId está curado a mano: el match automático por
 * nombre producía falsos positivos (ej. "Pull Ups (Strict)" -> "bench pull-ups").
 * Los ejercicios sin guía son intencionales — metcons, skills y trabajo de
 * posparto que no existen en el dataset. getExerciseGuide() devuelve undefined
 * y la UI no debe asumir que existe.
 */
import type { Locale } from '@/context/LanguageContext';

export interface ExerciseGuide {
  /** ID del registro en exercises-dataset (ej: "0652"). */
  datasetId: string;
  /** Nombre canónico en el dataset — útil para auditar el mapeo. */
  datasetName: string;
  /** Músculo objetivo primario (ej: "lats"). */
  target: string;
  /** Equipamiento requerido (ej: "body weight"). */
  equipment: string;
  /** Músculos secundarios involucrados. */
  secondaryMuscles: string[];
  /** Pasos de ejecución, por locale. */
  steps: Record<Locale, string[]>;
}

export const EXERCISE_GUIDES: Record<string, ExerciseGuide> = {
  ab_wheel: {
    datasetId: '0857',
    datasetName: "wheel rollerout",
    target: "abs",
    equipment: "wheel roller",
    secondaryMuscles: ["lower back"],
    steps: {
      es: ["Arrodíllate en el suelo y coloca el rodillo frente a ti.", "Coloca las manos en las asas del rodillo y extiende los brazos rectos hacia adelante.", "Activa los músculos del core y haz rodar lentamente el rodillo hacia adelante, manteniendo la espalda recta y el abdomen contraído.", "Continúa rodando hacia delante hasta que el cuerpo esté completamente extendido y los brazos por encima de la cabeza.", "Haz una pausa de un momento, luego haz rodar lentamente el rodillo de regreso hacia las rodillas, manteniendo el control y el abdomen activado.", "Repite el número de repeticiones deseado."],
      en: ["Kneel on the floor and place the wheel roller in front of you.", "Place your hands on the handles of the wheel roller and extend your arms straight out in front of you.", "Engage your core muscles and slowly roll the wheel forward, keeping your back straight and your abs tight.", "Continue rolling forward until your body is fully extended and your arms are overhead.", "Pause for a moment, then slowly roll the wheel back towards your knees, maintaining control and keeping your abs engaged.", "Repeat for the desired number of repetitions."],
    },
  },
  abductor_machine: {
    datasetId: '0597',
    datasetName: "lever seated hip abduction",
    target: "abductors",
    equipment: "leverage machine",
    secondaryMuscles: ["glutes", "hamstrings"],
    steps: {
      es: ["Ajusta la altura del asiento de modo que tus rodillas formen un ángulo de 90 grados.", "Siéntate en la máquina con la espalda apoyada en el respaldo y los pies sobre los apoyapiés.", "Coloca las manos en las asas laterales para mayor estabilidad.", "Activa los abductores y empuja lentamente las piernas hacia afuera, alejándolas de la línea media del cuerpo.", "Haz una pausa al final del movimiento y luego junta lentamente las piernas de nuevo hasta la posición inicial.", "Repite el número de repeticiones deseado."],
      en: ["Adjust the seat height so that your knees are at a 90-degree angle.", "Sit on the machine with your back against the backrest and your feet on the footrests.", "Place your hands on the side handles for stability.", "Engage your abductors and slowly push your legs apart, away from the midline of your body.", "Pause for a moment at the end of the movement, then slowly bring your legs back together to the starting position.", "Repeat for the desired number of repetitions."],
    },
  },
  barbell_curl: {
    datasetId: '0031',
    datasetName: "barbell curl",
    target: "biceps",
    equipment: "barbell",
    secondaryMuscles: ["forearms"],
    steps: {
      es: ["Ponte de pie con los pies separados a la altura de los hombros y sujeta una barra con un agarre supino, con las palmas mirando hacia delante.", "Mantén los codos cerca del torso y exhala mientras levantas el peso contrayendo los bíceps.", "Continúa levantando la barra hasta que los bíceps estén completamente contraídos y la barra esté a la altura de los hombros.", "Mantén la posición contraída durante una breve pausa mientras aprietas los bíceps.", "Inhala mientras comienzas a bajar lentamente la barra de vuelta a la posición inicial.", "Repite el número de repeticiones deseado."],
      en: ["Stand up straight with your feet shoulder-width apart and hold a barbell with an underhand grip, palms facing forward.", "Keep your elbows close to your torso and exhale as you curl the weights while contracting your biceps.", "Continue to raise the bar until your biceps are fully contracted and the bar is at shoulder level.", "Hold the contracted position for a brief pause as you squeeze your biceps.", "Inhale as you slowly begin to lower the bar back to the starting position.", "Repeat for the desired number of repetitions."],
    },
  },
  bb_row: {
    datasetId: '0027',
    datasetName: "barbell bent over row",
    target: "upper back",
    equipment: "barbell",
    secondaryMuscles: ["biceps", "forearms"],
    steps: {
      es: ["Ponte de pie con los pies separados a la altura de los hombros y las rodillas ligeramente flexionadas.", "Inclínate hacia delante desde las caderas manteniendo la espalda recta y el pecho elevado.", "Agarra la barra con un agarre pronado, con las manos un poco más separadas que el ancho de los hombros.", "Tira de la barra hacia la parte inferior del pecho retrayendo los omóplatos y contrayendo los músculos de la espalda.", "Haz una pausa breve en la parte alta y luego baja lentamente la barra de vuelta a la posición inicial.", "Repite el número de repeticiones deseado."],
      en: ["Stand with your feet shoulder-width apart and knees slightly bent.", "Bend forward at the hips while keeping your back straight and chest up.", "Grasp the barbell with an overhand grip, hands slightly wider than shoulder-width apart.", "Pull the barbell towards your lower chest by retracting your shoulder blades and squeezing your back muscles.", "Pause for a moment at the top, then slowly lower the barbell back to the starting position.", "Repeat for the desired number of repetitions."],
    },
  },
  bench_fb: {
    datasetId: '0025',
    datasetName: "barbell bench press",
    target: "pectorals",
    equipment: "barbell",
    secondaryMuscles: ["triceps", "shoulders"],
    steps: {
      es: ["Túmbate sobre un banco con los pies apoyados en el suelo y la espalda presionada contra el banco.", "Agarra la barra con un agarre pronado un poco más ancho que la separación de los hombros.", "Levanta la barra del soporte y sostenla directamente sobre el pecho con los brazos completamente extendidos.", "Baja la barra lentamente hacia el pecho, manteniendo los codos pegados al cuerpo.", "Haz una pausa breve cuando la barra toque el pecho.", "Empuja la barra de vuelta a la posición inicial extendiendo los brazos.", "Repite el número de repeticiones deseado."],
      en: ["Lie flat on a bench with your feet flat on the ground and your back pressed against the bench.", "Grasp the barbell with an overhand grip slightly wider than shoulder-width apart.", "Lift the barbell off the rack and hold it directly above your chest with your arms fully extended.", "Lower the barbell slowly towards your chest, keeping your elbows tucked in.", "Pause for a moment when the barbell touches your chest.", "Push the barbell back up to the starting position by extending your arms.", "Repeat for the desired number of repetitions."],
    },
  },
  bench_var: {
    datasetId: '0025',
    datasetName: "barbell bench press",
    target: "pectorals",
    equipment: "barbell",
    secondaryMuscles: ["triceps", "shoulders"],
    steps: {
      es: ["Túmbate sobre un banco con los pies apoyados en el suelo y la espalda presionada contra el banco.", "Agarra la barra con un agarre pronado un poco más ancho que la separación de los hombros.", "Levanta la barra del soporte y sostenla directamente sobre el pecho con los brazos completamente extendidos.", "Baja la barra lentamente hacia el pecho, manteniendo los codos pegados al cuerpo.", "Haz una pausa breve cuando la barra toque el pecho.", "Empuja la barra de vuelta a la posición inicial extendiendo los brazos.", "Repite el número de repeticiones deseado."],
      en: ["Lie flat on a bench with your feet flat on the ground and your back pressed against the bench.", "Grasp the barbell with an overhand grip slightly wider than shoulder-width apart.", "Lift the barbell off the rack and hold it directly above your chest with your arms fully extended.", "Lower the barbell slowly towards your chest, keeping your elbows tucked in.", "Pause for a moment when the barbell touches your chest.", "Push the barbell back up to the starting position by extending your arms.", "Repeat for the desired number of repetitions."],
    },
  },
  cable_crunch: {
    datasetId: '0175',
    datasetName: "cable kneeling crunch",
    target: "abs",
    equipment: "cable",
    secondaryMuscles: ["obliques"],
    steps: {
      es: ["Sujeta una agarradera de cuerda a una polea alta y ponte de rodillas de espaldas a la máquina.", "Sujeta la agarradera de cuerda con ambas manos y colócala detrás de la cabeza, manteniendo los codos hacia afuera a los lados.", "Manteniendo las caderas inmóviles, flexiona la cintura y encoge el torso hacia los muslos.", "Haz una pausa por un momento en la parte inferior, luego regresa lentamente a la posición inicial.", "Repite el número de repeticiones deseado."],
      en: ["Attach a rope handle to a high pulley and kneel down facing away from the machine.", "Hold the rope handle with both hands and place it behind your head, keeping your elbows out to the sides.", "Keeping your hips stationary, flex your waist and crunch your torso down towards your thighs.", "Pause for a moment at the bottom, then slowly return to the starting position.", "Repeat for the desired number of repetitions."],
    },
  },
  cable_pull_through: {
    datasetId: '0196',
    datasetName: "cable pull through (with rope)",
    target: "glutes",
    equipment: "cable",
    secondaryMuscles: ["hamstrings", "lower back"],
    steps: {
      es: ["Ponte de pie de espaldas a la máquina de cable con los pies separados a la altura de los hombros.", "Agarra el accesorio de cuerda con ambas manos y da un paso hacia adelante, creando tensión en el cable.", "Flexiona las caderas y baja la parte superior del cuerpo hasta que quede paralela al suelo, manteniendo la espalda recta.", "Activa los glúteos y los isquiotibiales para llevar el cuerpo de vuelta hacia arriba, a la posición inicial.", "Repite el número de repeticiones deseado."],
      en: ["Stand facing away from the cable machine with your feet shoulder-width apart.", "Grab the rope attachment with both hands and step forward, creating tension in the cable.", "Bend at the hips and lower your upper body until it is parallel to the ground, keeping your back straight.", "Engage your glutes and hamstrings to pull your body back up to the starting position.", "Repeat for the desired number of repetitions."],
    },
  },
  core_carry: {
    datasetId: '2133',
    datasetName: "farmers walk",
    target: "quads",
    equipment: "dumbbell",
    secondaryMuscles: ["calves", "forearms", "core"],
    steps: {
      es: ["Ponte de pie con una mancuerna en cada mano, palmas hacia los costados.", "Mantén la espalda recta y los hombros hacia atrás.", "Da pasos pequeños y controlados hacia adelante, manteniendo una postura erguida.", "Continúa caminando durante la distancia o el tiempo deseado.", "Para terminar, deja de caminar y baja con cuidado las mancuernas a los costados."],
      en: ["Stand up straight with a dumbbell in each hand, palms facing your sides.", "Keep your back straight and your shoulders back.", "Take small, controlled steps forward, maintaining an upright posture.", "Continue walking for the desired distance or time.", "To finish, stop walking and carefully lower the dumbbells to your sides."],
    },
  },
  db_shoulder_press: {
    datasetId: '0405',
    datasetName: "dumbbell seated shoulder press",
    target: "delts",
    equipment: "dumbbell",
    secondaryMuscles: ["triceps", "upper back"],
    steps: {
      es: ["Siéntate en un banco con una mancuerna en cada mano, apoyadas en los muslos.", "Sube las mancuernas hasta la altura de los hombros, con las palmas hacia adelante.", "Presiona las mancuernas hacia arriba hasta que los brazos queden completamente extendidos por encima de la cabeza.", "Haz una pausa por un momento en la parte superior, luego baja lentamente las mancuernas de vuelta a la altura de los hombros.", "Repite el número de repeticiones deseado."],
      en: ["Sit on a bench with a dumbbell in each hand, resting on your thighs.", "Raise the dumbbells to shoulder height, palms facing forward.", "Press the dumbbells upward until your arms are fully extended overhead.", "Pause for a moment at the top, then slowly lower the dumbbells back to shoulder height.", "Repeat for the desired number of repetitions."],
    },
  },
  dead_bug: {
    datasetId: '0276',
    datasetName: "dead bug",
    target: "abs",
    equipment: "body weight",
    secondaryMuscles: ["hip flexors", "lower back"],
    steps: {
      es: ["Túmbate boca arriba con los brazos extendidos hacia el techo.", "Flexiona las rodillas y levanta las piernas del suelo, formando un ángulo de 90 grados en las caderas y las rodillas.", "Activa el core y la zona lumbar para presionar la zona lumbar contra el suelo.", "Baja lentamente el brazo derecho y la pierna izquierda hacia el suelo, manteniéndolos rectos y justo por encima del suelo.", "Haz una pausa breve y luego vuelve a la posición inicial.", "Repite el movimiento con el brazo izquierdo y la pierna derecha.", "Continúa alternando lados durante el número de repeticiones deseado."],
      en: ["Lie flat on your back with your arms extended towards the ceiling.", "Bend your knees and lift your legs off the ground, creating a 90-degree angle at your hips and knees.", "Engage your core and lower back to press your lower back into the ground.", "Slowly lower your right arm and left leg towards the ground, keeping them straight and hovering just above the floor.", "Pause for a moment, then return to the starting position.", "Repeat the movement with your left arm and right leg.", "Continue alternating sides for the desired number of repetitions."],
    },
  },
  dips_w: {
    datasetId: '0251',
    datasetName: "chest dip",
    target: "pectorals",
    equipment: "body weight",
    secondaryMuscles: ["triceps", "shoulders"],
    steps: {
      es: ["Colócate en las barras paralelas con los brazos completamente extendidos y el cuerpo recto.", "Baja el cuerpo flexionando los codos hasta que los hombros queden por debajo de los codos.", "Empújate de vuelta hacia arriba a la posición inicial extendiendo los brazos.", "Repite el número de repeticiones deseado."],
      en: ["Position yourself on parallel bars with your arms fully extended and your body straight.", "Lower your body by bending your elbows until your shoulders are below your elbows.", "Push yourself back up to the starting position by straightening your arms.", "Repeat for the desired number of repetitions."],
    },
  },
  front_sq: {
    datasetId: '0042',
    datasetName: "barbell front squat",
    target: "glutes",
    equipment: "barbell",
    secondaryMuscles: ["quadriceps", "hamstrings", "calves", "core"],
    steps: {
      es: ["Empieza de pie con los pies separados a la altura de los hombros, con los dedos de los pies ligeramente hacia afuera.", "Sujeta la barra frente a los hombros, apoyándola sobre la clavícula y los hombros.", "Activa el core y mantén el pecho elevado mientras bajas el cuerpo hacia una posición de sentadilla, empujando las caderas hacia atrás y flexionando las rodillas.", "Baja hasta que los muslos queden paralelos al suelo, o tan abajo como puedas hacerlo cómodamente.", "Haz una pausa por un momento en la parte inferior, luego empuja con los talones para regresar a la posición inicial.", "Repite el número de repeticiones deseado."],
      en: ["Start by standing with your feet shoulder-width apart, toes slightly turned out.", "Hold the barbell in front of your shoulders, resting it on your collarbone and shoulders.", "Engage your core and keep your chest up as you lower your body down into a squat position, pushing your hips back and bending your knees.", "Lower until your thighs are parallel to the ground, or as low as you can comfortably go.", "Pause for a moment at the bottom, then push through your heels to return to the starting position.", "Repeat for the desired number of repetitions."],
    },
  },
  front_sq_light: {
    datasetId: '0042',
    datasetName: "barbell front squat",
    target: "glutes",
    equipment: "barbell",
    secondaryMuscles: ["quadriceps", "hamstrings", "calves", "core"],
    steps: {
      es: ["Empieza de pie con los pies separados a la altura de los hombros, con los dedos de los pies ligeramente hacia afuera.", "Sujeta la barra frente a los hombros, apoyándola sobre la clavícula y los hombros.", "Activa el core y mantén el pecho elevado mientras bajas el cuerpo hacia una posición de sentadilla, empujando las caderas hacia atrás y flexionando las rodillas.", "Baja hasta que los muslos queden paralelos al suelo, o tan abajo como puedas hacerlo cómodamente.", "Haz una pausa por un momento en la parte inferior, luego empuja con los talones para regresar a la posición inicial.", "Repite el número de repeticiones deseado."],
      en: ["Start by standing with your feet shoulder-width apart, toes slightly turned out.", "Hold the barbell in front of your shoulders, resting it on your collarbone and shoulders.", "Engage your core and keep your chest up as you lower your body down into a squat position, pushing your hips back and bending your knees.", "Lower until your thighs are parallel to the ground, or as low as you can comfortably go.", "Pause for a moment at the bottom, then push through your heels to return to the starting position.", "Repeat for the desired number of repetitions."],
    },
  },
  glute_bridge: {
    datasetId: '3013',
    datasetName: "low glute bridge on floor",
    target: "glutes",
    equipment: "body weight",
    secondaryMuscles: ["hamstrings", "core"],
    steps: {
      es: ["Túmbate sobre tu espalda con las rodillas flexionadas y los pies apoyados en el suelo.", "Coloca los brazos a los lados del cuerpo, con las palmas hacia abajo.", "Activa los glúteos y el core, y luego eleva las caderas del suelo hasta que tu cuerpo forme una línea recta desde las rodillas hasta los hombros.", "Haz una pausa breve en la parte alta, apretando los glúteos.", "Baja lentamente las caderas de vuelta a la posición inicial.", "Repite el número de repeticiones deseado."],
      en: ["Lie flat on your back with your knees bent and feet flat on the ground.", "Place your arms by your sides, palms facing down.", "Engage your glutes and core, then lift your hips off the ground until your body forms a straight line from your knees to your shoulders.", "Pause for a moment at the top, squeezing your glutes.", "Slowly lower your hips back down to the starting position.", "Repeat for the desired number of repetitions."],
    },
  },
  good_morning: {
    datasetId: '0044',
    datasetName: "barbell good morning",
    target: "hamstrings",
    equipment: "barbell",
    secondaryMuscles: ["lower back"],
    steps: {
      es: ["Empieza de pie con los pies separados a la altura de los hombros y la barra apoyada sobre la parte superior de la espalda.", "Manteniendo la espalda recta y el core activado, flexiona las caderas hacia delante, empujando los glúteos hacia atrás como si intentaras tocar la pared detrás de ti con ellos.", "Baja el torso hasta que quede paralelo al suelo, sintiendo un estiramiento en los isquiotibiales.", "Haz una pausa breve y luego vuelve a la posición inicial apretando los glúteos y empujando las caderas hacia delante.", "Repite el número de repeticiones deseado."],
      en: ["Start by standing with your feet shoulder-width apart and the barbell resting on your upper back.", "Keeping your back straight and your core engaged, hinge forward at the hips, pushing your buttocks back as if you were trying to touch the wall behind you with your glutes.", "Lower your torso until it is parallel to the ground, feeling a stretch in your hamstrings.", "Pause for a moment, then return to the starting position by squeezing your glutes and pushing your hips forward.", "Repeat for the desired number of repetitions."],
    },
  },
  greek_archer_pullups: {
    datasetId: '3293',
    datasetName: "archer pull up",
    target: "lats",
    equipment: "body weight",
    secondaryMuscles: ["biceps", "forearms"],
    steps: {
      es: ["Comienza colgándote de una barra de dominadas con un agarre prono, un poco más separado que el ancho de los hombros.", "Activa el core y lleva los omóplatos hacia abajo y atrás.", "Mientras te elevas, flexiona un brazo y lleva el codo hacia el costado, manteniendo el otro brazo recto.", "Continúa subiendo hasta que la barbilla quede por encima de la barra y el brazo flexionado esté completamente doblado.", "Bájate de nuevo con control, estirando el brazo flexionado y repitiendo el movimiento del otro lado.", "Alterna los lados en cada repetición."],
      en: ["Start by hanging from a pull-up bar with an overhand grip, slightly wider than shoulder-width apart.", "Engage your core and pull your shoulder blades down and back.", "As you pull yourself up, bend one arm and bring your elbow towards your side, while keeping the other arm straight.", "Continue pulling until your chin is above the bar and your bent arm is fully flexed.", "Lower yourself back down with control, straightening the bent arm and repeating the movement on the other side.", "Alternate sides with each repetition."],
    },
  },
  greek_archer_pushups: {
    datasetId: '3294',
    datasetName: "archer push up",
    target: "pectorals",
    equipment: "body weight",
    secondaryMuscles: ["triceps", "shoulders", "core"],
    steps: {
      es: ["Comienza en posición de flexión de brazos con las manos un poco más separadas que el ancho de los hombros.", "Extiende un brazo hacia el lado, paralelo al suelo.", "Baja el cuerpo flexionando los codos, manteniendo la espalda recta y el core activado.", "Empuja hacia arriba para volver a la posición inicial.", "Repite del otro lado, extendiendo el brazo opuesto hacia el lado.", "Continúa alternando lados durante el número de repeticiones deseado."],
      en: ["Start in a push-up position with your hands slightly wider than shoulder-width apart.", "Extend one arm straight out to the side, parallel to the ground.", "Lower your body by bending your elbows, keeping your back straight and core engaged.", "Push back up to the starting position.", "Repeat on the other side, extending the opposite arm out to the side.", "Continue alternating sides for the desired number of repetitions."],
    },
  },
  greek_australian_rows: {
    datasetId: '0499',
    datasetName: "inverted row",
    target: "upper back",
    equipment: "body weight",
    secondaryMuscles: ["biceps", "forearms"],
    steps: {
      es: ["Coloca una barra a la altura de la cintura o usa un entrenador de suspensión.", "Ponte de pie frente a la barra o al entrenador de suspensión, con los pies separados a la altura de los hombros.", "Agarra la barra o las asas con agarre prono, ligeramente más ancho que la altura de los hombros.", "Inclínate hacia atrás, manteniendo el cuerpo recto y los talones en el suelo.", "Tira del pecho hacia la barra o las asas, apretando los omóplatos entre sí.", "Haz una pausa breve en la parte más alta, luego baja lentamente de vuelta a la posición inicial.", "Repite el número de repeticiones deseado."],
      en: ["Set up a bar at waist height or use a suspension trainer.", "Stand facing the bar or suspension trainer, with your feet shoulder-width apart.", "Grab the bar or handles with an overhand grip, slightly wider than shoulder-width apart.", "Lean back, keeping your body straight and your heels on the ground.", "Pull your chest towards the bar or handles, squeezing your shoulder blades together.", "Pause for a moment at the top, then slowly lower yourself back to the starting position.", "Repeat for the desired number of repetitions."],
    },
  },
  greek_calf_raises: {
    datasetId: '1373',
    datasetName: "bodyweight standing calf raise",
    target: "calves",
    equipment: "body weight",
    secondaryMuscles: ["ankles", "feet"],
    steps: {
      es: ["Ponte de pie con los pies separados a la altura de los hombros, con las puntas de los pies apuntando hacia adelante.", "Coloca las manos sobre una pared o superficie estable para mantener el equilibrio.", "Levanta lentamente los talones del suelo, llevando el peso del cuerpo hacia las puntas de los pies.", "Haz una pausa breve en la parte alta y luego baja lentamente los talones de vuelta a la posición inicial.", "Repite el número de repeticiones deseado."],
      en: ["Stand with your feet shoulder-width apart, toes pointing forward.", "Place your hands on a wall or stable surface for balance.", "Slowly raise your heels off the ground, lifting your body weight onto the balls of your feet.", "Pause for a moment at the top, then slowly lower your heels back down to the starting position.", "Repeat for the desired number of repetitions."],
    },
  },
  greek_chinups: {
    datasetId: '1326',
    datasetName: "chin-up",
    target: "lats",
    equipment: "body weight",
    secondaryMuscles: ["biceps", "forearms"],
    steps: {
      es: ["Cuélgate de una barra de dominadas con las palmas mirando hacia ti y las manos separadas a la altura de los hombros.", "Activa el core y tira de tu cuerpo hacia arriba, hacia la barra, guiando con el pecho.", "Continúa subiendo hasta que la barbilla quede por encima de la barra.", "Haz una pausa por un momento en la parte superior, luego baja lentamente el cuerpo de vuelta a la posición inicial.", "Repite el número de repeticiones deseado."],
      en: ["Hang from a pull-up bar with your palms facing towards you and your hands shoulder-width apart.", "Engage your core and pull your body up towards the bar, leading with your chest.", "Continue pulling until your chin is above the bar.", "Pause for a moment at the top, then slowly lower your body back down to the starting position.", "Repeat for the desired number of repetitions."],
    },
  },
  greek_lateral_raises_a: {
    datasetId: '0334',
    datasetName: "dumbbell lateral raise",
    target: "delts",
    equipment: "dumbbell",
    secondaryMuscles: ["traps"],
    steps: {
      es: ["Ponte de pie con los pies separados a la altura de los hombros y sostén una mancuerna en cada mano, con las palmas hacia el cuerpo.", "Mantén la espalda recta y activa el core.", "Levanta los brazos hacia los lados hasta que queden paralelos al suelo, manteniendo una ligera flexión en los codos.", "Haz una pausa por un momento en la parte superior, luego baja lentamente los brazos de vuelta a la posición inicial.", "Repite el número de repeticiones deseado."],
      en: ["Stand with your feet shoulder-width apart and hold a dumbbell in each hand, palms facing your body.", "Keep your back straight and engage your core.", "Raise your arms out to the sides until they are parallel to the floor, keeping a slight bend in your elbows.", "Pause for a moment at the top, then slowly lower your arms back down to the starting position.", "Repeat for the desired number of repetitions."],
    },
  },
  greek_lateral_raises_b: {
    datasetId: '0355',
    datasetName: "dumbbell one arm lateral raise",
    target: "delts",
    equipment: "dumbbell",
    secondaryMuscles: ["trapezius", "triceps"],
    steps: {
      es: ["Ponte de pie con los pies separados a la altura de los hombros, sosteniendo una mancuerna en una mano con la palma hacia el cuerpo.", "Mantén la espalda recta y el core activado durante todo el ejercicio.", "Levanta la mancuerna hacia el lado, manteniendo el brazo recto y la palma hacia abajo.", "Continúa levantando hasta que el brazo quede paralelo al suelo.", "Haz una pausa breve en la parte más alta, luego baja lentamente la mancuerna de vuelta a la posición inicial.", "Repite el número de repeticiones deseado, luego cambia al otro brazo."],
      en: ["Stand with your feet shoulder-width apart, holding a dumbbell in one hand with your palm facing your body.", "Keep your back straight and your core engaged throughout the exercise.", "Raise the dumbbell to the side, keeping your arm straight and your palm facing down.", "Continue lifting until your arm is parallel to the ground.", "Pause for a moment at the top, then slowly lower the dumbbell back to the starting position.", "Repeat for the desired number of repetitions, then switch to the other arm."],
    },
  },
  greek_lateral_raises_c: {
    datasetId: '0334',
    datasetName: "dumbbell lateral raise",
    target: "delts",
    equipment: "dumbbell",
    secondaryMuscles: ["traps"],
    steps: {
      es: ["Ponte de pie con los pies separados a la altura de los hombros y sostén una mancuerna en cada mano, con las palmas hacia el cuerpo.", "Mantén la espalda recta y activa el core.", "Levanta los brazos hacia los lados hasta que queden paralelos al suelo, manteniendo una ligera flexión en los codos.", "Haz una pausa por un momento en la parte superior, luego baja lentamente los brazos de vuelta a la posición inicial.", "Repite el número de repeticiones deseado."],
      en: ["Stand with your feet shoulder-width apart and hold a dumbbell in each hand, palms facing your body.", "Keep your back straight and engage your core.", "Raise your arms out to the sides until they are parallel to the floor, keeping a slight bend in your elbows.", "Pause for a moment at the top, then slowly lower your arms back down to the starting position.", "Repeat for the desired number of repetitions."],
    },
  },
  greek_pike_pushups: {
    datasetId: '0471',
    datasetName: "handstand push-up",
    target: "triceps",
    equipment: "body weight",
    secondaryMuscles: ["shoulders", "chest", "core"],
    steps: {
      es: ["Busca una pared y colócate de espaldas a ella, de pie a unos pasos de distancia.", "Coloca las manos en el suelo separadas a la altura de los hombros y lanza los pies hacia la pared, llegando a una posición de pino.", "Dobla los codos y baja la cabeza hacia el suelo, manteniendo el cuerpo en línea recta.", "Empuja con las manos y extiende los brazos para volver a la posición inicial.", "Repite el número de repeticiones deseado."],
      en: ["Find a wall and face away from it, standing a few feet away.", "Place your hands on the ground shoulder-width apart and kick your feet up against the wall, coming into a handstand position.", "Bend your elbows and lower your head towards the ground, keeping your body in a straight line.", "Push through your hands and extend your arms to return to the starting position.", "Repeat for the desired number of repetitions."],
    },
  },
  greek_weighted_dips: {
    datasetId: '1767',
    datasetName: "weighted triceps dip on high parallel bars",
    target: "triceps",
    equipment: "weighted",
    secondaryMuscles: ["chest", "shoulders"],
    steps: {
      es: ["Colócate entre dos barras paralelas con las manos agarrando las barras y los brazos completamente extendidos.", "Flexiona los codos y baja el cuerpo hasta que la parte superior de los brazos quede paralela al suelo.", "Haz una pausa de un momento, luego empuja con las palmas para estirar los brazos y volver a la posición inicial.", "Repite el número de repeticiones deseado."],
      en: ["Position yourself between two parallel bars with your hands gripping the bars and your arms fully extended.", "Bend your elbows and lower your body until your upper arms are parallel to the ground.", "Pause for a moment, then push through your palms to straighten your arms and return to the starting position.", "Repeat for the desired number of repetitions."],
    },
  },
  greek_weighted_pullups: {
    datasetId: '0841',
    datasetName: "weighted pull-up",
    target: "lats",
    equipment: "weighted",
    secondaryMuscles: ["biceps", "forearms"],
    steps: {
      es: ["Sujeta la barra de dominadas con un agarre prono, un poco más ancho que la altura de los hombros.", "Cuélgate de la barra con los brazos completamente extendidos y el cuerpo recto.", "Activa los músculos de la espalda y tira de tu cuerpo hacia arriba, hacia la barra, manteniendo los codos cerca del cuerpo.", "Continúa subiendo hasta que la barbilla quede por encima de la barra.", "Haz una pausa por un momento en la parte superior, luego baja lentamente el cuerpo de vuelta a la posición inicial.", "Repite el número de repeticiones deseado."],
      en: ["Grab the pull-up bar with an overhand grip, slightly wider than shoulder-width apart.", "Hang from the bar with your arms fully extended and your body straight.", "Engage your back muscles and pull your body up towards the bar, keeping your elbows close to your body.", "Continue pulling until your chin is above the bar.", "Pause for a moment at the top, then slowly lower your body back down to the starting position.", "Repeat for the desired number of repetitions."],
    },
  },
  greek_x_incline_db: {
    datasetId: '0314',
    datasetName: "dumbbell incline bench press",
    target: "pectorals",
    equipment: "dumbbell",
    secondaryMuscles: ["shoulders", "triceps"],
    steps: {
      es: ["Coloca un banco inclinado a un ángulo de 45 grados.", "Siéntate en el banco con los pies apoyados en el suelo y la espalda firmemente apoyada contra el banco.", "Sostén una mancuerna en cada mano, con las palmas hacia adelante, y levántalas hasta la altura de los hombros.", "Baja lentamente las mancuernas hacia los lados del pecho, manteniendo los codos en un ángulo de 90 grados.", "Empuja las mancuernas de nuevo hacia arriba hasta la posición inicial, extendiendo completamente los brazos.", "Repite el número de repeticiones deseado."],
      en: ["Set up an incline bench at a 45-degree angle.", "Sit on the bench with your feet flat on the ground and your back pressed firmly against the bench.", "Hold a dumbbell in each hand, palms facing forward, and lift them to shoulder height.", "Slowly lower the dumbbells to the sides of your chest, keeping your elbows at a 90-degree angle.", "Push the dumbbells back up to the starting position, fully extending your arms.", "Repeat for the desired number of repetitions."],
    },
  },
  greek_x_lateral: {
    datasetId: '0178',
    datasetName: "cable lateral raise",
    target: "delts",
    equipment: "cable",
    secondaryMuscles: ["traps", "triceps"],
    steps: {
      es: ["Ponte de pie con los pies separados a la altura de los hombros y sujeta las agarraderas del cable con un agarre prono.", "Mantén los brazos rectos y el core activado.", "Levanta los brazos hacia los lados hasta que queden paralelos al suelo.", "Haz una pausa por un momento en la parte superior, luego baja lentamente los brazos de vuelta a la posición inicial.", "Repite el número de repeticiones deseado."],
      en: ["Stand with your feet shoulder-width apart and grasp the cable handles with an overhand grip.", "Keep your arms straight and your core engaged.", "Raise your arms out to the sides until they are parallel to the floor.", "Pause for a moment at the top, then slowly lower your arms back down to the starting position.", "Repeat for the desired number of repetitions."],
    },
  },
  greek_x_pulldown: {
    datasetId: '2330',
    datasetName: "cable lat pulldown full range of motion",
    target: "lats",
    equipment: "cable",
    secondaryMuscles: ["biceps", "rhomboids", "rear deltoids"],
    steps: {
      es: ["Siéntate en la máquina de jalón al pecho con las rodillas colocadas debajo de las almohadillas.", "Sujeta la barra del cable con un agarre prono, un poco más separado que el ancho de los hombros.", "Inclínate ligeramente hacia atrás y mantén el pecho elevado, conservando un ligero arco en la zona lumbar.", "Jala la barra hacia la parte superior del pecho, apretando los omóplatos entre sí.", "Haz una pausa por un momento en la parte baja del movimiento y luego suelta lentamente la barra de vuelta a la posición inicial.", "Repite el número de repeticiones deseado."],
      en: ["Sit on the lat pulldown machine with your knees positioned under the pads.", "Grasp the cable bar with an overhand grip, slightly wider than shoulder-width apart.", "Lean back slightly and keep your chest up, maintaining a slight arch in your lower back.", "Pull the bar down towards your upper chest, squeezing your shoulder blades together.", "Pause for a moment at the bottom of the movement, then slowly release the bar back to the starting position.", "Repeat for the desired number of repetitions."],
    },
  },
  greek_x_row: {
    datasetId: '0180',
    datasetName: "cable low seated row",
    target: "upper back",
    equipment: "cable",
    secondaryMuscles: ["biceps", "forearms"],
    steps: {
      es: ["Siéntate en la máquina con los pies planos sobre los apoyapiés y las rodillas ligeramente flexionadas.", "Sujeta las agarraderas con un agarre prono, con las palmas hacia abajo.", "Mantén la espalda recta e inclínate ligeramente hacia adelante, manteniendo una ligera flexión en los codos.", "Jala las agarraderas hacia el cuerpo, apretando los omóplatos entre sí.", "Haz una pausa por un momento en el punto máximo del movimiento, luego suelta lentamente las agarraderas de vuelta a la posición inicial.", "Repite el número de repeticiones deseado."],
      en: ["Sit on the machine with your feet flat on the footrests and your knees slightly bent.", "Grasp the handles with an overhand grip, palms facing down.", "Keep your back straight and lean slightly forward, maintaining a slight bend in your elbows.", "Pull the handles towards your body, squeezing your shoulder blades together.", "Pause for a moment at the peak of the movement, then slowly release the handles back to the starting position.", "Repeat for the desired number of repetitions."],
    },
  },
  greek_xh_db_row: {
    datasetId: '0293',
    datasetName: "dumbbell bent over row",
    target: "upper back",
    equipment: "dumbbell",
    secondaryMuscles: ["biceps", "forearms"],
    steps: {
      es: ["Ponte de pie con los pies separados a la altura de los hombros, las rodillas ligeramente flexionadas, y sujeta una mancuerna en cada mano con las palmas hacia tu cuerpo.", "Inclínate hacia adelante desde las caderas, manteniendo la espalda recta y el core activado.", "Deja que los brazos cuelguen rectos hacia el suelo, con los codos ligeramente flexionados.", "Tira de las mancuernas hacia arriba, hacia el pecho, apretando los omóplatos entre sí.", "Haz una pausa breve en la parte alta, luego baja lentamente las mancuernas de vuelta a la posición inicial.", "Repite el número de repeticiones deseado."],
      en: ["Stand with your feet shoulder-width apart, knees slightly bent, and hold a dumbbell in each hand with your palms facing your body.", "Bend forward at the hips, keeping your back straight and your core engaged.", "Let your arms hang straight down towards the floor, with your elbows slightly bent.", "Pull the dumbbells up towards your chest, squeezing your shoulder blades together.", "Pause for a moment at the top, then slowly lower the dumbbells back down to the starting position.", "Repeat for the desired number of repetitions."],
    },
  },
  greek_xh_lateral: {
    datasetId: '0334',
    datasetName: "dumbbell lateral raise",
    target: "delts",
    equipment: "dumbbell",
    secondaryMuscles: ["traps"],
    steps: {
      es: ["Ponte de pie con los pies separados a la altura de los hombros y sostén una mancuerna en cada mano, con las palmas hacia el cuerpo.", "Mantén la espalda recta y activa el core.", "Levanta los brazos hacia los lados hasta que queden paralelos al suelo, manteniendo una ligera flexión en los codos.", "Haz una pausa por un momento en la parte superior, luego baja lentamente los brazos de vuelta a la posición inicial.", "Repite el número de repeticiones deseado."],
      en: ["Stand with your feet shoulder-width apart and hold a dumbbell in each hand, palms facing your body.", "Keep your back straight and engage your core.", "Raise your arms out to the sides until they are parallel to the floor, keeping a slight bend in your elbows.", "Pause for a moment at the top, then slowly lower your arms back down to the starting position.", "Repeat for the desired number of repetitions."],
    },
  },
  greek_xh_ohp: {
    datasetId: '0426',
    datasetName: "dumbbell standing overhead press",
    target: "delts",
    equipment: "dumbbell",
    secondaryMuscles: ["triceps", "upper back"],
    steps: {
      es: ["Ponte de pie con los pies separados a la altura de los hombros, sujetando una mancuerna en cada mano a la altura de los hombros, con las palmas hacia adelante.", "Presiona las mancuernas hacia arriba hasta que los brazos queden completamente extendidos por encima de la cabeza.", "Haz una pausa por un momento en la parte superior, luego baja lentamente las mancuernas de vuelta a la altura de los hombros.", "Repite el número de repeticiones deseado."],
      en: ["Stand with your feet shoulder-width apart, holding a dumbbell in each hand at shoulder level with your palms facing forward.", "Press the dumbbells upward until your arms are fully extended overhead.", "Pause for a moment at the top, then slowly lower the dumbbells back down to shoulder level.", "Repeat for the desired number of repetitions."],
    },
  },
  hanging_leg_raise: {
    datasetId: '0472',
    datasetName: "hanging leg raise",
    target: "abs",
    equipment: "body weight",
    secondaryMuscles: ["hip flexors"],
    steps: {
      es: ["Cuélgate de una barra de dominadas con los brazos completamente extendidos y las palmas mirando hacia afuera.", "Activa el core y levanta las piernas frente a ti, manteniéndolas rectas.", "Continúa levantando hasta que las piernas estén paralelas al suelo o tan alto como puedas llegar cómodamente.", "Haz una pausa por un momento en la parte superior, luego baja lentamente las piernas de vuelta a la posición inicial.", "Repite el número de repeticiones deseado."],
      en: ["Hang from a pull-up bar with your arms fully extended and your palms facing away from you.", "Engage your core and lift your legs up in front of you, keeping them straight.", "Continue lifting until your legs are parallel to the ground or as high as you can comfortably go.", "Pause for a moment at the top, then slowly lower your legs back down to the starting position.", "Repeat for the desired number of repetitions."],
    },
  },
  hanging_leg_raise_2: {
    datasetId: '0472',
    datasetName: "hanging leg raise",
    target: "abs",
    equipment: "body weight",
    secondaryMuscles: ["hip flexors"],
    steps: {
      es: ["Cuélgate de una barra de dominadas con los brazos completamente extendidos y las palmas mirando hacia afuera.", "Activa el core y levanta las piernas frente a ti, manteniéndolas rectas.", "Continúa levantando hasta que las piernas estén paralelas al suelo o tan alto como puedas llegar cómodamente.", "Haz una pausa por un momento en la parte superior, luego baja lentamente las piernas de vuelta a la posición inicial.", "Repite el número de repeticiones deseado."],
      en: ["Hang from a pull-up bar with your arms fully extended and your palms facing away from you.", "Engage your core and lift your legs up in front of you, keeping them straight.", "Continue lifting until your legs are parallel to the ground or as high as you can comfortably go.", "Pause for a moment at the top, then slowly lower your legs back down to the starting position.", "Repeat for the desired number of repetitions."],
    },
  },
  hip_abduction: {
    datasetId: '0597',
    datasetName: "lever seated hip abduction",
    target: "abductors",
    equipment: "leverage machine",
    secondaryMuscles: ["glutes", "hamstrings"],
    steps: {
      es: ["Ajusta la altura del asiento de modo que tus rodillas formen un ángulo de 90 grados.", "Siéntate en la máquina con la espalda apoyada en el respaldo y los pies sobre los apoyapiés.", "Coloca las manos en las asas laterales para mayor estabilidad.", "Activa los abductores y empuja lentamente las piernas hacia afuera, alejándolas de la línea media del cuerpo.", "Haz una pausa al final del movimiento y luego junta lentamente las piernas de nuevo hasta la posición inicial.", "Repite el número de repeticiones deseado."],
      en: ["Adjust the seat height so that your knees are at a 90-degree angle.", "Sit on the machine with your back against the backrest and your feet on the footrests.", "Place your hands on the side handles for stability.", "Engage your abductors and slowly push your legs apart, away from the midline of your body.", "Pause for a moment at the end of the movement, then slowly bring your legs back together to the starting position.", "Repeat for the desired number of repetitions."],
    },
  },
  inc_press: {
    datasetId: '0047',
    datasetName: "barbell incline bench press",
    target: "pectorals",
    equipment: "barbell",
    secondaryMuscles: ["shoulders", "triceps"],
    steps: {
      es: ["Coloca un banco inclinado a un ángulo de 45 grados.", "Túmbate en el banco con los pies planos sobre el suelo.", "Agarra la barra con un agarre pronado un poco más ancho que la separación de los hombros.", "Saca la barra del soporte y bájala lentamente hacia el pecho, manteniendo los codos a un ángulo de 45 grados.", "Haz una pausa breve en la parte baja y luego empuja la barra de vuelta a la posición inicial.", "Repite el número de repeticiones deseado."],
      en: ["Set up an incline bench at a 45-degree angle.", "Lie down on the bench with your feet flat on the ground.", "Grasp the barbell with an overhand grip, slightly wider than shoulder-width apart.", "Unrack the barbell and lower it slowly towards your chest, keeping your elbows at a 45-degree angle.", "Pause for a moment at the bottom, then push the barbell back up to the starting position.", "Repeat for the desired number of repetitions."],
    },
  },
  incline_fb: {
    datasetId: '0047',
    datasetName: "barbell incline bench press",
    target: "pectorals",
    equipment: "barbell",
    secondaryMuscles: ["shoulders", "triceps"],
    steps: {
      es: ["Coloca un banco inclinado a un ángulo de 45 grados.", "Túmbate en el banco con los pies planos sobre el suelo.", "Agarra la barra con un agarre pronado un poco más ancho que la separación de los hombros.", "Saca la barra del soporte y bájala lentamente hacia el pecho, manteniendo los codos a un ángulo de 45 grados.", "Haz una pausa breve en la parte baja y luego empuja la barra de vuelta a la posición inicial.", "Repite el número de repeticiones deseado."],
      en: ["Set up an incline bench at a 45-degree angle.", "Lie down on the bench with your feet flat on the ground.", "Grasp the barbell with an overhand grip, slightly wider than shoulder-width apart.", "Unrack the barbell and lower it slowly towards your chest, keeping your elbows at a 45-degree angle.", "Pause for a moment at the bottom, then push the barbell back up to the starting position.", "Repeat for the desired number of repetitions."],
    },
  },
  lat_pulldown_fb: {
    datasetId: '2330',
    datasetName: "cable lat pulldown full range of motion",
    target: "lats",
    equipment: "cable",
    secondaryMuscles: ["biceps", "rhomboids", "rear deltoids"],
    steps: {
      es: ["Siéntate en la máquina de jalón al pecho con las rodillas colocadas debajo de las almohadillas.", "Sujeta la barra del cable con un agarre prono, un poco más separado que el ancho de los hombros.", "Inclínate ligeramente hacia atrás y mantén el pecho elevado, conservando un ligero arco en la zona lumbar.", "Jala la barra hacia la parte superior del pecho, apretando los omóplatos entre sí.", "Haz una pausa por un momento en la parte baja del movimiento y luego suelta lentamente la barra de vuelta a la posición inicial.", "Repite el número de repeticiones deseado."],
      en: ["Sit on the lat pulldown machine with your knees positioned under the pads.", "Grasp the cable bar with an overhand grip, slightly wider than shoulder-width apart.", "Lean back slightly and keep your chest up, maintaining a slight arch in your lower back.", "Pull the bar down towards your upper chest, squeezing your shoulder blades together.", "Pause for a moment at the bottom of the movement, then slowly release the bar back to the starting position.", "Repeat for the desired number of repetitions."],
    },
  },
  lateral_raise_fb: {
    datasetId: '0334',
    datasetName: "dumbbell lateral raise",
    target: "delts",
    equipment: "dumbbell",
    secondaryMuscles: ["traps"],
    steps: {
      es: ["Ponte de pie con los pies separados a la altura de los hombros y sostén una mancuerna en cada mano, con las palmas hacia el cuerpo.", "Mantén la espalda recta y activa el core.", "Levanta los brazos hacia los lados hasta que queden paralelos al suelo, manteniendo una ligera flexión en los codos.", "Haz una pausa por un momento en la parte superior, luego baja lentamente los brazos de vuelta a la posición inicial.", "Repite el número de repeticiones deseado."],
      en: ["Stand with your feet shoulder-width apart and hold a dumbbell in each hand, palms facing your body.", "Keep your back straight and engage your core.", "Raise your arms out to the sides until they are parallel to the floor, keeping a slight bend in your elbows.", "Pause for a moment at the top, then slowly lower your arms back down to the starting position.", "Repeat for the desired number of repetitions."],
    },
  },
  lateral_raises: {
    datasetId: '0334',
    datasetName: "dumbbell lateral raise",
    target: "delts",
    equipment: "dumbbell",
    secondaryMuscles: ["traps"],
    steps: {
      es: ["Ponte de pie con los pies separados a la altura de los hombros y sostén una mancuerna en cada mano, con las palmas hacia el cuerpo.", "Mantén la espalda recta y activa el core.", "Levanta los brazos hacia los lados hasta que queden paralelos al suelo, manteniendo una ligera flexión en los codos.", "Haz una pausa por un momento en la parte superior, luego baja lentamente los brazos de vuelta a la posición inicial.", "Repite el número de repeticiones deseado."],
      en: ["Stand with your feet shoulder-width apart and hold a dumbbell in each hand, palms facing your body.", "Keep your back straight and engage your core.", "Raise your arms out to the sides until they are parallel to the floor, keeping a slight bend in your elbows.", "Pause for a moment at the top, then slowly lower your arms back down to the starting position.", "Repeat for the desired number of repetitions."],
    },
  },
  leg_curl: {
    datasetId: '0586',
    datasetName: "lever lying leg curl",
    target: "hamstrings",
    equipment: "leverage machine",
    secondaryMuscles: ["calves"],
    steps: {
      es: ["Ajusta la máquina a tu cuerpo y selecciona el peso deseado.", "Túmbate boca abajo en la máquina con las piernas rectas y los talones contra la palanca acolchada.", "Sujeta las asas o los lados de la máquina para mayor estabilidad.", "Manteniendo la parte superior del cuerpo inmóvil, exhala y flexiona las piernas hacia arriba tanto como sea posible sin levantar las caderas de la almohadilla.", "Mantén la posición contraída durante una pausa breve mientras aprietas los isquiotibiales.", "Inhala y baja lentamente la palanca de vuelta a la posición inicial.", "Repite el número de repeticiones deseado."],
      en: ["Adjust the machine to fit your body and select the desired weight.", "Lie face down on the machine with your legs straight and your heels against the padded lever.", "Grasp the handles or the sides of the machine for stability.", "Keeping your upper body stationary, exhale and curl your legs up as far as possible without lifting your hips off the pad.", "Hold the contracted position for a brief pause as you squeeze your hamstrings.", "Inhale and slowly lower the lever back to the starting position.", "Repeat for the desired number of repetitions."],
    },
  },
  leg_press: {
    datasetId: '0739',
    datasetName: "sled 45в° leg press",
    target: "glutes",
    equipment: "sled machine",
    secondaryMuscles: ["quadriceps", "hamstrings", "calves"],
    steps: {
      es: ["Ajusta el asiento y la placa de la máquina de trineo a una posición cómoda.", "Siéntate en la máquina de trineo con la espalda contra el respaldo y los pies separados a la altura de los hombros sobre la placa.", "Sujeta las asas a los lados del asiento para mayor estabilidad.", "Empuja la placa alejándola de tu cuerpo extendiendo las piernas, manteniendo los talones sobre la placa.", "Continúa empujando hasta que las piernas estén casi completamente extendidas, pero sin bloquear las rodillas.", "Haz una pausa por un momento en la parte alta del movimiento, luego baja lentamente la placa de vuelta hacia tu cuerpo doblando las rodillas.", "Repite el número de repeticiones deseado."],
      en: ["Adjust the seat and footplate of the sled machine to a comfortable position.", "Sit on the sled machine with your back against the backrest and your feet shoulder-width apart on the footplate.", "Grip the handles on the sides of the seat for stability.", "Push the footplate away from your body by extending your legs, keeping your heels on the footplate.", "Continue pushing until your legs are almost fully extended, but without locking your knees.", "Pause for a moment at the top of the movement, then slowly lower the footplate back towards your body by bending your knees.", "Repeat for the desired number of repetitions."],
    },
  },
  leg_raises: {
    datasetId: '0472',
    datasetName: "hanging leg raise",
    target: "abs",
    equipment: "body weight",
    secondaryMuscles: ["hip flexors"],
    steps: {
      es: ["Cuélgate de una barra de dominadas con los brazos completamente extendidos y las palmas mirando hacia afuera.", "Activa el core y levanta las piernas frente a ti, manteniéndolas rectas.", "Continúa levantando hasta que las piernas estén paralelas al suelo o tan alto como puedas llegar cómodamente.", "Haz una pausa por un momento en la parte superior, luego baja lentamente las piernas de vuelta a la posición inicial.", "Repite el número de repeticiones deseado."],
      en: ["Hang from a pull-up bar with your arms fully extended and your palms facing away from you.", "Engage your core and lift your legs up in front of you, keeping them straight.", "Continue lifting until your legs are parallel to the ground or as high as you can comfortably go.", "Pause for a moment at the top, then slowly lower your legs back down to the starting position.", "Repeat for the desired number of repetitions."],
    },
  },
  lunges: {
    datasetId: '0336',
    datasetName: "dumbbell lunge",
    target: "glutes",
    equipment: "dumbbell",
    secondaryMuscles: ["quadriceps", "hamstrings", "calves"],
    steps: {
      es: ["Ponte de pie con los pies separados a la altura de los hombros, sujetando una mancuerna en cada mano.", "Da un paso adelante con el pie derecho, bajando el cuerpo hasta una posición de zancada.", "Mantén la espalda recta y el pecho erguido mientras bajas el cuerpo.", "Empuja con el talón derecho para regresar a la posición inicial.", "Repite con la pierna izquierda.", "Alterna las piernas el número de repeticiones deseado."],
      en: ["Stand with your feet shoulder-width apart, holding a dumbbell in each hand.", "Take a step forward with your right foot, lowering your body into a lunge position.", "Keep your back straight and your chest up as you lower your body.", "Push through your right heel to return to the starting position.", "Repeat with your left leg.", "Alternate legs for the desired number of repetitions."],
    },
  },
  lunges_fb: {
    datasetId: '0336',
    datasetName: "dumbbell lunge",
    target: "glutes",
    equipment: "dumbbell",
    secondaryMuscles: ["quadriceps", "hamstrings", "calves"],
    steps: {
      es: ["Ponte de pie con los pies separados a la altura de los hombros, sujetando una mancuerna en cada mano.", "Da un paso adelante con el pie derecho, bajando el cuerpo hasta una posición de zancada.", "Mantén la espalda recta y el pecho erguido mientras bajas el cuerpo.", "Empuja con el talón derecho para regresar a la posición inicial.", "Repite con la pierna izquierda.", "Alterna las piernas el número de repeticiones deseado."],
      en: ["Stand with your feet shoulder-width apart, holding a dumbbell in each hand.", "Take a step forward with your right foot, lowering your body into a lunge position.", "Keep your back straight and your chest up as you lower your body.", "Push through your right heel to return to the starting position.", "Repeat with your left leg.", "Alternate legs for the desired number of repetitions."],
    },
  },
  max_pullups: {
    datasetId: '0652',
    datasetName: "pull-up",
    target: "lats",
    equipment: "body weight",
    secondaryMuscles: ["biceps", "forearms"],
    steps: {
      es: ["Cuélgate de una barra de dominadas con las palmas hacia afuera y los brazos completamente extendidos.", "Activa el core y junta los omóplatos.", "Tira de tu cuerpo hacia la barra flexionando los codos y llevando el pecho hacia la barra.", "Haz una pausa en la parte alta del movimiento y luego baja lentamente el cuerpo de vuelta a la posición inicial.", "Repite el número de repeticiones deseado."],
      en: ["Hang from a pull-up bar with your palms facing away from you and your arms fully extended.", "Engage your core and squeeze your shoulder blades together.", "Pull your body up towards the bar by bending your elbows and bringing your chest towards the bar.", "Pause at the top of the movement, then slowly lower your body back down to the starting position.", "Repeat for the desired number of repetitions."],
    },
  },
  max_pushups: {
    datasetId: '0662',
    datasetName: "push-up",
    target: "pectorals",
    equipment: "body weight",
    secondaryMuscles: ["triceps", "deltoids", "core"],
    steps: {
      es: ["Comienza en una posición de plancha alta con las manos un poco más separadas que la anchura de los hombros y los pies juntos.", "Activa el core y baja el cuerpo hacia el suelo flexionando los codos, manteniendo el cuerpo en línea recta.", "Haz una pausa cuando el pecho esté justo por encima del suelo y luego empújate de vuelta a la posición inicial estirando los brazos.", "Repite el número de repeticiones deseado."],
      en: ["Start in a high plank position with your hands slightly wider than shoulder-width apart and your feet together.", "Engage your core and lower your body towards the ground by bending your elbows, keeping your body in a straight line.", "Pause for a moment when your chest is just above the ground, then push yourself back up to the starting position by straightening your arms.", "Repeat for the desired number of repetitions."],
    },
  },
  pallof_press: {
    datasetId: '0979',
    datasetName: "band horizontal pallof press",
    target: "abs",
    equipment: "band",
    secondaryMuscles: ["obliques", "glutes"],
    steps: {
      es: ["Sujeta la banda a un punto de anclaje resistente a la altura de la cintura.", "Ponte de pie perpendicular al punto de anclaje con los pies separados a la altura de los hombros.", "Agarra la agarradera de la banda con ambas manos y aléjate del punto de anclaje para generar tensión en la banda.", "Lleva las manos hacia el pecho, manteniendo los codos flexionados y cerca del cuerpo.", "Activa el core y mantén una postura estable.", "Extiende los brazos rectos frente a ti, empujando la banda alejándola del cuerpo.", "Mantén la posición extendida durante unos segundos, enfocándote en mantener la tensión en el core.", "Lleva lentamente las manos de vuelta al pecho, resistiendo el tirón de la banda.", "Repite el número de repeticiones deseado."],
      en: ["Attach the band to a sturdy anchor point at waist height.", "Stand perpendicular to the anchor point with your feet shoulder-width apart.", "Grasp the band handle with both hands and step away from the anchor point to create tension in the band.", "Bring your hands to your chest, keeping your elbows bent and close to your body.", "Engage your core and maintain a stable stance.", "Extend your arms straight out in front of you, pushing the band away from your body.", "Hold the extended position for a few seconds, focusing on maintaining tension in your core.", "Slowly bring your hands back to your chest, resisting the pull of the band.", "Repeat for the desired number of repetitions."],
    },
  },
  pp_a_glute_bridge: {
    datasetId: '3013',
    datasetName: "low glute bridge on floor",
    target: "glutes",
    equipment: "body weight",
    secondaryMuscles: ["hamstrings", "core"],
    steps: {
      es: ["Túmbate sobre tu espalda con las rodillas flexionadas y los pies apoyados en el suelo.", "Coloca los brazos a los lados del cuerpo, con las palmas hacia abajo.", "Activa los glúteos y el core, y luego eleva las caderas del suelo hasta que tu cuerpo forme una línea recta desde las rodillas hasta los hombros.", "Haz una pausa breve en la parte alta, apretando los glúteos.", "Baja lentamente las caderas de vuelta a la posición inicial.", "Repite el número de repeticiones deseado."],
      en: ["Lie flat on your back with your knees bent and feet flat on the ground.", "Place your arms by your sides, palms facing down.", "Engage your glutes and core, then lift your hips off the ground until your body forms a straight line from your knees to your shoulders.", "Pause for a moment at the top, squeezing your glutes.", "Slowly lower your hips back down to the starting position.", "Repeat for the desired number of repetitions."],
    },
  },
  pp_b_dead_bug: {
    datasetId: '0276',
    datasetName: "dead bug",
    target: "abs",
    equipment: "body weight",
    secondaryMuscles: ["hip flexors", "lower back"],
    steps: {
      es: ["Túmbate boca arriba con los brazos extendidos hacia el techo.", "Flexiona las rodillas y levanta las piernas del suelo, formando un ángulo de 90 grados en las caderas y las rodillas.", "Activa el core y la zona lumbar para presionar la zona lumbar contra el suelo.", "Baja lentamente el brazo derecho y la pierna izquierda hacia el suelo, manteniéndolos rectos y justo por encima del suelo.", "Haz una pausa breve y luego vuelve a la posición inicial.", "Repite el movimiento con el brazo izquierdo y la pierna derecha.", "Continúa alternando lados durante el número de repeticiones deseado."],
      en: ["Lie flat on your back with your arms extended towards the ceiling.", "Bend your knees and lift your legs off the ground, creating a 90-degree angle at your hips and knees.", "Engage your core and lower back to press your lower back into the ground.", "Slowly lower your right arm and left leg towards the ground, keeping them straight and hovering just above the floor.", "Pause for a moment, then return to the starting position.", "Repeat the movement with your left arm and right leg.", "Continue alternating sides for the desired number of repetitions."],
    },
  },
  pp_b_goblet_squat: {
    datasetId: '1760',
    datasetName: "dumbbell goblet squat",
    target: "quads",
    equipment: "dumbbell",
    secondaryMuscles: ["glutes", "hamstrings", "calves"],
    steps: {
      es: ["Ponte de pie con los pies separados a la altura de los hombros, sosteniendo una mancuerna verticalmente contra el pecho con ambas manos.", "Manteniendo el pecho erguido y el core activado, baja el cuerpo a una posición de sentadilla empujando las caderas hacia atrás y flexionando las rodillas.", "Continúa bajando hasta que los muslos queden paralelos al suelo, o tan abajo como puedas hacerlo cómodamente.", "Haz una pausa por un momento en la parte inferior, luego empuja con los talones para regresar a la posición inicial.", "Repite el número de repeticiones deseado."],
      en: ["Stand with your feet shoulder-width apart, holding a dumbbell vertically against your chest with both hands.", "Keeping your chest up and core engaged, lower your body down into a squat position by pushing your hips back and bending your knees.", "Continue lowering until your thighs are parallel to the ground, or as low as you can comfortably go.", "Pause for a moment at the bottom, then push through your heels to return to the starting position.", "Repeat for the desired number of repetitions."],
    },
  },
  pp_b_hip_thrust: {
    datasetId: '1409',
    datasetName: "barbell glute bridge",
    target: "glutes",
    equipment: "barbell",
    secondaryMuscles: ["hamstrings", "lower back"],
    steps: {
      es: ["Empieza tumbado boca arriba en el suelo con las rodillas flexionadas y los pies planos sobre el suelo.", "Coloca una barra sobre las caderas, sujetándola con firmeza con ambas manos.", "Activa los glúteos y el core, luego levanta las caderas del suelo hasta que el cuerpo forme una línea recta desde las rodillas hasta los hombros.", "Haz una pausa breve en la parte alta, apretando los glúteos.", "Baja lentamente las caderas de vuelta a la posición inicial.", "Repite el número de repeticiones deseado."],
      en: ["Start by lying flat on your back on the ground with your knees bent and feet flat on the floor.", "Place a barbell across your hips, holding it securely with both hands.", "Engage your glutes and core muscles, then lift your hips off the ground until your body forms a straight line from your knees to your shoulders.", "Pause for a moment at the top, squeezing your glutes.", "Slowly lower your hips back down to the starting position.", "Repeat for the desired number of repetitions."],
    },
  },
  pp_b_lunges: {
    datasetId: '0336',
    datasetName: "dumbbell lunge",
    target: "glutes",
    equipment: "dumbbell",
    secondaryMuscles: ["quadriceps", "hamstrings", "calves"],
    steps: {
      es: ["Ponte de pie con los pies separados a la altura de los hombros, sujetando una mancuerna en cada mano.", "Da un paso adelante con el pie derecho, bajando el cuerpo hasta una posición de zancada.", "Mantén la espalda recta y el pecho erguido mientras bajas el cuerpo.", "Empuja con el talón derecho para regresar a la posición inicial.", "Repite con la pierna izquierda.", "Alterna las piernas el número de repeticiones deseado."],
      en: ["Stand with your feet shoulder-width apart, holding a dumbbell in each hand.", "Take a step forward with your right foot, lowering your body into a lunge position.", "Keep your back straight and your chest up as you lower your body.", "Push through your right heel to return to the starting position.", "Repeat with your left leg.", "Alternate legs for the desired number of repetitions."],
    },
  },
  pp_b_rdl: {
    datasetId: '1459',
    datasetName: "dumbbell romanian deadlift",
    target: "glutes",
    equipment: "dumbbell",
    secondaryMuscles: ["hamstrings", "lower back"],
    steps: {
      es: ["Ponte de pie con los pies separados a la altura de los hombros, sujetando una mancuerna en cada mano con un agarre prono.", "Manteniendo la espalda recta y el core activado, inclínate desde las caderas y baja las mancuernas hacia el suelo, permitiendo que las rodillas se flexionen ligeramente.", "Baja las mancuernas hasta sentir un estiramiento en los isquiotibiales, luego empuja con los talones y activa los glúteos para volver a la posición inicial.", "Repite el número de repeticiones deseado."],
      en: ["Stand with your feet shoulder-width apart, holding a dumbbell in each hand with an overhand grip.", "Keeping your back straight and your core engaged, hinge at the hips and lower the dumbbells towards the ground, allowing your knees to bend slightly.", "Lower the dumbbells until you feel a stretch in your hamstrings, then push through your heels and engage your glutes to return to the starting position.", "Repeat for the desired number of repetitions."],
    },
  },
  pp_c_farmer_carry: {
    datasetId: '2133',
    datasetName: "farmers walk",
    target: "quads",
    equipment: "dumbbell",
    secondaryMuscles: ["calves", "forearms", "core"],
    steps: {
      es: ["Ponte de pie con una mancuerna en cada mano, palmas hacia los costados.", "Mantén la espalda recta y los hombros hacia atrás.", "Da pasos pequeños y controlados hacia adelante, manteniendo una postura erguida.", "Continúa caminando durante la distancia o el tiempo deseado.", "Para terminar, deja de caminar y baja con cuidado las mancuernas a los costados."],
      en: ["Stand up straight with a dumbbell in each hand, palms facing your sides.", "Keep your back straight and your shoulders back.", "Take small, controlled steps forward, maintaining an upright posture.", "Continue walking for the desired distance or time.", "To finish, stop walking and carefully lower the dumbbells to your sides."],
    },
  },
  pp_c_row: {
    datasetId: '0293',
    datasetName: "dumbbell bent over row",
    target: "upper back",
    equipment: "dumbbell",
    secondaryMuscles: ["biceps", "forearms"],
    steps: {
      es: ["Ponte de pie con los pies separados a la altura de los hombros, las rodillas ligeramente flexionadas, y sujeta una mancuerna en cada mano con las palmas hacia tu cuerpo.", "Inclínate hacia adelante desde las caderas, manteniendo la espalda recta y el core activado.", "Deja que los brazos cuelguen rectos hacia el suelo, con los codos ligeramente flexionados.", "Tira de las mancuernas hacia arriba, hacia el pecho, apretando los omóplatos entre sí.", "Haz una pausa breve en la parte alta, luego baja lentamente las mancuernas de vuelta a la posición inicial.", "Repite el número de repeticiones deseado."],
      en: ["Stand with your feet shoulder-width apart, knees slightly bent, and hold a dumbbell in each hand with your palms facing your body.", "Bend forward at the hips, keeping your back straight and your core engaged.", "Let your arms hang straight down towards the floor, with your elbows slightly bent.", "Pull the dumbbells up towards your chest, squeezing your shoulder blades together.", "Pause for a moment at the top, then slowly lower the dumbbells back down to the starting position.", "Repeat for the desired number of repetitions."],
    },
  },
  pp_c_shoulder_press: {
    datasetId: '0405',
    datasetName: "dumbbell seated shoulder press",
    target: "delts",
    equipment: "dumbbell",
    secondaryMuscles: ["triceps", "upper back"],
    steps: {
      es: ["Siéntate en un banco con una mancuerna en cada mano, apoyadas en los muslos.", "Sube las mancuernas hasta la altura de los hombros, con las palmas hacia adelante.", "Presiona las mancuernas hacia arriba hasta que los brazos queden completamente extendidos por encima de la cabeza.", "Haz una pausa por un momento en la parte superior, luego baja lentamente las mancuernas de vuelta a la altura de los hombros.", "Repite el número de repeticiones deseado."],
      en: ["Sit on a bench with a dumbbell in each hand, resting on your thighs.", "Raise the dumbbells to shoulder height, palms facing forward.", "Press the dumbbells upward until your arms are fully extended overhead.", "Pause for a moment at the top, then slowly lower the dumbbells back to shoulder height.", "Repeat for the desired number of repetitions."],
    },
  },
  pull_var: {
    datasetId: '2330',
    datasetName: "cable lat pulldown full range of motion",
    target: "lats",
    equipment: "cable",
    secondaryMuscles: ["biceps", "rhomboids", "rear deltoids"],
    steps: {
      es: ["Siéntate en la máquina de jalón al pecho con las rodillas colocadas debajo de las almohadillas.", "Sujeta la barra del cable con un agarre prono, un poco más separado que el ancho de los hombros.", "Inclínate ligeramente hacia atrás y mantén el pecho elevado, conservando un ligero arco en la zona lumbar.", "Jala la barra hacia la parte superior del pecho, apretando los omóplatos entre sí.", "Haz una pausa por un momento en la parte baja del movimiento y luego suelta lentamente la barra de vuelta a la posición inicial.", "Repite el número de repeticiones deseado."],
      en: ["Sit on the lat pulldown machine with your knees positioned under the pads.", "Grasp the cable bar with an overhand grip, slightly wider than shoulder-width apart.", "Lean back slightly and keep your chest up, maintaining a slight arch in your lower back.", "Pull the bar down towards your upper chest, squeezing your shoulder blades together.", "Pause for a moment at the bottom of the movement, then slowly release the bar back to the starting position.", "Repeat for the desired number of repetitions."],
    },
  },
  pullups_st: {
    datasetId: '0652',
    datasetName: "pull-up",
    target: "lats",
    equipment: "body weight",
    secondaryMuscles: ["biceps", "forearms"],
    steps: {
      es: ["Cuélgate de una barra de dominadas con las palmas hacia afuera y los brazos completamente extendidos.", "Activa el core y junta los omóplatos.", "Tira de tu cuerpo hacia la barra flexionando los codos y llevando el pecho hacia la barra.", "Haz una pausa en la parte alta del movimiento y luego baja lentamente el cuerpo de vuelta a la posición inicial.", "Repite el número de repeticiones deseado."],
      en: ["Hang from a pull-up bar with your palms facing away from you and your arms fully extended.", "Engage your core and squeeze your shoulder blades together.", "Pull your body up towards the bar by bending your elbows and bringing your chest towards the bar.", "Pause at the top of the movement, then slowly lower your body back down to the starting position.", "Repeat for the desired number of repetitions."],
    },
  },
  pullups_vol: {
    datasetId: '0652',
    datasetName: "pull-up",
    target: "lats",
    equipment: "body weight",
    secondaryMuscles: ["biceps", "forearms"],
    steps: {
      es: ["Cuélgate de una barra de dominadas con las palmas hacia afuera y los brazos completamente extendidos.", "Activa el core y junta los omóplatos.", "Tira de tu cuerpo hacia la barra flexionando los codos y llevando el pecho hacia la barra.", "Haz una pausa en la parte alta del movimiento y luego baja lentamente el cuerpo de vuelta a la posición inicial.", "Repite el número de repeticiones deseado."],
      en: ["Hang from a pull-up bar with your palms facing away from you and your arms fully extended.", "Engage your core and squeeze your shoulder blades together.", "Pull your body up towards the bar by bending your elbows and bringing your chest towards the bar.", "Pause at the top of the movement, then slowly lower your body back down to the starting position.", "Repeat for the desired number of repetitions."],
    },
  },
  pushups_vol: {
    datasetId: '0662',
    datasetName: "push-up",
    target: "pectorals",
    equipment: "body weight",
    secondaryMuscles: ["triceps", "deltoids", "core"],
    steps: {
      es: ["Comienza en una posición de plancha alta con las manos un poco más separadas que la anchura de los hombros y los pies juntos.", "Activa el core y baja el cuerpo hacia el suelo flexionando los codos, manteniendo el cuerpo en línea recta.", "Haz una pausa cuando el pecho esté justo por encima del suelo y luego empújate de vuelta a la posición inicial estirando los brazos.", "Repite el número de repeticiones deseado."],
      en: ["Start in a high plank position with your hands slightly wider than shoulder-width apart and your feet together.", "Engage your core and lower your body towards the ground by bending your elbows, keeping your body in a straight line.", "Pause for a moment when your chest is just above the ground, then push yourself back up to the starting position by straightening your arms.", "Repeat for the desired number of repetitions."],
    },
  },
  quick_pushups: {
    datasetId: '0662',
    datasetName: "push-up",
    target: "pectorals",
    equipment: "body weight",
    secondaryMuscles: ["triceps", "deltoids", "core"],
    steps: {
      es: ["Comienza en una posición de plancha alta con las manos un poco más separadas que la anchura de los hombros y los pies juntos.", "Activa el core y baja el cuerpo hacia el suelo flexionando los codos, manteniendo el cuerpo en línea recta.", "Haz una pausa cuando el pecho esté justo por encima del suelo y luego empújate de vuelta a la posición inicial estirando los brazos.", "Repite el número de repeticiones deseado."],
      en: ["Start in a high plank position with your hands slightly wider than shoulder-width apart and your feet together.", "Engage your core and lower your body towards the ground by bending your elbows, keeping your body in a straight line.", "Pause for a moment when your chest is just above the ground, then push yourself back up to the starting position by straightening your arms.", "Repeat for the desired number of repetitions."],
    },
  },
  rdl: {
    datasetId: '0085',
    datasetName: "barbell romanian deadlift",
    target: "glutes",
    equipment: "barbell",
    secondaryMuscles: ["hamstrings", "lower back"],
    steps: {
      es: ["Ponte de pie con los pies separados a la altura de los hombros y los dedos de los pies apuntando hacia delante.", "Sujeta la barra con un agarre pronado, manos un poco más separadas que el ancho de los hombros.", "Flexiona las caderas, manteniendo la espalda recta y las rodillas ligeramente flexionadas.", "Baja la barra hacia el suelo, manteniéndola cerca del cuerpo.", "Siente el estiramiento en los isquiotibiales mientras bajas la barra.", "Cuando sientas el estiramiento en los isquiotibiales, empuja las caderas hacia delante y ponte de pie.", "Aprieta los glúteos en la parte alta del movimiento.", "Baja la barra de vuelta a la posición inicial y repite el número de repeticiones deseado."],
      en: ["Stand with your feet shoulder-width apart and your toes pointing forward.", "Hold the barbell with an overhand grip, hands slightly wider than shoulder-width apart.", "Bend at the hips, keeping your back straight and your knees slightly bent.", "Lower the barbell towards the ground, keeping it close to your body.", "Feel the stretch in your hamstrings as you lower the barbell.", "Once you feel a stretch in your hamstrings, push your hips forward and stand up straight.", "Squeeze your glutes at the top of the movement.", "Lower the barbell back down to the starting position and repeat for the desired number of repetitions."],
    },
  },
  rdl_abs: {
    datasetId: '0085',
    datasetName: "barbell romanian deadlift",
    target: "glutes",
    equipment: "barbell",
    secondaryMuscles: ["hamstrings", "lower back"],
    steps: {
      es: ["Ponte de pie con los pies separados a la altura de los hombros y los dedos de los pies apuntando hacia delante.", "Sujeta la barra con un agarre pronado, manos un poco más separadas que el ancho de los hombros.", "Flexiona las caderas, manteniendo la espalda recta y las rodillas ligeramente flexionadas.", "Baja la barra hacia el suelo, manteniéndola cerca del cuerpo.", "Siente el estiramiento en los isquiotibiales mientras bajas la barra.", "Cuando sientas el estiramiento en los isquiotibiales, empuja las caderas hacia delante y ponte de pie.", "Aprieta los glúteos en la parte alta del movimiento.", "Baja la barra de vuelta a la posición inicial y repite el número de repeticiones deseado."],
      en: ["Stand with your feet shoulder-width apart and your toes pointing forward.", "Hold the barbell with an overhand grip, hands slightly wider than shoulder-width apart.", "Bend at the hips, keeping your back straight and your knees slightly bent.", "Lower the barbell towards the ground, keeping it close to your body.", "Feel the stretch in your hamstrings as you lower the barbell.", "Once you feel a stretch in your hamstrings, push your hips forward and stand up straight.", "Squeeze your glutes at the top of the movement.", "Lower the barbell back down to the starting position and repeat for the desired number of repetitions."],
    },
  },
  ring_dips: {
    datasetId: '0251',
    datasetName: "chest dip",
    target: "pectorals",
    equipment: "body weight",
    secondaryMuscles: ["triceps", "shoulders"],
    steps: {
      es: ["Colócate en las barras paralelas con los brazos completamente extendidos y el cuerpo recto.", "Baja el cuerpo flexionando los codos hasta que los hombros queden por debajo de los codos.", "Empújate de vuelta hacia arriba a la posición inicial extendiendo los brazos.", "Repite el número de repeticiones deseado."],
      en: ["Position yourself on parallel bars with your arms fully extended and your body straight.", "Lower your body by bending your elbows until your shoulders are below your elbows.", "Push yourself back up to the starting position by straightening your arms.", "Repeat for the desired number of repetitions."],
    },
  },
  row_abs: {
    datasetId: '0027',
    datasetName: "barbell bent over row",
    target: "upper back",
    equipment: "barbell",
    secondaryMuscles: ["biceps", "forearms"],
    steps: {
      es: ["Ponte de pie con los pies separados a la altura de los hombros y las rodillas ligeramente flexionadas.", "Inclínate hacia delante desde las caderas manteniendo la espalda recta y el pecho elevado.", "Agarra la barra con un agarre pronado, con las manos un poco más separadas que el ancho de los hombros.", "Tira de la barra hacia la parte inferior del pecho retrayendo los omóplatos y contrayendo los músculos de la espalda.", "Haz una pausa breve en la parte alta y luego baja lentamente la barra de vuelta a la posición inicial.", "Repite el número de repeticiones deseado."],
      en: ["Stand with your feet shoulder-width apart and knees slightly bent.", "Bend forward at the hips while keeping your back straight and chest up.", "Grasp the barbell with an overhand grip, hands slightly wider than shoulder-width apart.", "Pull the barbell towards your lower chest by retracting your shoulder blades and squeezing your back muscles.", "Pause for a moment at the top, then slowly lower the barbell back to the starting position.", "Repeat for the desired number of repetitions."],
    },
  },
  row_fb: {
    datasetId: '0027',
    datasetName: "barbell bent over row",
    target: "upper back",
    equipment: "barbell",
    secondaryMuscles: ["biceps", "forearms"],
    steps: {
      es: ["Ponte de pie con los pies separados a la altura de los hombros y las rodillas ligeramente flexionadas.", "Inclínate hacia delante desde las caderas manteniendo la espalda recta y el pecho elevado.", "Agarra la barra con un agarre pronado, con las manos un poco más separadas que el ancho de los hombros.", "Tira de la barra hacia la parte inferior del pecho retrayendo los omóplatos y contrayendo los músculos de la espalda.", "Haz una pausa breve en la parte alta y luego baja lentamente la barra de vuelta a la posición inicial.", "Repite el número de repeticiones deseado."],
      en: ["Stand with your feet shoulder-width apart and knees slightly bent.", "Bend forward at the hips while keeping your back straight and chest up.", "Grasp the barbell with an overhand grip, hands slightly wider than shoulder-width apart.", "Pull the barbell towards your lower chest by retracting your shoulder blades and squeezing your back muscles.", "Pause for a moment at the top, then slowly lower the barbell back to the starting position.", "Repeat for the desired number of repetitions."],
    },
  },
  row_heavy: {
    datasetId: '0027',
    datasetName: "barbell bent over row",
    target: "upper back",
    equipment: "barbell",
    secondaryMuscles: ["biceps", "forearms"],
    steps: {
      es: ["Ponte de pie con los pies separados a la altura de los hombros y las rodillas ligeramente flexionadas.", "Inclínate hacia delante desde las caderas manteniendo la espalda recta y el pecho elevado.", "Agarra la barra con un agarre pronado, con las manos un poco más separadas que el ancho de los hombros.", "Tira de la barra hacia la parte inferior del pecho retrayendo los omóplatos y contrayendo los músculos de la espalda.", "Haz una pausa breve en la parte alta y luego baja lentamente la barra de vuelta a la posición inicial.", "Repite el número de repeticiones deseado."],
      en: ["Stand with your feet shoulder-width apart and knees slightly bent.", "Bend forward at the hips while keeping your back straight and chest up.", "Grasp the barbell with an overhand grip, hands slightly wider than shoulder-width apart.", "Pull the barbell towards your lower chest by retracting your shoulder blades and squeezing your back muscles.", "Pause for a moment at the top, then slowly lower the barbell back to the starting position.", "Repeat for the desired number of repetitions."],
    },
  },
  row_upper_fb: {
    datasetId: '0027',
    datasetName: "barbell bent over row",
    target: "upper back",
    equipment: "barbell",
    secondaryMuscles: ["biceps", "forearms"],
    steps: {
      es: ["Ponte de pie con los pies separados a la altura de los hombros y las rodillas ligeramente flexionadas.", "Inclínate hacia delante desde las caderas manteniendo la espalda recta y el pecho elevado.", "Agarra la barra con un agarre pronado, con las manos un poco más separadas que el ancho de los hombros.", "Tira de la barra hacia la parte inferior del pecho retrayendo los omóplatos y contrayendo los músculos de la espalda.", "Haz una pausa breve en la parte alta y luego baja lentamente la barra de vuelta a la posición inicial.", "Repite el número de repeticiones deseado."],
      en: ["Stand with your feet shoulder-width apart and knees slightly bent.", "Bend forward at the hips while keeping your back straight and chest up.", "Grasp the barbell with an overhand grip, hands slightly wider than shoulder-width apart.", "Pull the barbell towards your lower chest by retracting your shoulder blades and squeezing your back muscles.", "Pause for a moment at the top, then slowly lower the barbell back to the starting position.", "Repeat for the desired number of repetitions."],
    },
  },
  russian_twist: {
    datasetId: '0687',
    datasetName: "russian twist",
    target: "abs",
    equipment: "body weight",
    secondaryMuscles: ["obliques"],
    steps: {
      es: ["Siéntate en el suelo con las rodillas flexionadas y los pies apoyados en el suelo.", "Inclínate ligeramente hacia atrás manteniendo la espalda recta y el core activado.", "Junta las manos frente al pecho o sujeta una pesa si lo deseas.", "Levanta los pies del suelo, equilibrándote sobre los isquiones.", "Gira el torso hacia la derecha, llevando las manos o la pesa hacia el lado derecho del cuerpo.", "Haz una pausa por un momento, luego gira el torso hacia la izquierda, llevando las manos o la pesa hacia el lado izquierdo del cuerpo.", "Continúa alternando lados durante el número de repeticiones deseado."],
      en: ["Sit on the ground with your knees bent and feet flat on the floor.", "Lean back slightly while keeping your back straight and your core engaged.", "Hold your hands together in front of your chest or hold a weight if desired.", "Lift your feet off the ground, balancing on your sit bones.", "Twist your torso to the right, bringing your hands or weight towards the right side of your body.", "Pause for a moment, then twist your torso to the left, bringing your hands or weight towards the left side of your body.", "Continue alternating sides for the desired number of repetitions."],
    },
  },
  russian_twist_fb: {
    datasetId: '0687',
    datasetName: "russian twist",
    target: "abs",
    equipment: "body weight",
    secondaryMuscles: ["obliques"],
    steps: {
      es: ["Siéntate en el suelo con las rodillas flexionadas y los pies apoyados en el suelo.", "Inclínate ligeramente hacia atrás manteniendo la espalda recta y el core activado.", "Junta las manos frente al pecho o sujeta una pesa si lo deseas.", "Levanta los pies del suelo, equilibrándote sobre los isquiones.", "Gira el torso hacia la derecha, llevando las manos o la pesa hacia el lado derecho del cuerpo.", "Haz una pausa por un momento, luego gira el torso hacia la izquierda, llevando las manos o la pesa hacia el lado izquierdo del cuerpo.", "Continúa alternando lados durante el número de repeticiones deseado."],
      en: ["Sit on the ground with your knees bent and feet flat on the floor.", "Lean back slightly while keeping your back straight and your core engaged.", "Hold your hands together in front of your chest or hold a weight if desired.", "Lift your feet off the ground, balancing on your sit bones.", "Twist your torso to the right, bringing your hands or weight towards the right side of your body.", "Pause for a moment, then twist your torso to the left, bringing your hands or weight towards the left side of your body.", "Continue alternating sides for the desired number of repetitions."],
    },
  },
  shoulder_press_fb: {
    datasetId: '0405',
    datasetName: "dumbbell seated shoulder press",
    target: "delts",
    equipment: "dumbbell",
    secondaryMuscles: ["triceps", "upper back"],
    steps: {
      es: ["Siéntate en un banco con una mancuerna en cada mano, apoyadas en los muslos.", "Sube las mancuernas hasta la altura de los hombros, con las palmas hacia adelante.", "Presiona las mancuernas hacia arriba hasta que los brazos queden completamente extendidos por encima de la cabeza.", "Haz una pausa por un momento en la parte superior, luego baja lentamente las mancuernas de vuelta a la altura de los hombros.", "Repite el número de repeticiones deseado."],
      en: ["Sit on a bench with a dumbbell in each hand, resting on your thighs.", "Raise the dumbbells to shoulder height, palms facing forward.", "Press the dumbbells upward until your arms are fully extended overhead.", "Pause for a moment at the top, then slowly lower the dumbbells back to shoulder height.", "Repeat for the desired number of repetitions."],
    },
  },
  single_leg_rdl: {
    datasetId: '1757',
    datasetName: "dumbbell single leg deadlift",
    target: "glutes",
    equipment: "dumbbell",
    secondaryMuscles: ["hamstrings", "lower back"],
    steps: {
      es: ["Ponte de pie con los pies separados a la altura de las caderas, sujetando una mancuerna con la mano derecha.", "Traslada tu peso a la pierna izquierda y levanta el pie derecho ligeramente del suelo.", "Manteniendo la espalda recta, inclínate hacia adelante desde las caderas y baja la mancuerna hacia el suelo.", "Al mismo tiempo, extiende la pierna derecha recta hacia atrás, manteniendo una ligera flexión en la rodilla izquierda.", "Baja la mancuerna hasta que tu torso y tu pierna derecha queden paralelos al suelo.", "Haz una pausa por un momento, luego activa los glúteos y los isquiotibiales para volver a la posición inicial.", "Repite el número de repeticiones deseado, luego cambia de lado."],
      en: ["Stand with your feet hip-width apart, holding a dumbbell in your right hand.", "Shift your weight onto your left leg and lift your right foot slightly off the ground.", "Keeping your back straight, hinge forward at the hips and lower the dumbbell towards the ground.", "At the same time, extend your right leg straight behind you, maintaining a slight bend in your left knee.", "Lower the dumbbell until your torso and right leg are parallel to the ground.", "Pause for a moment, then engage your glutes and hamstrings to return to the starting position.", "Repeat for the desired number of repetitions, then switch sides."],
    },
  },
  split_sq: {
    datasetId: '2368',
    datasetName: "split squats",
    target: "quads",
    equipment: "body weight",
    secondaryMuscles: ["glutes", "hamstrings", "calves"],
    steps: {
      es: ["Ponte de pie con los pies separados a la altura de los hombros.", "Da un paso adelante con un pie y colócalo aproximadamente a dos pies de distancia por delante del otro pie.", "Baja el cuerpo flexionando las rodillas y las caderas, manteniendo la espalda recta.", "Sigue bajando hasta que el muslo delantero quede paralelo al suelo y la rodilla trasera quede justo por encima del suelo.", "Haz una pausa breve, luego empuja con el talón delantero para volver a la posición inicial.", "Repite el número de repeticiones deseado y luego cambia de pierna y repite."],
      en: ["Stand with your feet shoulder-width apart.", "Take a step forward with one foot and place it about two feet in front of the other foot.", "Lower your body by bending your knees and hips, keeping your back straight.", "Continue lowering until your front thigh is parallel to the ground, and your back knee is hovering just above the ground.", "Pause for a moment, then push through your front heel to return to the starting position.", "Repeat for the desired number of repetitions, then switch legs and repeat."],
    },
  },
  step_ups: {
    datasetId: '0431',
    datasetName: "dumbbell step-up",
    target: "glutes",
    equipment: "dumbbell",
    secondaryMuscles: ["quadriceps", "hamstrings", "calves"],
    steps: {
      es: ["Ponte de pie frente a un banco o escalón con una mancuerna en cada mano, con las palmas hacia tu cuerpo.", "Coloca el pie derecho sobre el banco o escalón, asegurándote de que todo el pie esté en contacto con la superficie.", "Empuja con el talón derecho y sube el cuerpo sobre el banco o escalón, enderezando la pierna derecha.", "Sube el pie izquierdo hasta el banco o escalón, quedando completamente erguido.", "Baja con el pie izquierdo, seguido del pie derecho, volviendo a la posición inicial.", "Repite el número de repeticiones deseado, luego cambia de pierna."],
      en: ["Stand in front of a bench or step with a dumbbell in each hand, palms facing your body.", "Place your right foot on the bench or step, ensuring your entire foot is in contact with the surface.", "Push through your right heel and lift your body up onto the bench or step, straightening your right leg.", "Bring your left foot up onto the bench or step, standing fully upright.", "Step back down with your left foot, followed by your right foot, returning to the starting position.", "Repeat for the desired number of repetitions, then switch legs."],
    },
  },
  sumo_deadlift: {
    datasetId: '0117',
    datasetName: "barbell sumo deadlift",
    target: "glutes",
    equipment: "barbell",
    secondaryMuscles: ["hamstrings", "quadriceps", "lower back"],
    steps: {
      es: ["Ponte de pie con los pies más separados que el ancho de los hombros, con las puntas de los pies hacia afuera.", "Coloca una barra en el suelo frente a ti, centrada entre los pies.", "Flexiona las rodillas y baja las caderas, manteniendo la espalda recta y el pecho elevado, para sujetar la barra con agarre prono.", "Activa el core y empuja con los talones para levantar la barra del suelo, extendiendo las caderas y las rodillas simultáneamente.", "Al levantar, mantén el pecho elevado y la espalda recta, y empuja las caderas hacia adelante para activar completamente los glúteos.", "Haz una pausa breve en la parte más alta, luego baja lentamente la barra de vuelta a la posición inicial, manteniendo el control durante todo el movimiento.", "Repite el número de repeticiones deseado."],
      en: ["Stand with your feet wider than shoulder-width apart, toes pointing outwards.", "Place a barbell on the ground in front of you, centered between your feet.", "Bend your knees and lower your hips, keeping your back straight and chest up, to grip the barbell with an overhand grip.", "Engage your core and drive through your heels to lift the barbell off the ground, extending your hips and knees simultaneously.", "As you lift, keep your chest up and back straight, and push your hips forward to fully engage your glutes.", "Pause for a moment at the top, then slowly lower the barbell back down to the starting position, maintaining control throughout the movement.", "Repeat for the desired number of repetitions."],
    },
  },
  tempo_rdl: {
    datasetId: '0085',
    datasetName: "barbell romanian deadlift",
    target: "glutes",
    equipment: "barbell",
    secondaryMuscles: ["hamstrings", "lower back"],
    steps: {
      es: ["Ponte de pie con los pies separados a la altura de los hombros y los dedos de los pies apuntando hacia delante.", "Sujeta la barra con un agarre pronado, manos un poco más separadas que el ancho de los hombros.", "Flexiona las caderas, manteniendo la espalda recta y las rodillas ligeramente flexionadas.", "Baja la barra hacia el suelo, manteniéndola cerca del cuerpo.", "Siente el estiramiento en los isquiotibiales mientras bajas la barra.", "Cuando sientas el estiramiento en los isquiotibiales, empuja las caderas hacia delante y ponte de pie.", "Aprieta los glúteos en la parte alta del movimiento.", "Baja la barra de vuelta a la posición inicial y repite el número de repeticiones deseado."],
      en: ["Stand with your feet shoulder-width apart and your toes pointing forward.", "Hold the barbell with an overhand grip, hands slightly wider than shoulder-width apart.", "Bend at the hips, keeping your back straight and your knees slightly bent.", "Lower the barbell towards the ground, keeping it close to your body.", "Feel the stretch in your hamstrings as you lower the barbell.", "Once you feel a stretch in your hamstrings, push your hips forward and stand up straight.", "Squeeze your glutes at the top of the movement.", "Lower the barbell back down to the starting position and repeat for the desired number of repetitions."],
    },
  },
  triceps_pushdown: {
    datasetId: '0200',
    datasetName: "cable pushdown (with rope attachment)",
    target: "triceps",
    equipment: "cable",
    secondaryMuscles: ["forearms"],
    steps: {
      es: ["Sujeta un accesorio de cuerda a una polea alta en una máquina de cable.", "Ponte de pie frente a la máquina con los pies separados a la altura de los hombros y una ligera flexión en las rodillas.", "Sujeta la cuerda con un agarre prono, con las palmas una frente a la otra.", "Mantén los codos cerca de los costados y los brazos superiores quietos durante todo el ejercicio.", "Exhala y empuja la cuerda hacia abajo extendiendo los codos hasta que los brazos queden completamente extendidos.", "Haz una pausa por un momento, luego inhala y regresa lentamente a la posición inicial permitiendo que los codos se flexionen.", "Repite el número de repeticiones deseado."],
      en: ["Attach a rope attachment to a high pulley on a cable machine.", "Stand facing the machine with your feet shoulder-width apart and a slight bend in your knees.", "Grasp the rope with an overhand grip, palms facing each other.", "Keep your elbows close to your sides and your upper arms stationary throughout the exercise.", "Exhale and push the rope downward by extending your elbows until your arms are fully extended.", "Pause for a moment, then inhale and slowly return to the starting position by allowing your elbows to flex.", "Repeat for the desired number of repetitions."],
    },
  },
  ttb: {
    datasetId: '0472',
    datasetName: "hanging leg raise",
    target: "abs",
    equipment: "body weight",
    secondaryMuscles: ["hip flexors"],
    steps: {
      es: ["Cuélgate de una barra de dominadas con los brazos completamente extendidos y las palmas mirando hacia afuera.", "Activa el core y levanta las piernas frente a ti, manteniéndolas rectas.", "Continúa levantando hasta que las piernas estén paralelas al suelo o tan alto como puedas llegar cómodamente.", "Haz una pausa por un momento en la parte superior, luego baja lentamente las piernas de vuelta a la posición inicial.", "Repite el número de repeticiones deseado."],
      en: ["Hang from a pull-up bar with your arms fully extended and your palms facing away from you.", "Engage your core and lift your legs up in front of you, keeping them straight.", "Continue lifting until your legs are parallel to the ground or as high as you can comfortably go.", "Pause for a moment at the top, then slowly lower your legs back down to the starting position.", "Repeat for the desired number of repetitions."],
    },
  },
  weighted_crunch: {
    datasetId: '0832',
    datasetName: "weighted crunch",
    target: "abs",
    equipment: "weighted",
    secondaryMuscles: ["obliques"],
    steps: {
      es: ["Túmbate sobre tu espalda con las rodillas flexionadas y los pies apoyados en el suelo.", "Sostén un disco de peso o una mancuerna sobre el pecho.", "Activa el abdomen y levanta la parte superior del cuerpo del suelo, curvándote hacia adelante hasta que los omóplatos se separen del suelo.", "Haz una pausa por un momento en la parte superior, luego baja lentamente la parte superior del cuerpo de vuelta a la posición inicial.", "Repite el número de repeticiones deseado."],
      en: ["Lie flat on your back with your knees bent and feet flat on the ground.", "Hold a weight plate or dumbbell on your chest.", "Engage your abs and lift your upper body off the ground, curling forward until your shoulder blades are off the ground.", "Pause for a moment at the top, then slowly lower your upper body back down to the starting position.", "Repeat for the desired number of repetitions."],
    },
  },
};

/** Devuelve la guía de un ejercicio, o undefined si no tiene (metcons, skills, posparto). */
export function getExerciseGuide(exerciseId: string): ExerciseGuide | undefined {
  return EXERCISE_GUIDES[exerciseId];
}
