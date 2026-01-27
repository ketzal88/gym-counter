# GymCounter 🏋️

Una aplicación web moderna para rastrear tu asistencia al gimnasio, récords personales y mediciones corporales. Perfecta para mantener la motivación y seguir tu progreso fitness.

## ✨ Características

### 📊 Dashboard Principal
- **Asistencia Semanal**: Visualiza tu asistencia de los últimos 7 días
- **Resumen Mensual**: Estadísticas de los últimos dos meses
- **Porcentaje de Asistencia**: Calcula tu compromiso anual
- **Registro Rápido**: FAB (Floating Action Button) para añadir visitas del día actual
- **Mediciones Corporales**: Seguimiento de % músculo y % grasa con indicadores de tendencia

### 📈 KPIs y Análisis
- **Comparativa Anual**: Gráfico de líneas comparando año actual vs anterior
- **Volumen Acumulado**: Total de visitas del año con porcentaje de asistencia
- **Promedio Mensual**: Calcula automáticamente tu promedio de visitas
- **Mes Pico**: Identifica tu mejor mes del año

### 🏆 Récords Personales
- **Sentadilla** (Piernas)
- **Press de Banca** (Pecho)
- **Peso Muerto** (Espalda)
- **Press Militar** (Hombros)
- Indicadores de progreso y tendencias

### 🎨 Diseño
- **Dark Mode**: Soporte completo para modo oscuro/claro/automático
- **Responsive**: Optimizado para móviles y tablets
- **Material Symbols**: Iconografía moderna de Google
- **Animaciones**: Transiciones suaves y micro-interacciones

## 🚀 Tecnologías

- **Framework**: Next.js 15 con React 19
- **Estilos**: Tailwind CSS 4
- **Base de Datos**: Firebase Firestore
- **Autenticación**: Firebase Auth
- **Gráficos**: Recharts
- **Temas**: next-themes
- **TypeScript**: Tipado estático completo

## 📦 Instalación Local

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/gymcounter.git
   cd gymcounter
   ```

2. **Instala dependencias**
   ```bash
   npm install
   ```

3. **Configura Firebase**
   - Crea un proyecto en [Firebase Console](https://console.firebase.google.com/)
   - Habilita **Authentication** (Email/Password)
   - Habilita **Firestore Database**
   - Copia las credenciales de tu proyecto

4. **Configura variables de entorno**
   
   Crea un archivo `.env.local` en la raíz del proyecto:
   
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
   ```

5. **Ejecuta el servidor de desarrollo**
   ```bash
   npm run dev
   ```

6. **Abre tu navegador**
   
   Visita [http://localhost:3000](http://localhost:3000)

## 🌐 Deploy en Vercel

### Paso 1: Preparar el Proyecto

1. Sube tu código a GitHub
2. Asegúrate de tener tu proyecto de Firebase configurado

### Paso 2: Importar en Vercel

1. Ve a [Vercel](https://vercel.com)
2. Haz clic en **"Add New Project"**
3. Importa tu repositorio de GitHub
4. Vercel detectará automáticamente que es un proyecto Next.js

### Paso 3: Configurar Variables de Entorno

En la sección **Environment Variables** de Vercel, agrega:

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

**Importante**: Asegúrate de agregar estas variables para los tres entornos:
- ✅ Production
- ✅ Preview
- ✅ Development

### Paso 4: Configurar Firebase para Vercel

1. **Autoriza el dominio de Vercel en Firebase**
   - Ve a Firebase Console → Authentication → Settings
   - En **Authorized domains**, agrega:
     - `tu-proyecto.vercel.app`
     - `tu-dominio-personalizado.com` (si tienes uno)

2. **Configura reglas de Firestore**
   
   En Firebase Console → Firestore Database → Rules:
   
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Usuarios solo pueden leer/escribir sus propios datos
       match /visits/{visitId} {
         allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
         allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
       }
       
       match /bodyMeasurements/{measurementId} {
         allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
         allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
       }
       
       match /maxWeights/{weightId} {
         allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
         allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
       }
     }
   }
   ```

### Paso 5: Deploy

1. Haz clic en **"Deploy"**
2. Espera a que Vercel construya y despliegue tu aplicación
3. ¡Listo! Tu app estará disponible en `https://tu-proyecto.vercel.app`

## 🔧 Comandos Disponibles

```bash
npm run dev      # Inicia el servidor de desarrollo
npm run build    # Construye la aplicación para producción
npm run start    # Inicia el servidor de producción
npm run lint     # Ejecuta el linter
```

## 📱 Estructura del Proyecto

```
gymcounter/
├── src/
│   ├── app/
│   │   ├── components/        # Componentes React
│   │   │   ├── UnifiedDashboard.tsx
│   │   │   ├── MaxWeightsSection.tsx
│   │   │   ├── TotalVisitsChart.tsx
│   │   │   └── ...
│   │   ├── layout.tsx         # Layout principal
│   │   └── page.tsx           # Página de inicio
│   ├── context/
│   │   └── AuthContext.tsx    # Contexto de autenticación
│   └── services/
│       └── db.ts              # Servicios de Firebase
├── public/                    # Archivos estáticos
├── .env.local                 # Variables de entorno (no commitear)
└── package.json
```

## 🎯 Uso de la Aplicación

### Registro de Visitas
1. Haz clic en el **FAB (+)** en la esquina inferior derecha para registrar la visita del día
2. O toca un día en el calendario semanal para registrar/editar visitas

### Añadir Récords
1. Ve a la pestaña **"Récords"**
2. Haz clic en el botón **"+"** del ejercicio
3. Ajusta el peso y repeticiones
4. Guarda tu nuevo récord

### Mediciones Corporales
1. En la pestaña **"Récords"**, busca la sección de mediciones
2. Haz clic en **"+ Nuevo"**
3. Ingresa tu % de músculo y % de grasa
4. Las tendencias se calcularán automáticamente

## 🔐 Seguridad

- Autenticación requerida para todas las operaciones
- Reglas de Firestore configuradas para acceso solo al usuario propietario
- Variables de entorno para credenciales sensibles
- HTTPS obligatorio en producción (Vercel lo maneja automáticamente)

## 📄 Licencia

MIT License - siéntete libre de usar este proyecto para tus propios propósitos.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

Si encuentras algún problema o tienes sugerencias, por favor abre un issue en GitHub.

---

Hecho con 💪 para mantener la consistencia en el gym
