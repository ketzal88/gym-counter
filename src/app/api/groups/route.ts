import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Group } from '@/data/types';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { apiCache } from '@/lib/cache';

// Configuración de Google Sheets para grupos
const GROUPS_SPREADSHEET_ID = '1_f43T71BdLN5sky14zcdGEGp3sEEaBIjSD1v5v0myRU';
const CLIENT_EMAIL = 'gymcounter@possible-byte-351918.iam.gserviceaccount.com';

// Función para conectar con la hoja de grupos
async function getGroupsDoc() {
  try {
    const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '';
    
    if (!PRIVATE_KEY) {
      console.error('[API] Error: No se encontró la clave privada para grupos');
      return null;
    }
    
    const serviceAccountAuth = new JWT({
      email: CLIENT_EMAIL,
      key: PRIVATE_KEY,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    
    const doc = new GoogleSpreadsheet(GROUPS_SPREADSHEET_ID, serviceAccountAuth);
    await doc.loadInfo();
    return doc;
  } catch (error) {
    console.error('[API] Error conectando con Google Sheets de grupos:', error);
    return null;
  }
}

// GET /api/groups - Obtener grupos del usuario
export async function GET() {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar cache primero
    const cacheKey = `groups_${session.user.email}`;
    const cachedGroups = apiCache.get<Group[]>(cacheKey);
    if (cachedGroups) {
      return NextResponse.json({ groups: cachedGroups });
    }

    // Intentar leer desde Google Sheets primero
    try {
      const doc = await getGroupsDoc();
      if (doc) {
        // Buscar hoja de grupos
        let groupsSheet = doc.sheetsByTitle['Groups'];
        if (!groupsSheet) {
          // Crear hoja si no existe
          groupsSheet = await doc.addSheet({
            title: 'Groups',
            headerValues: ['id', 'name', 'description', 'adminId', 'members', 'createdAt', 'isPublic']
          });
        }

        const rows = await groupsSheet.getRows();
        const userGroups = rows.filter(row => {
          const members = row.get('members');
          return members && members.includes(session.user?.email);
        }).map(row => ({
          id: row.get('id'),
          name: row.get('name'),
          description: row.get('description'),
          adminId: row.get('adminId'),
          members: row.get('members').split(','),
          createdAt: new Date(row.get('createdAt')),
          isPublic: row.get('isPublic') === 'true'
        }));

        // Guardar en cache por 2 minutos
        apiCache.set(cacheKey, userGroups, 120000);

        return NextResponse.json({ groups: userGroups });
      }
    } catch (error) {
      console.error('[API] Error leyendo grupos desde Google Sheets:', error);
    }

    // Fallback: retornar array vacío
    return NextResponse.json({ groups: [] });

  } catch (error) {
    console.error('[API] Error obteniendo grupos:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST /api/groups - Crear nuevo grupo
export async function POST(request: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { name, description, isPublic = false } = await request.json();

    // Validaciones básicas
    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'El nombre del grupo es requerido' }, { status: 400 });
    }

    const groupId = Date.now().toString();
    const newGroup: Group = {
      id: groupId,
      name: name.trim(),
      description: description?.trim(),
      adminId: session.user?.email,
      members: [session.user?.email],
      createdAt: new Date(),
      isPublic: isPublic
    };

    // Intentar guardar en Google Sheets
    try {
      const doc = await getGroupsDoc();
      if (doc) {
        let groupsSheet = doc.sheetsByTitle['Groups'];
        if (!groupsSheet) {
          groupsSheet = await doc.addSheet({
            title: 'Groups',
            headerValues: ['id', 'name', 'description', 'adminId', 'members', 'createdAt', 'isPublic']
          });
        }

        await groupsSheet.addRow({
          id: newGroup.id,
          name: newGroup.name,
          description: newGroup.description || '',
          adminId: newGroup.adminId,
          members: newGroup.members.join(','),
          createdAt: newGroup.createdAt.toISOString(),
          isPublic: newGroup.isPublic.toString()
        });

        return NextResponse.json({ 
          group: newGroup,
          message: 'Grupo creado exitosamente' 
        }, { status: 201 });
      }
    } catch (error) {
      console.error('[API] Error guardando grupo en Google Sheets:', error);
    }

    return NextResponse.json({ error: 'Error al crear el grupo' }, { status: 500 });

  } catch (error) {
    console.error('[API] Error creando grupo:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// PUT /api/groups - Actualizar grupo (agregar/quitar miembros)
export async function PUT(request: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { groupId, action, memberEmail } = await request.json();

    if (!groupId || !action || !memberEmail) {
      return NextResponse.json({ error: 'Faltan parámetros requeridos' }, { status: 400 });
    }

    try {
      const doc = await getGroupsDoc();
      if (doc) {
        const groupsSheet = doc.sheetsByTitle['Groups'];
        if (!groupsSheet) {
          return NextResponse.json({ error: 'Hoja de grupos no encontrada' }, { status: 404 });
        }

        const rows = await groupsSheet.getRows();
        const groupRow = rows.find(row => row.get('id') === groupId);

        if (!groupRow) {
          return NextResponse.json({ error: 'Grupo no encontrado' }, { status: 404 });
        }

        // Verificar que el usuario es admin del grupo
        if (groupRow.get('adminId') !== session.user?.email) {
          return NextResponse.json({ error: 'No tienes permisos para modificar este grupo' }, { status: 403 });
        }

        const currentMembers = groupRow.get('members').split(',').filter((m: string) => m.trim());
        
        if (action === 'add') {
          if (!currentMembers.includes(memberEmail)) {
            currentMembers.push(memberEmail);
          }
        } else if (action === 'remove') {
          const index = currentMembers.indexOf(memberEmail);
          if (index > -1) {
            currentMembers.splice(index, 1);
          }
        }

        groupRow.set('members', currentMembers.join(','));
        await groupRow.save();

        return NextResponse.json({ 
          message: `Miembro ${action === 'add' ? 'agregado' : 'removido'} exitosamente` 
        });
      }
    } catch (error) {
      console.error('[API] Error actualizando grupo:', error);
    }

    return NextResponse.json({ error: 'Error al actualizar el grupo' }, { status: 500 });

  } catch (error) {
    console.error('[API] Error actualizando grupo:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
