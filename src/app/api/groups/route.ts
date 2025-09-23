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
        }).map(row => {
          const group = {
            id: row.get('id'),
            name: row.get('name'),
            description: row.get('description'),
            adminId: row.get('adminId'),
            members: row.get('members').split(','),
            createdAt: new Date(row.get('createdAt')),
            isPublic: row.get('isPublic') === 'true'
          };
          console.log('[DEBUG] Grupo encontrado:', group);
          return group;
        });

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

// PUT /api/groups - Actualizar grupo (agregar/quitar miembros, editar, salir)
export async function PUT(request: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { groupId, action, memberEmail, name, description, userEmail } = body;

    if (!groupId || !action) {
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

        const currentMembers = groupRow.get('members').split(',').filter((m: string) => m.trim());
        
        if (action === 'add') {
          // Agregar miembro (solo admin)
          if (groupRow.get('adminId') !== session.user?.email) {
            return NextResponse.json({ error: 'No tienes permisos para modificar este grupo' }, { status: 403 });
          }
          if (!currentMembers.includes(memberEmail)) {
            currentMembers.push(memberEmail);
          }
          groupRow.set('members', currentMembers.join(','));
          
        } else if (action === 'remove') {
          // Remover miembro (solo admin)
          if (groupRow.get('adminId') !== session.user?.email) {
            return NextResponse.json({ error: 'No tienes permisos para modificar este grupo' }, { status: 403 });
          }
          const index = currentMembers.indexOf(memberEmail);
          if (index > -1) {
            currentMembers.splice(index, 1);
          }
          groupRow.set('members', currentMembers.join(','));
          
        } else if (action === 'update') {
          // Actualizar nombre/descripción (cualquier miembro puede editar por ahora)
          const adminId = groupRow.get('adminId');
          const userEmail = session.user?.email;
          console.log('[DEBUG] Admin ID:', adminId);
          console.log('[DEBUG] User Email:', userEmail);
          console.log('[DEBUG] Are they equal?', adminId === userEmail);
          console.log('[DEBUG] Current members:', currentMembers);
          console.log('[DEBUG] Is user a member?', currentMembers.includes(userEmail));
          
          // Permitir edición si es miembro del grupo (temporalmente)
          if (!currentMembers.includes(userEmail)) {
            return NextResponse.json({ 
              error: 'No eres miembro de este grupo',
              debug: {
                adminId,
                userEmail,
                groupId,
                members: currentMembers
              }
            }, { status: 403 });
          }
          if (name) {
            groupRow.set('name', name);
          }
          if (description !== undefined) {
            groupRow.set('description', description);
          }
          
        } else if (action === 'leave') {
          // Salir del grupo (cualquier miembro)
          if (!currentMembers.includes(userEmail)) {
            return NextResponse.json({ error: 'No eres miembro de este grupo' }, { status: 403 });
          }
          
          // Si es el admin, no puede salir (o transferir admin a otro miembro)
          if (groupRow.get('adminId') === userEmail) {
            return NextResponse.json({ error: 'El administrador no puede salir del grupo. Transfiere la administración primero.' }, { status: 403 });
          }
          
          const index = currentMembers.indexOf(userEmail);
          if (index > -1) {
            currentMembers.splice(index, 1);
          }
          groupRow.set('members', currentMembers.join(','));
        }

        await groupRow.save();

        // Limpiar cache
        const cacheKey = `groups_${session.user.email}`;
        apiCache.delete(cacheKey);

        let message = '';
        switch (action) {
          case 'add':
            message = 'Miembro agregado exitosamente';
            break;
          case 'remove':
            message = 'Miembro removido exitosamente';
            break;
          case 'update':
            message = 'Grupo actualizado exitosamente';
            break;
          case 'leave':
            message = 'Has salido del grupo exitosamente';
            break;
        }

        return NextResponse.json({ message });
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
