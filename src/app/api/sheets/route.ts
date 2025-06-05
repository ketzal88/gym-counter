import { NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

// ID de la hoja de cálculo
const SPREADSHEET_ID = '1sJmsAry32FM0A1jlyM1bWI9VyyBHedX65PyLUNVahXI';
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
    
    // Obtener usuarios
    if (type === 'users' || type === 'all') {
      try {
        const sheet = doc.sheetsByTitle['Users'];
        if (!sheet) {
          return NextResponse.json({
            users: [
              { id: '1', name: 'Gabi' },
              { id: '2', name: 'Iña' }
            ]
          });
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
        const sheet = doc.sheetsByTitle['Visits'];
        if (!sheet) {
          return NextResponse.json({ visits: [] });
        }
        
        const rows = await sheet.getRows();
        
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
  try {
    const data = await request.json();
    const { type, visit } = data;
    
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
    
    const sheet = doc.sheetsByTitle['Visits'];
    if (!sheet) {
      console.error('[API] No se encontró la hoja "Visits"');
      return NextResponse.json({ error: 'No se encontró la hoja Visits' }, { status: 500 });
    }
    
    try {
      await sheet.addRow({
        id: visit.id,
        userId: visit.userId,
        date: visit.date
      });
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