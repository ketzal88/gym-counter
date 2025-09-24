import { NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

// ID de la hoja de cálculo (hoja de pruebas)
const SPREADSHEET_ID = '1n4_Jb5VF-b9aPkiteeA6JCzDYK6SP6AdGHZ1PvcfhnQ';
const CLIENT_EMAIL = 'gymcounter@possible-byte-351918.iam.gserviceaccount.com';

// Inicializar conexión a Google Sheets
async function getDoc() {
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
    
    const doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);
    await doc.loadInfo();
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
    
    const doc = await getDoc();
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
          spreadsheetId: SPREADSHEET_ID,
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
        
        return NextResponse.json({ bodyMeasurements: allBodyMeasurements });
      } catch (error) {
        console.error('[API] Error obteniendo mediciones corporales:', error);
        return NextResponse.json({ bodyMeasurements: [] }, { status: 500 });
      }
    }
    
    // Obtener registros personales (RMs)
    if (type === 'personal_records') {
      try {
        const userId = searchParams.get('userId');
        
        console.log('[API] Obteniendo registros personales para userId:', userId);
        
        if (!userId) {
          console.log('[API] No se especificó userId, retornando array vacío');
          return NextResponse.json({ personalRecords: [] });
        }
        
        // Buscar solo la hoja del usuario específico
        const userSheetTitles = Object.keys(doc.sheetsByTitle).filter(title => 
          title.startsWith('Usuario_') && title.includes(userId)
        );
        
        console.log('[API] Hoja del usuario encontrada:', userSheetTitles);
        
        let allPersonalRecords: Array<{
          id: string;
          userId: string;
          date: string;
          exercise: string;
          weight: number;
          reps?: number;
          notes?: string;
        }> = [];
        
        // Solo procesar la hoja del usuario específico
        for (const sheetTitle of userSheetTitles) {
          const sheet = doc.sheetsByTitle[sheetTitle];
          if (sheet) {
            const rows = await sheet.getRows();
            
            console.log(`[API] Procesando hoja ${sheetTitle}, total filas: ${rows.length}`);
            
            // Filtrar solo las filas que son registros personales (type === 'personal_record')
            const personalRecordRows = rows.filter(row => row.get('type') === 'personal_record');
            console.log(`[API] Filas de personal_record encontradas en ${sheetTitle}:`, personalRecordRows.length);
            
            const recordsFromSheet = personalRecordRows.map(row => {
              const record = {
                id: row.get('id'),
                userId: row.get('userId'),
                date: row.get('date'),
                exercise: row.get('exercise'),
                weight: Number(String(row.get('weight')).replace(',', '.')),
                reps: row.get('reps') ? Number(String(row.get('reps')).replace(',', '.')) : undefined,
                notes: row.get('notes') || undefined
              };
              console.log(`[API] Procesando registro:`, record);
              return record;
            });
            
            allPersonalRecords = allPersonalRecords.concat(recordsFromSheet);
          }
        }
        
        console.log('[API] Total registros personales encontrados:', allPersonalRecords.length);
        console.log('[API] Registros personales:', allPersonalRecords);
        
        return NextResponse.json({ personalRecords: allPersonalRecords });
      } catch (error) {
        console.error('[API] Error obteniendo registros personales:', error);
        return NextResponse.json({ personalRecords: [] }, { status: 500 });
      }
    }
    
    // Obtener usuarios
    if (type === 'users' || type === 'all') {
      try {
        const sheet = doc.sheetsByTitle['Users'];
        if (!sheet) {
          return NextResponse.json({ users: [] });
        }
        
        const rows = await sheet.getRows();
        
        const users = rows.map(row => ({
          id: row.get('id'),
          name: row.get('name'),
        }));
        
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
    
    // Configurar hojas básicas si no existen
    if (type === 'setup_sheets') {
      try {
        const doc = await getDoc();
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
        const doc = await getDoc();
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
      const doc = await getDoc();
      if (!doc) {
        console.error('[API] No se pudo conectar con Google Sheets para guardar la medición corporal');
        return NextResponse.json({ error: 'No se pudo conectar con Google Sheets' }, { status: 500 });
      }
      // Buscar la hoja personal del usuario
      const userSheets = Object.keys(doc.sheetsByTitle).filter(title => 
        title.startsWith('Usuario_') && title.includes(bodyMeasurement.userId)
      );
      
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
        return NextResponse.json({ success: true });
      } catch (addRowError) {
        console.error('[API] Error al añadir fila a la hoja personal:', addRowError);
        return NextResponse.json({
          error: 'Error al guardar medición corporal',
          details: String(addRowError)
        }, { status: 500 });
      }
    }
    
    // Guardar registro personal (RM)
    if (type === 'personal_record') {
      const { personalRecord } = data;
      
      console.log('[API] Datos recibidos para personal_record:', JSON.stringify(personalRecord));
      
      if (!personalRecord || !personalRecord.id || !personalRecord.userId || !personalRecord.date || !personalRecord.exercise || !personalRecord.weight) {
        console.error('[API] Datos de registro personal incompletos:', JSON.stringify(personalRecord));
        return NextResponse.json({ error: 'Datos de registro personal incompletos' }, { status: 400 });
      }
      
      const doc = await getDoc();
      if (!doc) {
        console.error('[API] No se pudo conectar con Google Sheets para guardar el registro personal');
        return NextResponse.json({ error: 'No se pudo conectar con Google Sheets' }, { status: 500 });
      }
      
      // Buscar la hoja personal del usuario (misma lógica que body measurements)
      const userSheets = Object.keys(doc.sheetsByTitle).filter(title => 
        title.startsWith('Usuario_') && title.includes(personalRecord.userId)
      );
      
      console.log('[API] Hojas encontradas para userId', personalRecord.userId, ':', userSheets);
      
      if (userSheets.length === 0) {
        console.error('[API] No se encontró la hoja personal del usuario:', personalRecord.userId);
        return NextResponse.json({ error: 'No se encontró la hoja personal del usuario' }, { status: 500 });
      }
      
      // Usar la misma lógica que body measurements para encontrar la hoja correcta
      let userSheetTitle = '';
      for (const sheetTitle of userSheets) {
        const sheet = doc.sheetsByTitle[sheetTitle];
        if (sheet) {
          const rows = await sheet.getRows();
          // Verificar si esta hoja tiene datos del usuario correcto
          const hasUserData = rows.some(row => row.get('userId') === personalRecord.userId);
          if (hasUserData) {
            userSheetTitle = sheetTitle;
            break;
          }
        }
      }
      
      // Si no encontramos una hoja con datos del usuario, usar la primera disponible
      if (!userSheetTitle && userSheets.length > 0) {
        userSheetTitle = userSheets[0];
      }
      
      console.log('[API] Usando hoja:', userSheetTitle);
      const sheet = doc.sheetsByTitle[userSheetTitle];
      
      try {
        const rowData = {
          id: personalRecord.id,
          userId: personalRecord.userId,
          date: personalRecord.date,
          type: 'personal_record',
          exercise: personalRecord.exercise,
          weight: personalRecord.weight,
          reps: personalRecord.reps || '',
          notes: personalRecord.notes || ''
        };
        
        console.log('[API] Guardando fila en Google Sheets:', JSON.stringify(rowData));
        
        await sheet.addRow(rowData);
        
        console.log('[API] Registro personal guardado exitosamente');
        return NextResponse.json({ success: true });
      } catch (addRowError) {
        console.error('[API] Error al añadir fila a la hoja personal:', addRowError);
        return NextResponse.json({
          error: 'Error al guardar registro personal',
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
    
    const doc = await getDoc();
    if (!doc) {
      console.error('[API] No se pudo conectar con Google Sheets para guardar la visita');
      return NextResponse.json({ error: 'No se pudo conectar con Google Sheets' }, { status: 500 });
    }
    
    // Buscar la hoja personal del usuario
    // Necesitamos obtener el nombre del usuario para construir el nombre de la hoja
    // Por ahora, vamos a buscar todas las hojas que empiecen con "Usuario_" y contengan el userId
    const userSheets = Object.keys(doc.sheetsByTitle).filter(title => 
      title.startsWith('Usuario_') && title.includes(visit.userId)
    );
    
    if (userSheets.length === 0) {
      console.error('[API] No se encontró la hoja personal del usuario:', visit.userId);
      return NextResponse.json({ error: 'No se encontró la hoja personal del usuario' }, { status: 500 });
    }
    
    const userSheetTitle = userSheets[0];
    const sheet = doc.sheetsByTitle[userSheetTitle];
    
    try {
      await sheet.addRow({
        id: visit.id,
        userId: visit.userId,
        date: visit.date,
        type: 'visit',
        muscle: '',
        fat: ''
      });
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
    
    const doc = await getDoc();
    if (!doc) {
      console.error('[API] No se pudo conectar con Google Sheets para eliminar la visita');
      return NextResponse.json({ error: 'No se pudo conectar con Google Sheets' }, { status: 500 });
    }
    
    const sheet = doc.sheetsByTitle['Visits'];
    if (!sheet) {
      console.error('[API] No se encontró la hoja "Visits"');
      return NextResponse.json({ error: 'No se encontró la hoja Visits' }, { status: 500 });
    }
    
    const rows = await sheet.getRows();
    const rowToDelete = rows.find(row => row.get('id') === visitId);
    
    if (!rowToDelete) {
      console.error(`[API] No se encontró la visita con ID: ${visitId}`);
      return NextResponse.json({ error: 'No se encontró la visita' }, { status: 404 });
    }
    
    try {
      await rowToDelete.delete();
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