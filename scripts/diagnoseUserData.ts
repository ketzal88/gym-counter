import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';

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

async function diagnoseData() {
  try {
    console.log(`\n🔍 Diagnóstico de Datos de Firebase`);
    console.log(`===================================\n`);

    // 1. Listar todos los usuarios
    console.log('📋 Usuarios registrados:');
    const usersSnapshot = await getDocs(collection(db, 'users'));
    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      console.log(`\n  UID: ${doc.id}`);
      console.log(`  Email: ${userData.email}`);
      console.log(`  Nombre: ${userData.displayName}`);
      console.log(`  Onboarding: ${userData.onboardingCompleted ? '✅' : '❌'}`);
    });

    console.log(`\n📊 Total de usuarios: ${usersSnapshot.size}`);

    // 2. Listar todos los estados de entrenamiento
    console.log(`\n\n📈 Estados de Entrenamiento:`);
    const statesSnapshot = await getDocs(collection(db, 'userTrainingState'));
    statesSnapshot.forEach((doc) => {
      const state = doc.data();
      console.log(`\n  UserID: ${doc.id}`);
      console.log(`  Día actual: ${state.currentDay}`);
      console.log(`  Sesiones completadas: ${state.completedProtocolSessions}`);
      console.log(`  Plan: ${state.planVersion}`);
      console.log(`  Completado: ${state.protocolCompleted ? '✅' : '❌'}`);
      console.log(`  Lift State:`, state.liftState);
    });

    console.log(`\n📊 Total de estados: ${statesSnapshot.size}`);

    // 3. Listar workouts recientes
    console.log(`\n\n🏋️ Últimos Workouts:`);
    const workoutsSnapshot = await getDocs(collection(db, 'workouts'));
    const workouts = workoutsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Ordenar por fecha
    workouts.sort((a: any, b: any) => {
      const dateA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
      const dateB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
      return dateB.getTime() - dateA.getTime();
    });

    // Mostrar los últimos 10
    workouts.slice(0, 10).forEach((workout: any) => {
      const date = workout.timestamp?.toDate ? workout.timestamp.toDate() : new Date(workout.timestamp);
      console.log(`\n  Fecha: ${date.toLocaleDateString()}`);
      console.log(`  UserID: ${workout.userId}`);
      console.log(`  Rutina: ${workout.routineName}`);
      console.log(`  Día Protocolo: ${workout.protocolDay || 'N/A'}`);
      console.log(`  Tipo: ${workout.protocolDayType || 'N/A'}`);
    });

    console.log(`\n📊 Total de workouts: ${workouts.length}`);

  } catch (error) {
    console.error('❌ Error durante el diagnóstico:', error);
  }
}

diagnoseData()
  .then(() => {
    console.log('\n\n✨ Diagnóstico completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Error fatal:', error);
    process.exit(1);
  });
