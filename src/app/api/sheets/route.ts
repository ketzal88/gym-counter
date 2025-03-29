import { NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

// ID de la hoja de cálculo
const SPREADSHEET_ID = '1sJmsAry32FM0A1jlyM1bWI9VyyBHedX65PyLUNVahXI';
const CLIENT_EMAIL = 'gymcounter@possible-byte-351918.iam.gserviceaccount.com';

// Inicializar conexión a Google Sheets
async function getDoc() {
  try {
    console.log('[API] Intentando obtener la clave privada desde variables de entorno');
    const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '';
    
    if (!PRIVATE_KEY) {
      console.error('[API] Error: No se encontró la clave privada en las variables de entorno');
      return null;
    }
    
    console.log('[API] Creando JWT con cuenta de servicio:', CLIENT_EMAIL);
    const serviceAccountAuth = new JWT({
      email: CLIENT_EMAIL,
      key: PRIVATE_KEY,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    
    console.log('[API] Conectando con la hoja de cálculo:', SPREADSHEET_ID);
    const doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);
    await doc.loadInfo();
    console.log('[API] Conexión exitosa. Título de la hoja:', doc.title);
    console.log('[API] Hojas disponibles:', Object.keys(doc.sheetsByTitle).join(', '));
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
    console.log(`[API] GET /api/sheets - Tipo: ${type}`);
    
    const doc = await getDoc();
    if (!doc) {
      console.error('[API] No se pudo conectar con Google Sheets');
      return NextResponse.json({ error: 'No se pudo conectar con Google Sheets' }, { status: 500 });
    }
    
    // Obtener usuarios
    if (type === 'users' || type === 'all') {
      try {
        console.log('[API] Buscando hoja "Users"');
        const sheet = doc.sheetsByTitle['Users'];
        if (!sheet) {
          console.warn('[API] No se encontró la hoja "Users", usando valores predeterminados');
          return NextResponse.json({
            users: [
              { id: '1', name: 'Gabi' },
              { id: '2', name: 'Iña' }
            ]
          });
        }
        
        console.log('[API] Obteniendo filas de la hoja "Users"');
        const rows = await sheet.getRows();
        console.log(`[API] Se encontraron ${rows.length} usuarios`);
        
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
          return NextResponse.json({
            users: [
              { id: '1', name: 'Gabi' },
              { id: '2', name: 'Iña' }
            ]
          });
        }
      }
    }
    
    // Obtener visitas
    if (type === 'visits' || type === 'all') {
      try {
        console.log('[API] Buscando hoja "Visits"');
        const sheet = doc.sheetsByTitle['Visits'];
        if (!sheet) {
          console.warn('[API] No se encontró la hoja "Visits", devolviendo lista vacía');
          return NextResponse.json({ visits: [] });
        }
        
        console.log('[API] Obteniendo filas de la hoja "Visits"');
        const rows = await sheet.getRows();
        console.log(`[API] Se encontraron ${rows.length} visitas`);
        
        const visits = rows.map(row => ({
          id: row.get('id'),
          userId: row.get('userId'),
          date: row.get('date')
        }));
        
        if (type === 'visits') {
          return NextResponse.json({ visits });
        } else {
          return NextResponse.json({ 
            users: [
              { id: '1', name: 'Gabi' },
              { id: '2', name: 'Iña' }
            ], 
            visits 
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
  console.log('[API] POST /api/sheets - Recibiendo solicitud');
  try {
    const data = await request.json();
    console.log('[API] Datos recibidos:', JSON.stringify(data));
    const { type, visit } = data;
    
    if (type !== 'visit') {
      console.error('[API] Tipo de datos no soportado:', type);
      return NextResponse.json({ error: 'Tipo de datos no soportado' }, { status: 400 });
    }
    
    if (!visit || !visit.id || !visit.userId || !visit.date) {
      console.error('[API] Datos de visita incompletos:', JSON.stringify(visit));
      return NextResponse.json({ error: 'Datos de visita incompletos' }, { status: 400 });
    }
    
    console.log('[API] Conectando con Google Sheets para guardar visita');
    const doc = await getDoc();
    if (!doc) {
      console.error('[API] No se pudo conectar con Google Sheets para guardar la visita');
      return NextResponse.json({ error: 'No se pudo conectar con Google Sheets' }, { status: 500 });
    }
    
    console.log('[API] Buscando hoja "Visits" para guardar datos');
    const sheet = doc.sheetsByTitle['Visits'];
    if (!sheet) {
      console.error('[API] No se encontró la hoja "Visits"');
      return NextResponse.json({ error: 'No se encontró la hoja Visits' }, { status: 500 });
    }
    
    console.log('[API] Agregando nueva fila con la visita:', JSON.stringify(visit));
    try {
      await sheet.addRow({
        id: visit.id,
        userId: visit.userId,
        date: visit.date
      });
      console.log('[API] Visita guardada exitosamente');
      return NextResponse.json({ success: true });
    } catch (addRowError) {
      console.error('[API] Error al añadir fila a la hoja:', addRowError);
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