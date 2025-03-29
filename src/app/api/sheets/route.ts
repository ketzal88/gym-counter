import { NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { GymVisit, User } from '@/data/types';

// ID de la hoja de cálculo
const SPREADSHEET_ID = '1sJmsAry32FM0A1jlyM1bWI9VyyBHedX65PyLUNVahXI';
const CLIENT_EMAIL = 'gymcounter@possible-byte-351918.iam.gserviceaccount.com';

// Inicializar conexión a Google Sheets
async function getDoc() {
  try {
    const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '';
    
    if (!PRIVATE_KEY) {
      console.error('Error: No se encontró la clave privada en las variables de entorno');
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
    console.error('Error conectando con Google Sheets:', error);
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
      return NextResponse.json({ error: 'No se pudo conectar con Google Sheets' }, { status: 500 });
    }
    
    // Obtener usuarios
    if (type === 'users' || type === 'all') {
      try {
        const sheet = doc.sheetsByTitle['Users'];
        if (!sheet) {
          return NextResponse.json({
            users: [
              { id: '1', name: 'Me' },
              { id: '2', name: 'Friend' }
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
        console.error('Error obteniendo usuarios:', error);
        if (type === 'users') {
          return NextResponse.json({
            users: [
              { id: '1', name: 'Me' },
              { id: '2', name: 'Friend' }
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
              { id: '1', name: 'Me' },
              { id: '2', name: 'Friend' }
            ], 
            visits 
          });
        }
      } catch (error) {
        console.error('Error obteniendo visitas:', error);
        return NextResponse.json({ visits: [] }, { status: 500 });
      }
    }
    
    return NextResponse.json({ error: 'Tipo de datos no válido' }, { status: 400 });
  } catch (error) {
    console.error('Error en la ruta GET /api/sheets:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST /api/sheets - Guardar datos
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { type, visit } = data;
    
    if (type !== 'visit') {
      return NextResponse.json({ error: 'Tipo de datos no soportado' }, { status: 400 });
    }
    
    if (!visit || !visit.id || !visit.userId || !visit.date) {
      return NextResponse.json({ error: 'Datos de visita incompletos' }, { status: 400 });
    }
    
    const doc = await getDoc();
    if (!doc) {
      return NextResponse.json({ error: 'No se pudo conectar con Google Sheets' }, { status: 500 });
    }
    
    const sheet = doc.sheetsByTitle['Visits'];
    if (!sheet) {
      return NextResponse.json({ error: 'No se encontró la hoja Visits' }, { status: 500 });
    }
    
    await sheet.addRow({
      id: visit.id,
      userId: visit.userId,
      date: visit.date
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error en la ruta POST /api/sheets:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
} 