import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

async function recoverUserProgress(email: string, targetDay: number) {
  try {
    console.log(`🔍 Buscando usuario con email: ${email}`);

    // 1. Buscar el usuario por email en la colección 'users'
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.error('❌ No se encontró ningún usuario con ese email');
      return;
    }

    const userDoc = querySnapshot.docs[0];
    const userId = userDoc.id;
    const userData = userDoc.data();

    console.log(`✅ Usuario encontrado: ${userData.displayName} (UID: ${userId})`);

    // 2. Obtener el estado de entrenamiento actual
    const trainingStateRef = doc(db, 'userTrainingState', userId);
    const trainingStateSnap = await getDoc(trainingStateRef);

    if (trainingStateSnap.exists()) {
      const currentState = trainingStateSnap.data();
      console.log(`📊 Estado actual:`);
      console.log(`   - Día actual: ${currentState.currentDay}`);
      console.log(`   - Sesiones completadas: ${currentState.completedProtocolSessions}`);
      console.log(`   - Plan version: ${currentState.planVersion}`);
      console.log(`   - Lift state:`, currentState.liftState);

      // 3. Actualizar el currentDay
      await updateDoc(trainingStateRef, {
        currentDay: targetDay
      });

      console.log(`\n✅ ¡Progreso restaurado! Día actualizado de ${currentState.currentDay} a ${targetDay}`);
    } else {
      console.log('⚠️  No existe un documento de userTrainingState. Creando uno nuevo...');

      // Crear un nuevo documento con valores por defecto
      await setDoc(trainingStateRef, {
        currentDay: targetDay,
        completedProtocolSessions: targetDay - 1,
        liftState: {
          bench: 60,
          squat: 80,
          deadlift: 100,
          ohp: 40,
          pullupsLevel: 5
        },
        planVersion: 'military_v1',
        protocolCompleted: false
      });

      console.log(`✅ Nuevo estado de entrenamiento creado con día ${targetDay}`);
    }

    // 4. Verificar el cambio
    const updatedStateSnap = await getDoc(trainingStateRef);
    const updatedState = updatedStateSnap.data();
    console.log(`\n🎉 Estado final verificado:`);
    console.log(`   - Día actual: ${updatedState?.currentDay}`);

  } catch (error) {
    console.error('❌ Error durante la recuperación:', error);
  }
}

// Ejecutar el script
const userEmail = process.argv[2] || 'gabrielucc@gmail.com';
const targetDay = parseInt(process.argv[3]) || 6;

console.log(`\n🔧 Script de Recuperación de Progreso`);
console.log(`=====================================\n`);

recoverUserProgress(userEmail, targetDay)
  .then(() => {
    console.log('\n✨ Script completado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Error fatal:', error);
    process.exit(1);
  });
