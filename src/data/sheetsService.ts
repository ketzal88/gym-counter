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
const DEFAULT_USERS: User[] = [];

// Función para construir la URL completa de la API
function getApiUrl(endpoint: string): string {
  // Usar siempre el origen actual (mismo puerto que la aplicación)
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  return `${baseUrl}${endpoint}`;
}

// Cargar usuarios
export async function loadUsers(): Promise<User[]> {
  try {
    // Verificar si tenemos datos en caché recientes
    const now = Date.now();
    if (apiCache.users && (now - apiCache.lastFetched.users < CACHE_DURATION)) {
      return apiCache.users;
    }
    
    // Llamar a la API en lugar de conectarse directamente a Google Sheets
    const apiUrl = getApiUrl('/api/sheets?type=users');
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin'
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('Error cargando usuarios desde la API:', data.error);
      
      // Si tenemos datos en caché, aunque sean viejos, los usamos como fallback
      if (apiCache.users) {
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
      } catch (e) {
        console.error('Error al leer visitas de localStorage:', e);
      }
    }
    
    // Verificar si tenemos datos en caché recientes
    const now = Date.now();
    if (apiCache.visits && (now - apiCache.lastFetched.visits < CACHE_DURATION)) {
      return apiCache.visits;
    }
    
    // Luego intentamos obtener datos más actualizados de la API
    const apiUrl = getApiUrl('/api/sheets?type=visits');
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error cargando visitas desde la API:', errorData.error);
      
      // Si tenemos datos en caché, aunque sean viejos, los usamos
      if (apiCache.visits) {
        return apiCache.visits;
      }
      
      return localVisits;
    }
    
    const data = await response.json();
    const apiVisits = data.visits || [];
    
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
  // Siempre guardamos en localStorage como respaldo/caché
  try {
    const storedData = localStorage.getItem('gym_counter_data');
    const data = storedData ? JSON.parse(storedData) : { visits: [] };
    data.visits = [...data.visits, visit];
    localStorage.setItem('gym_counter_data', JSON.stringify(data));
    
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
      console.error('Error guardando visita en el servidor:', errorData.error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error en la petición para guardar visita:', error);
    return false;
  }
}

// Eliminar una visita por su ID
export async function deleteVisit(visitId: string): Promise<boolean> {
  // Eliminar de localStorage
  try {
    const storedData = localStorage.getItem('gym_counter_data');
    if (storedData) {
      const data = JSON.parse(storedData);
      
      if (data.visits && Array.isArray(data.visits)) {
        data.visits = data.visits.filter((visit: GymVisit) => visit.id !== visitId);
        localStorage.setItem('gym_counter_data', JSON.stringify(data));
        
        // Actualizar también la caché en memoria
        if (apiCache.visits) {
          apiCache.visits = apiCache.visits.filter(visit => visit.id !== visitId);
        }
      }
    }
  } catch (error) {
    console.error('Error al eliminar visita de localStorage:', error);
  }
  
  // Intentar eliminar en el servidor a través de la API
  try {
    const apiUrl = getApiUrl(`/api/sheets?visitId=${visitId}`);
    
    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error eliminando visita en el servidor:', errorData.error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error en la petición para eliminar visita:', error);
    return false;
  }
} 