import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

// Configuración de Google Sheets para usuarios
const USERS_SPREADSHEET_ID = '1_f43T71BdLN5sky14zcdGEGp3sEEaBIjSD1v5v0myRU';
const CLIENT_EMAIL = 'gymcounter@possible-byte-351918.iam.gserviceaccount.com';

// Función para conectar con la hoja de usuarios
async function getUsersDoc() {
  try {
    const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '';
    
    if (!PRIVATE_KEY) {
      console.error('[API] Error: No se encontró la clave privada para usuarios');
      return null;
    }
    
    const serviceAccountAuth = new JWT({
      email: CLIENT_EMAIL,
      key: PRIVATE_KEY,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    
    const doc = new GoogleSpreadsheet(USERS_SPREADSHEET_ID, serviceAccountAuth);
    await doc.loadInfo();
    return doc;
  } catch (error) {
    console.error('[API] Error conectando con Google Sheets de usuarios:', error);
    return null;
  }
}

// GET /api/users/search - Buscar usuarios por email o nombre
export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ error: 'Query debe tener al menos 2 caracteres' }, { status: 400 });
    }

    try {
      const doc = await getUsersDoc();
      if (doc) {
        const sheet = doc.sheetsByIndex[0]; // Primera hoja (Hoja 1)
        const rows = await sheet.getRows();
        
        const searchTerm = query.toLowerCase().trim();
        
        const matchingUsers = rows
          .filter(row => {
            const email = row.get('email')?.toLowerCase() || '';
            const name = row.get('name')?.toLowerCase() || '';
            
            return (email.includes(searchTerm) || name.includes(searchTerm)) && 
                   email !== session.user?.email; // Excluir al usuario actual
          })
          .slice(0, 10) // Limitar a 10 resultados
          .map(row => ({
            id: row.get('id'),
            name: row.get('name'),
            email: row.get('email'),
            createdAt: new Date(row.get('createdAt'))
          }));

        return NextResponse.json({ users: matchingUsers });
      }
    } catch (error) {
      console.error('[API] Error buscando usuarios en Google Sheets:', error);
    }

    return NextResponse.json({ users: [] });

  } catch (error) {
    console.error('[API] Error buscando usuarios:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
