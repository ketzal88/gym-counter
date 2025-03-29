import { GymVisit, User } from './types';

// Cargar usuarios
export async function loadUsers(): Promise<User[]> {
  try {
    // Llamar a la API en lugar de conectarse directamente a Google Sheets
    const response = await fetch('/api/sheets?type=users');
    const data = await response.json();
    
    if (!response.ok) {
      console.error('Error cargando usuarios desde la API:', data.error);
      // Valores por defecto como fallback
      return [
        { id: '1', name: 'Me' },
        { id: '2', name: 'Friend' }
      ];
    }
    
    return data.users || [];
  } catch (error) {
    console.error('Error cargando usuarios:', error);
    // Valores por defecto como fallback
    return [
      { id: '1', name: 'Me' },
      { id: '2', name: 'Friend' }
    ];
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
    
    // Luego intentamos obtener datos más actualizados de la API
    const response = await fetch('/api/sheets?type=visits');
    if (!response.ok) {
      console.error('Error cargando visitas desde la API, usando datos locales');
      return localVisits;
    }
    
    const data = await response.json();
    const apiVisits = data.visits || [];
    console.log(`${apiVisits.length} visitas cargadas desde la API`);
    
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
  } catch (error) {
    console.error('Error al guardar en localStorage:', error);
  }
  
  // Intentar guardar en el servidor a través de la API
  try {
    const response = await fetch('/api/sheets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
    
    console.log('Visita guardada correctamente en el servidor');
    return true;
  } catch (error) {
    console.error('Error en la petición para guardar visita:', error);
    return false;
  }
} 