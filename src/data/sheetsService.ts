import { GymVisit, User } from './types';

// Caché para limitar solicitudes repetidas
const apiCache = {
  users: null as User[] | null,
  visits: null as GymVisit[] | null,
  lastFetched: {
    users: 0,
    visits: 0
  }
};

// Tiempo de caché en milisegundos (5 minutos)
const CACHE_DURATION = 5 * 60 * 1000;

// Valores predeterminados si no podemos cargar datos
const DEFAULT_USERS: User[] = [
  { id: '1', name: 'Gabi' },
  { id: '2', name: 'Iña' }
];

// Función para construir la URL completa de la API
function getApiUrl(endpoint: string): string {
  // Verificar si estamos en desarrollo o producción
  const baseUrl = 
    typeof window !== 'undefined' && window.location.hostname === 'localhost' 
      ? 'http://localhost:3001' // En desarrollo, usa siempre el puerto 3001
      : window.location.origin; // En producción, usa el origen actual
  
  return `${baseUrl}${endpoint}`;
}

// Cargar usuarios
export async function loadUsers(): Promise<User[]> {
  try {
    // Verificar si tenemos datos en caché recientes
    const now = Date.now();
    if (apiCache.users && (now - apiCache.lastFetched.users < CACHE_DURATION)) {
      console.log('Usando usuarios en caché');
      return apiCache.users;
    }
    
    // Llamar a la API en lugar de conectarse directamente a Google Sheets
    console.log('Obteniendo usuarios desde la API');
    const apiUrl = getApiUrl('/api/sheets?type=users');
    console.log('URL de la API:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      // Agregar credenciales para asegurar que se envíen cookies
      credentials: 'same-origin'
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('Error cargando usuarios desde la API:', data.error, data.details || '');
      
      // Si tenemos datos en caché, aunque sean viejos, los usamos como fallback
      if (apiCache.users) {
        console.log('Usando caché antigua como fallback para usuarios');
        return apiCache.users;
      }
      
      // Valores por defecto como fallback final
      return DEFAULT_USERS;
    }
    
    // Actualizar caché
    apiCache.users = data.users || [];
    apiCache.lastFetched.users = now;
    
    return data.users || [];
  } catch (error) {
    console.error('Error cargando usuarios:', error);
    
    // Si tenemos datos en caché, los usamos como fallback
    if (apiCache.users) {
      console.log('Usando caché como fallback para usuarios después de error');
      return apiCache.users;
    }
    
    // Valores por defecto como fallback
    return DEFAULT_USERS;
  }
}

// Cargar visitas
export async function loadVisits(): Promise<GymVisit[]> {
  try {
    // Primero intentamos cargar desde localStorage como caché rápido
    const storedData = localStorage.getItem('gym_counter_data');
    let localVisits: GymVisit[] = [];
    
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        localVisits = data.visits || [];
        console.log(`${localVisits.length} visitas encontradas en localStorage`);
      } catch (e) {
        console.error('Error al leer visitas de localStorage:', e);
      }
    }
    
    // Verificar si tenemos datos en caché recientes
    const now = Date.now();
    if (apiCache.visits && (now - apiCache.lastFetched.visits < CACHE_DURATION)) {
      console.log('Usando visitas en caché');
      return apiCache.visits;
    }
    
    // Luego intentamos obtener datos más actualizados de la API
    console.log('Obteniendo visitas desde la API');
    const apiUrl = getApiUrl('/api/sheets?type=visits');
    console.log('URL de la API:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error cargando visitas desde la API:', errorData.error, errorData.details || '');
      
      // Si tenemos datos en caché, aunque sean viejos, los usamos
      if (apiCache.visits) {
        console.log('Usando caché antigua como fallback para visitas');
        return apiCache.visits;
      }
      
      return localVisits;
    }
    
    const data = await response.json();
    const apiVisits = data.visits || [];
    console.log(`${apiVisits.length} visitas cargadas desde la API`);
    
    // Actualizar caché
    apiCache.visits = apiVisits;
    apiCache.lastFetched.visits = now;
    
    // Actualizar localStorage con datos más recientes
    if (apiVisits.length > 0) {
      try {
        localStorage.setItem('gym_counter_data', JSON.stringify({ 
          visits: apiVisits 
        }));
      } catch (e) {
        console.error('Error al guardar visitas en localStorage:', e);
      }
    }
    
    return apiVisits;
  } catch (error) {
    console.error('Error cargando visitas:', error);
    
    // Si tenemos datos en caché, los usamos como fallback
    if (apiCache.visits) {
      console.log('Usando caché como fallback para visitas después de error');
      return apiCache.visits;
    }
    
    // Fallback a localStorage
    try {
      const storedData = localStorage.getItem('gym_counter_data');
      if (storedData) {
        const data = JSON.parse(storedData);
        return data.visits || [];
      }
    } catch (e) {
      console.error('Error al leer visitas de localStorage (fallback):', e);
    }
    
    return [];
  }
}

// Guardar una nueva visita
export async function saveVisit(visit: GymVisit): Promise<boolean> {
  console.log("Guardando visita:", visit);
  
  // Siempre guardamos en localStorage como respaldo/caché
  try {
    const storedData = localStorage.getItem('gym_counter_data');
    const data = storedData ? JSON.parse(storedData) : { visits: [] };
    data.visits = [...data.visits, visit];
    localStorage.setItem('gym_counter_data', JSON.stringify(data));
    console.log("Guardado en localStorage exitoso");
    
    // Actualizar también la caché en memoria
    if (apiCache.visits) {
      apiCache.visits = [...apiCache.visits, visit];
    }
  } catch (error) {
    console.error('Error al guardar en localStorage:', error);
  }
  
  // Intentar guardar en el servidor a través de la API
  try {
    const apiUrl = getApiUrl('/api/sheets');
    console.log('URL de la API para guardar:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
      body: JSON.stringify({
        type: 'visit',
        visit
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error guardando visita en el servidor:', errorData.error, errorData.details || '');
      return false;
    }
    
    console.log('Visita guardada correctamente en el servidor');
    return true;
  } catch (error) {
    console.error('Error en la petición para guardar visita:', error);
    return false;
  }
} 