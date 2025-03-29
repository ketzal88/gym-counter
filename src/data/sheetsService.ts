import { GoogleSpreadsheet } from 'google-spreadsheet';
import { GymVisit, User } from './types';

// ID de la hoja de cálculo (tomado de la URL)
const SPREADSHEET_ID = '1sJmsAry32FM0A1jlyM1bWI9VyyBHedX65PyLUNVahXI';

// Para una integración completa necesitarías crear credenciales de servicio en Google Cloud
// Por ahora usaremos localStorage como alternativa temporal

let doc: GoogleSpreadsheet | null = null;

// Inicializar la conexión a la hoja de cálculo
export async function initializeSheet() {
  try {
    // Obtener la API key desde las variables de entorno
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    
    if (!apiKey) {
      console.error('Error: API Key no encontrada en variables de entorno.');
      return false;
    }
    
    doc = new GoogleSpreadsheet(SPREADSHEET_ID, {
      apiKey
    });
    
    console.log('Intentando conectar con la hoja de cálculo...');
    await doc.loadInfo();
    
    return true;
  } catch (error) {
    console.error('Error al conectar con Google Sheets:', error);
    return false;
  }
}

// Estructurar las hojas que necesitamos
export async function setupSheets() {
  if (!doc) {
    await initializeSheet();
    if (!doc) return false;
  }
  
  try {
    // Verificar si existen las hojas necesarias, y crearlas si no
    const usersSheet = doc.sheetsByTitle['Users'];
    const visitsSheet = doc.sheetsByTitle['Visits'];
    
    if (!usersSheet) {
      console.log('Creando hoja de Usuarios...');
      // Para crear hojas se necesitaría autenticación con credenciales
      // Esta parte requeriría un paso adicional de configuración
    }
    
    if (!visitsSheet) {
      console.log('Creando hoja de Visitas...');
      // Similar, requeriría autenticación
    }
    
    return true;
  } catch (error) {
    console.error('Error configurando las hojas:', error);
    return false;
  }
}

// Cargar usuarios
export async function loadUsers(): Promise<User[]> {
  // Simulamos los usuarios por defecto para la demostración
  // En la implementación completa, cargarías esto desde Google Sheets
  return [
    { id: '1', name: 'Me' },
    { id: '2', name: 'Friend' }
  ];
}

// Cargar visitas
export async function loadVisits(): Promise<GymVisit[]> {
  if (!doc) {
    const initialized = await initializeSheet();
    if (!initialized || !doc) {
      // Fallback a localStorage si no puede conectar
      const storedData = localStorage.getItem('gym_counter_data');
      if (!storedData) return [];
      try {
        const data = JSON.parse(storedData);
        return data.visits || [];
      } catch {
        return [];
      }
    }
  }
  
  try {
    const sheet = doc.sheetsByTitle['Visits'];
    if (!sheet) return [];
    
    // Cargar filas
    const rows = await sheet.getRows();
    return rows.map(row => ({
      id: row.get('id') as string,
      userId: row.get('userId') as string,
      date: row.get('date') as string
    }));
  } catch (error) {
    console.error('Error cargando visitas desde Google Sheets:', error);
    // Fallback a localStorage
    const storedData = localStorage.getItem('gym_counter_data');
    if (!storedData) return [];
    try {
      const data = JSON.parse(storedData);
      return data.visits || [];
    } catch {
      return [];
    }
  }
}

// Guardar una nueva visita
export async function saveVisit(visit: GymVisit): Promise<boolean> {
  // Siempre guardamos en localStorage como respaldo
  try {
    const storedData = localStorage.getItem('gym_counter_data');
    const data = storedData ? JSON.parse(storedData) : { users: [], visits: [] };
    data.visits = [...data.visits, visit];
    localStorage.setItem('gym_counter_data', JSON.stringify(data));
  } catch (error) {
    console.error('Error al guardar en localStorage:', error);
  }
  
  // Intentar guardar en Google Sheets
  if (!doc) {
    const initialized = await initializeSheet();
    if (!initialized || !doc) return false;
  }
  
  try {
    const sheet = doc.sheetsByTitle['Visits'];
    if (!sheet) return false;
    
    // Agregar una nueva fila
    await sheet.addRow({
      id: visit.id,
      userId: visit.userId,
      date: visit.date
    });
    
    console.log('Visita guardada correctamente en Google Sheets');
    return true;
  } catch (error) {
    console.error('Error guardando en Google Sheets:', error);
    return false;
  }
} 