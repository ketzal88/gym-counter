# Integración de Videos de YouTube en RoutineTracker

## Infraestructura Completada

✅ **Mapping de ejercicios** (`src/data/exerciseVideos.ts`):
- 50+ ejercicios mapeados a videos de YouTube
- Canales confiables: AthleanX, Jeff Nippard, Alan Thrall, etc.
- Funciones helper: `getYouTubeUrl()`, `getYouTubeEmbedUrl()`, `getYouTubeThumbnail()`

✅ **Component YouTubeVideoModal** (`src/app/components/YouTubeVideoModal.tsx`):
- Modal fullscreen responsive con embed de YouTube
- Cierre con ESC o botón X
- Botón "Abrir en YouTube" con link externo
- Manejo de caso cuando no hay video disponible
- 16:9 aspect ratio responsive

## Cómo Integrar en RoutineTracker

### Paso 1: Importar componentes

```typescript
import YouTubeVideoModal from './YouTubeVideoModal';
import { EXERCISE_VIDEOS } from '@/data/exerciseVideos';
import { PlayCircle } from 'lucide-react';
```

### Paso 2: Añadir estado del modal

```typescript
const [videoModal, setVideoModal] = useState<{
  exerciseId: string;
  exerciseName: string;
} | null>(null);
```

### Paso 3: Añadir el modal al JSX (antes del return final)

```typescript
{/* Video Modal */}
{videoModal && (
  <YouTubeVideoModal
    exerciseId={videoModal.exerciseId}
    exerciseName={videoModal.exerciseName}
    isOpen={!!videoModal}
    onClose={() => setVideoModal(null)}
  />
)}
```

### Paso 4: Añadir botón "Ver Técnica" en cada ejercicio

Busca donde se renderiza cada ejercicio (probablemente en un `.map()` de `workout.exercises`) y añade:

```typescript
{/* Botón de Video */}
{EXERCISE_VIDEOS[exercise.id] && (
  <button
    onClick={() => setVideoModal({
      exerciseId: exercise.id,
      exerciseName: exercise.name
    })}
    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-colors"
  >
    <PlayCircle className="w-4 h-4" />
    <span>Ver Técnica</span>
  </button>
)}
```

### Alternativa: Badge de video en el header del ejercicio

```typescript
{EXERCISE_VIDEOS[exercise.id] && (
  <button
    onClick={() => setVideoModal({
      exerciseId: exercise.id,
      exerciseName: exercise.name
    })}
    className="ml-auto px-2 py-1 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1 transition-colors"
  >
    <PlayCircle className="w-3 h-3" />
    Video
  </button>
)}
```

## Añadir Más Videos

Para añadir videos a más ejercicios, edita `src/data/exerciseVideos.ts`:

```typescript
export const EXERCISE_VIDEOS: Record<string, ExerciseVideoData> = {
  // ...existing videos
  'nuevo_ejercicio': {
    videoId: 'YouTube_Video_ID',  // Solo el ID, no la URL completa
    duration: '8:30',              // Opcional
    channel: 'Canal Name',          // Opcional
    title: 'Título del Video'      // Opcional
  },
};
```

## Testing

1. Busca un ejercicio que tenga video mapeado (ej: 'bench_press', 'squat', 'deadlift')
2. Click en el botón "Ver Técnica"
3. El modal debería abrir con el video embedido
4. Verifica que funcione el botón "Abrir en YouTube"
5. Verifica que se cierre con ESC o botón X

## Notas

- Los videos están embedidos desde YouTube, por lo que requieren conexión a internet
- En modo offline, el botón de video podría estar deshabilitado o mostrar un mensaje
- Los IDs de ejercicios deben coincidir exactamente con los usados en `protocolEngine.ts`
