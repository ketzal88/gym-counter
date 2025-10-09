import { NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { apiCache } from '@/lib/cache';

// IDs de las hojas de cálculo
const MAIN_SPREADSHEET_ID = '1_f43T71BdLN5sky14zcdGEGp3sEEaBIjSD1v5v0myRU'; // Users, Groups, Invitations
const DATA_SPREADSHEET_ID = '1n4_Jb5VF-b9aPkiteeA6JCzDYK6SP6AdGHZ1PvcfhnQ'; // Visits, Body measurements
const CLIENT_EMAIL = 'gymcounter@possible-byte-351918.iam.gserviceaccount.com';

// Inicializar conexión a Google Sheets con cache
async function getDoc(spreadsheetId: string) {
  // Verificar cache primero
  const cacheKey = `google_sheets_doc_${spreadsheetId}`;
  const cachedDoc = apiCache.get(cacheKey);
  if (cachedDoc) {
    console.log('[API] Usando documento de Google Sheets desde cache');
    return cachedDoc as GoogleSpreadsheet;
  }

  try {
    const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '';
    
    if (!PRIVATE_KEY) {
      console.error('[API] Error: No se encontró la clave privada en las variables de entorno');
      return null;
    }
    
    const serviceAccountAuth = new JWT({
      email: CLIENT_EMAIL,
      key: PRIVATE_KEY,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    
    const doc = new GoogleSpreadsheet(spreadsheetId, serviceAccountAuth);
    await doc.loadInfo();
    
    // Cachear el documento por 2 minutos
    apiCache.set(cacheKey, doc, 120000);
    console.log('[API] Documento de Google Sheets cargado y cacheado');
    
    return doc;
  } catch (error) {
    console.error('[API] Error conectando con Google Sheets:', error);
    return null;
  }
}

// GET /api/sheets - Obtener datos
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    
    // Determinar qué documento usar según el tipo de dato
    const spreadsheetId = (type === 'users' || type === 'groups' || type === 'invitations') 
      ? MAIN_SPREADSHEET_ID 
      : DATA_SPREADSHEET_ID;
    
    const doc = await getDoc(spreadsheetId);
    if (!doc) {
      console.error('[API] No se pudo conectar con Google Sheets');
      return NextResponse.json({ error: 'No se pudo conectar con Google Sheets' }, { status: 500 });
    }

    // Verificar estructura de la hoja
    if (type === 'check_structure') {
      try {
        const sheetTitles = Object.keys(doc.sheetsByTitle);
        
        return NextResponse.json({ 
          availableSheets: sheetTitles,
          spreadsheetId: spreadsheetId,
          needsSetup: sheetTitles.length === 0
        });
      } catch (error) {
        console.error('[API] Error verificando estructura:', error);
        return NextResponse.json({ error: 'Error verificando estructura' }, { status: 500 });
      }
    }
    
    // Obtener mediciones corporales
    if (type === 'body') {
      try {
        const userId = searchParams.get('userId'); // Nuevo parámetro para filtrar por usuario
        
        // Verificar cache para mediciones corporales
        const cacheKey = `body_measurements_${userId || 'all'}`;
        const cachedData = apiCache.get(cacheKey);
        if (cachedData) {
          console.log('[API] Usando mediciones corporales desde cache');
          return NextResponse.json({ bodyMeasurements: cachedData });
        }
        
        // Buscar todas las hojas que empiecen con "Usuario_"
        const userSheetTitles = Object.keys(doc.sheetsByTitle).filter(title => 
          title.startsWith('Usuario_')
        );
        
        let allBodyMeasurements: Array<{
          id: string;
          userId: string;
          date: string;
          muscle: number;
          fat: number;
        }> = [];
        
        // Recopilar mediciones corporales de todas las hojas de usuarios
        for (const sheetTitle of userSheetTitles) {
          const sheet = doc.sheetsByTitle[sheetTitle];
          if (sheet) {
            const rows = await sheet.getRows();
            
            // Filtrar solo las filas que son mediciones corporales (type === 'body_measurement')
            const measurementsFromSheet = rows
              .filter(row => row.get('type') === 'body_measurement')
              .map(row => ({
                id: row.get('id'),
                userId: row.get('userId'),
                date: row.get('date'),
                muscle: Number(String(row.get('muscle')).replace(',', '.')),
                fat: Number(String(row.get('fat')).replace(',', '.'))
              }));
            
                    // Si se especifica userId, filtrar solo las mediciones de ese usuario
                    if (userId) {
                      const filteredMeasurements = measurementsFromSheet.filter(measurement => measurement.userId === userId);
                      allBodyMeasurements = allBodyMeasurements.concat(filteredMeasurements);
                    } else {
                      allBodyMeasurements = allBodyMeasurements.concat(measurementsFromSheet);
                    }
          }
        }
        
        // Cachear los resultados por 1 minuto
        apiCache.set(cacheKey, allBodyMeasurements, 60000);
        console.log(`[API] Mediciones corporales cacheadas para ${userId || 'todos los usuarios'}`);
        
        return NextResponse.json({ bodyMeasurements: allBodyMeasurements });
      } catch (error) {
        console.error('[API] Error obteniendo mediciones corporales:', error);
        return NextResponse.json({ bodyMeasurements: [] }, { status: 500 });
      }
    }
    
    // Obtener usuarios
    if (type === 'users' || type === 'all') {
      try {
        console.log('[API] Hojas disponibles:', Object.keys(doc.sheetsByTitle));
        const sheet = doc.sheetsByTitle['Users'];
        if (!sheet) {
          console.log('[API] No se encontró la hoja "Users"');
          return NextResponse.json({ users: [] });
        }
        
        const rows = await sheet.getRows();
        
        const users = rows.map(row => ({
          id: row.get('id'),
          name: row.get('name'),
          email: row.get('email')
        }));
        
        console.log('[API] Usuarios encontrados:', users.length);
        
        if (type === 'users') {
          return NextResponse.json({ users });
        }
      } catch (error) {
        console.error('[API] Error obteniendo usuarios:', error);
        if (type === 'users') {
          return NextResponse.json({ users: [] });
        }
      }
    }
    
    // Obtener visitas
    if (type === 'visits' || type === 'all') {
      try {
        const userId = searchParams.get('userId'); // Nuevo parámetro para filtrar por usuario
        
        // Verificar cache para visitas
        const cacheKey = `visits_${userId || 'all'}`;
        const cachedData = apiCache.get(cacheKey);
        if (cachedData) {
          console.log('[API] Usando visitas desde cache');
          if (type === 'visits') {
            return NextResponse.json({ visits: cachedData });
          } else {
            return NextResponse.json({ 
              users: [], 
              visits: cachedData 
            });
          }
        }
        
        // Buscar todas las hojas que empiecen con "Usuario_"
        const userSheetTitles = Object.keys(doc.sheetsByTitle).filter(title => 
          title.startsWith('Usuario_')
        );
        
        let allVisits: Array<{
          id: string;
          userId: string;
          date: string;
        }> = [];
        
        // Recopilar visitas de todas las hojas de usuarios
        for (const sheetTitle of userSheetTitles) {
          const sheet = doc.sheetsByTitle[sheetTitle];
          if (sheet) {
            const rows = await sheet.getRows();
            
            // Filtrar solo las filas que son visitas (type === 'visit')
            const visitsFromSheet = rows
              .filter(row => row.get('type') === 'visit')
              .map(row => ({
                id: row.get('id'),
                userId: row.get('userId'),
                date: row.get('date')
              }));
            
                    // Si se especifica userId, filtrar solo las visitas de ese usuario
                    if (userId) {
                      const filteredVisits = visitsFromSheet.filter(visit => visit.userId === userId);
                      allVisits = allVisits.concat(filteredVisits);
                    } else {
                      allVisits = allVisits.concat(visitsFromSheet);
                    }
          }
        }
        
        // Cachear los resultados por 1 minuto
        apiCache.set(cacheKey, allVisits, 60000);
        console.log(`[API] Visitas cacheadas para ${userId || 'todos los usuarios'}`);
        
        if (type === 'visits') {
          return NextResponse.json({ visits: allVisits });
        } else {
          return NextResponse.json({ 
            users: [], 
            visits: allVisits 
          });
        }
      } catch (error) {
        console.error('[API] Error obteniendo visitas:', error);
        return NextResponse.json({ visits: [] }, { status: 500 });
      }
    }
    
    return NextResponse.json({ error: 'Tipo de datos no válido' }, { status: 400 });
  } catch (error) {
    console.error('[API] Error en la ruta GET /api/sheets:', error);
    return NextResponse.json({ error: 'Error interno del servidor', details: String(error) }, { status: 500 });
  }
}

// POST /api/sheets - Guardar datos
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { type, visit, bodyMeasurement, userId, userName } = data;
    
    // Limpiar cache manualmente
    if (type === 'clear_cache') {
      try {
        apiCache.clear();
        console.log('[API] Cache limpiado manualmente');
        return NextResponse.json({ 
          success: true, 
          message: 'Cache limpiado exitosamente' 
        });
      } catch (error) {
        console.error('[API] Error limpiando cache:', error);
        return NextResponse.json({ 
          error: 'Error limpiando cache', 
          details: String(error) 
        }, { status: 500 });
      }
    }

    // Arreglar IDs de usuario inconsistentes
    if (type === 'fix_user_ids') {
      try {
        const doc = await getDoc(DATA_SPREADSHEET_ID);
        if (!doc) {
          console.error('[API] No se pudo conectar con Google Sheets para arreglar IDs');
          return NextResponse.json({ error: 'No se pudo conectar con Google Sheets' }, { status: 500 });
        }

        const availableSheets = Object.keys(doc.sheetsByTitle).filter(title => 
          title.startsWith('Usuario_')
        );

        const sheetMappings = availableSheets.map(sheetTitle => {
          const match = sheetTitle.match(/^Usuario_(.+?)_(.+)$/);
          if (match) {
            return {
              sheetTitle,
              extractedUserId: match[1],
              userName: match[2]
            };
          }
          return null;
        }).filter(Boolean);

        console.log('[API] Mapeo de hojas encontrado:', sheetMappings);

        return NextResponse.json({ 
          success: true, 
          availableSheets,
          sheetMappings,
          message: 'Información de hojas obtenida exitosamente' 
        });
      } catch (error) {
        console.error('[API] Error obteniendo información de hojas:', error);
        return NextResponse.json({ 
          error: 'Error obteniendo información de hojas', 
          details: String(error) 
        }, { status: 500 });
      }
    }

    // Configurar hojas básicas si no existen
    if (type === 'setup_sheets') {
      try {
        const doc = await getDoc(DATA_SPREADSHEET_ID);
        if (!doc) {
          console.error('[API] No se pudo conectar con Google Sheets para configurar hojas');
          return NextResponse.json({ error: 'No se pudo conectar con Google Sheets' }, { status: 500 });
        }
        
        const createdSheets = [];
        
        // Crear hoja de usuarios si no existe
        if (!doc.sheetsByTitle['Users']) {
          await doc.addSheet({
            title: 'Users',
            headerValues: ['id', 'name', 'email']
          });
          createdSheets.push('Users');
        }
        
        // Crear hoja de visitas si no existe
        if (!doc.sheetsByTitle['Visits']) {
          await doc.addSheet({
            title: 'Visits',
            headerValues: ['id', 'userId', 'date']
          });
          createdSheets.push('Visits');
        }
        
        // Crear hoja de mediciones corporales si no existe
        if (!doc.sheetsByTitle['BodyMeasurements']) {
          await doc.addSheet({
            title: 'BodyMeasurements',
            headerValues: ['id', 'userId', 'date', 'muscle', 'fat']
          });
          createdSheets.push('BodyMeasurements');
        }
        
        return NextResponse.json({ 
          success: true, 
          createdSheets,
          message: `Hojas configuradas: ${createdSheets.join(', ') || 'Todas las hojas ya existían'}`
        });
      } catch (error) {
        console.error('[API] Error configurando hojas:', error);
        return NextResponse.json({ 
          error: 'Error configurando hojas', 
          details: String(error) 
        }, { status: 500 });
      }
    }

    // Crear hoja para nuevo usuario
    if (type === 'create_user_sheet' && userId && userName) {
      try {
        const doc = await getDoc(DATA_SPREADSHEET_ID);
        if (!doc) {
          console.error('[API] No se pudo conectar con Google Sheets para crear hoja de usuario');
          return NextResponse.json({ error: 'No se pudo conectar con Google Sheets' }, { status: 500 });
        }
        
        // Crear una nueva hoja dentro del mismo spreadsheet
        const sheetTitle = `Usuario_${userId}_${userName.replace(/\s+/g, '_')}`;
        
        // Verificar si la hoja ya existe
        let userSheet = doc.sheetsByTitle[sheetTitle];
        if (!userSheet) {
          userSheet = await doc.addSheet({
            title: sheetTitle,
            headerValues: ['id', 'userId', 'date', 'type', 'muscle', 'fat']
          });
        } else {
        }
        
        return NextResponse.json({ 
          success: true, 
          sheetId: userSheet.sheetId,
          sheetTitle: sheetTitle
        });
      } catch (error) {
        console.error('[API] Error creando hoja para usuario:', error);
        return NextResponse.json({ 
          error: 'Error creando hoja para usuario', 
          details: String(error) 
        }, { status: 500 });
      }
    }
    
    if (type === 'body') {
      if (!bodyMeasurement || !bodyMeasurement.id || !bodyMeasurement.userId || !bodyMeasurement.date) {
        console.error('[API] Datos de medición corporal incompletos:', JSON.stringify(bodyMeasurement));
        return NextResponse.json({ error: 'Datos de medición corporal incompletos' }, { status: 400 });
      }
      const doc = await getDoc(DATA_SPREADSHEET_ID);
      if (!doc) {
        console.error('[API] No se pudo conectar con Google Sheets para guardar la medición corporal');
        return NextResponse.json({ error: 'No se pudo conectar con Google Sheets' }, { status: 500 });
      }
      // Buscar la hoja personal del usuario
      let userSheets = Object.keys(doc.sheetsByTitle).filter(title => {
        if (!title.startsWith('Usuario_')) return false;
        
        // Extraer el userId del título de la hoja
        // Formato esperado: Usuario_{userId}_{userName}
        const match = title.match(/^Usuario_(.+?)_/);
        if (!match) return false;
        
        const sheetUserId = match[1];
        return sheetUserId === bodyMeasurement.userId;
      });

      // Si no se encuentra la hoja con el ID exacto, buscar por nombre de usuario
      if (userSheets.length === 0) {
        console.log(`[API] No se encontró hoja con ID exacto ${bodyMeasurement.userId}, buscando por nombre...`);
        
        // Intentar buscar por patrones conocidos
        const possiblePatterns = [
          `Usuario_3_gab`, // Patrón específico para Gabi
          `Usuario_${bodyMeasurement.userId}_gab`,
          `Usuario_${bodyMeasurement.userId}_Gabi`
        ];
        
        for (const pattern of possiblePatterns) {
          if (doc.sheetsByTitle[pattern]) {
            userSheets = [pattern];
            console.log(`[API] Encontrada hoja usando patrón: ${pattern}`);
            break;
          }
        }
      }
      
      if (userSheets.length === 0) {
        console.error('[API] No se encontró la hoja personal del usuario:', bodyMeasurement.userId);
        return NextResponse.json({ error: 'No se encontró la hoja personal del usuario' }, { status: 500 });
      }
      
      const userSheetTitle = userSheets[0];
      const sheet = doc.sheetsByTitle[userSheetTitle];
      
      try {
        await sheet.addRow({
          id: bodyMeasurement.id,
          userId: bodyMeasurement.userId,
          date: bodyMeasurement.date,
          type: 'body_measurement',
          muscle: bodyMeasurement.muscle,
          fat: bodyMeasurement.fat
        });
        
        // Invalidar cache de mediciones corporales
        apiCache.delete(`body_measurements_${bodyMeasurement.userId}`);
        apiCache.delete('body_measurements_all');
        console.log(`[API] Cache invalidado para mediciones corporales del usuario ${bodyMeasurement.userId}`);
        
        return NextResponse.json({ success: true });
      } catch (addRowError) {
        console.error('[API] Error al añadir fila a la hoja personal:', addRowError);
        return NextResponse.json({
          error: 'Error al guardar medición corporal',
          details: String(addRowError)
        }, { status: 500 });
      }
    }
    
    if (type !== 'visit') {
      console.error('[API] Tipo de datos no soportado:', type);
      return NextResponse.json({ error: 'Tipo de datos no soportado' }, { status: 400 });
    }
    
    if (!visit || !visit.id || !visit.userId || !visit.date) {
      console.error('[API] Datos de visita incompletos:', JSON.stringify(visit));
      return NextResponse.json({ error: 'Datos de visita incompletos' }, { status: 400 });
    }
    
    const doc = await getDoc(DATA_SPREADSHEET_ID);
    if (!doc) {
      console.error('[API] No se pudo conectar con Google Sheets para guardar la visita');
      return NextResponse.json({ error: 'No se pudo conectar con Google Sheets' }, { status: 500 });
    }
    
    // Buscar la hoja personal del usuario
    // Necesitamos obtener el nombre del usuario para construir el nombre de la hoja
    // Buscar hojas que empiecen con "Usuario_" seguido del userId exacto
    let userSheets = Object.keys(doc.sheetsByTitle).filter(title => {
      if (!title.startsWith('Usuario_')) return false;
      
      // Extraer el userId del título de la hoja
      // Formato esperado: Usuario_{userId}_{userName}
      const match = title.match(/^Usuario_(.+?)_/);
      if (!match) return false;
      
      const sheetUserId = match[1];
      return sheetUserId === visit.userId;
    });

    // Si no se encuentra la hoja con el ID exacto, buscar por nombre de usuario
    // Esto es una solución temporal para casos donde el ID no coincide
    if (userSheets.length === 0) {
      console.log(`[API] No se encontró hoja con ID exacto ${visit.userId}, buscando por nombre...`);
      
      // Intentar buscar por patrones conocidos
      const possiblePatterns = [
        `Usuario_3_gab`, // Patrón específico para Gabi
        `Usuario_${visit.userId}_gab`,
        `Usuario_${visit.userId}_Gabi`
      ];
      
      for (const pattern of possiblePatterns) {
        if (doc.sheetsByTitle[pattern]) {
          userSheets = [pattern];
          console.log(`[API] Encontrada hoja usando patrón: ${pattern}`);
          break;
        }
      }
    }
    
    if (userSheets.length === 0) {
      console.error('[API] No se encontró la hoja personal del usuario:', visit.userId);
      console.error('[API] Hojas disponibles:', Object.keys(doc.sheetsByTitle).filter(title => title.startsWith('Usuario_')));
      return NextResponse.json({ error: 'No se encontró la hoja personal del usuario' }, { status: 500 });
    }
    
    const userSheetTitle = userSheets[0];
    const sheet = doc.sheetsByTitle[userSheetTitle];
    
    console.log(`[API] Guardando visita para usuario ${visit.userId} en hoja: ${userSheetTitle}`);
    
    try {
      await sheet.addRow({
        id: visit.id,
        userId: visit.userId,
        date: visit.date,
        type: 'visit',
        muscle: '',
        fat: ''
      });
      
      // Invalidar cache de visitas
      apiCache.delete(`visits_${visit.userId}`);
      apiCache.delete('visits_all');
      console.log(`[API] Cache invalidado para visitas del usuario ${visit.userId}`);
      
      return NextResponse.json({ success: true });
    } catch (addRowError) {
      console.error('[API] Error al añadir fila a la hoja personal:', addRowError);
      return NextResponse.json({ 
        error: 'Error al guardar visita', 
        details: String(addRowError) 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('[API] Error en la ruta POST /api/sheets:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor', 
      details: String(error) 
    }, { status: 500 });
  }
}

// DELETE /api/sheets - Eliminar visita
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const visitId = searchParams.get('visitId');
    
    if (!visitId) {
      console.error('[API] ID de visita no proporcionado');
      return NextResponse.json({ error: 'ID de visita no proporcionado' }, { status: 400 });
    }
    
    const doc = await getDoc(DATA_SPREADSHEET_ID);
    if (!doc) {
      console.error('[API] No se pudo conectar con Google Sheets para eliminar la visita');
      return NextResponse.json({ error: 'No se pudo conectar con Google Sheets' }, { status: 500 });
    }
    
    // Buscar en todas las hojas de usuario
    const userSheetTitles = Object.keys(doc.sheetsByTitle).filter(title => 
      title.startsWith('Usuario_')
    );
    
    let rowToDelete = null;
    let targetSheet = null;
    
    // Buscar la visita en todas las hojas de usuario
    for (const sheetTitle of userSheetTitles) {
      const sheet = doc.sheetsByTitle[sheetTitle];
      if (sheet) {
        const rows = await sheet.getRows();
        const foundRow = rows.find(row => row.get('id') === visitId);
        
        if (foundRow) {
          rowToDelete = foundRow;
          targetSheet = sheet;
          console.log(`[API] Visita encontrada en hoja: ${sheetTitle}`);
          break;
        }
      }
    }
    
    if (!rowToDelete) {
      console.error(`[API] No se encontró la visita con ID: ${visitId} en ninguna hoja de usuario`);
      return NextResponse.json({ error: 'No se encontró la visita' }, { status: 404 });
    }
    
    try {
      await rowToDelete.delete();
      
      // Invalidar cache de visitas
      apiCache.delete('visits_all');
      // También invalidar cache específico si podemos determinar el usuario
      const userId = rowToDelete.get('userId');
      if (userId) {
        apiCache.delete(`visits_${userId}`);
      }
      
      console.log(`[API] Visita ${visitId} eliminada exitosamente`);
      return NextResponse.json({ success: true });
    } catch (deleteError) {
      console.error('[API] Error al eliminar la visita:', deleteError);
      return NextResponse.json({ 
        error: 'Error al eliminar la visita', 
        details: String(deleteError) 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('[API] Error en la ruta DELETE /api/sheets:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor', 
      details: String(error) 
    }, { status: 500 });
  }
} 