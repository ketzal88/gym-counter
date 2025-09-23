import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { GroupInvitation } from '@/data/types';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

// Configuración de Google Sheets para invitaciones
const INVITATIONS_SPREADSHEET_ID = '1_f43T71BdLN5sky14zcdGEGp3sEEaBIjSD1v5v0myRU';
const CLIENT_EMAIL = 'gymcounter@possible-byte-351918.iam.gserviceaccount.com';

// Función para conectar con la hoja de invitaciones
async function getInvitationsDoc() {
  try {
    const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '';
    
    if (!PRIVATE_KEY) {
      console.error('[API] Error: No se encontró la clave privada para invitaciones');
      return null;
    }
    
    const serviceAccountAuth = new JWT({
      email: CLIENT_EMAIL,
      key: PRIVATE_KEY,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    
    const doc = new GoogleSpreadsheet(INVITATIONS_SPREADSHEET_ID, serviceAccountAuth);
    await doc.loadInfo();
    return doc;
  } catch (error) {
    console.error('[API] Error conectando con Google Sheets de invitaciones:', error);
    return null;
  }
}

// GET /api/invitations - Obtener invitaciones del usuario
export async function GET() {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    try {
      const doc = await getInvitationsDoc();
      if (doc) {
        // Buscar hoja de invitaciones
        let invitationsSheet = doc.sheetsByTitle['Invitations'];
        if (!invitationsSheet) {
          // Crear hoja si no existe
          invitationsSheet = await doc.addSheet({
            title: 'Invitations',
            headerValues: ['id', 'groupId', 'inviterId', 'inviteeId', 'status', 'createdAt', 'respondedAt']
          });
        }

        const rows = await invitationsSheet.getRows();
        const userInvitations = rows.filter(row => 
          row.get('inviteeId') === session.user?.email && 
          row.get('status') === 'pending'
        ).map(row => ({
          id: row.get('id'),
          groupId: row.get('groupId'),
          inviterId: row.get('inviterId'),
          inviteeId: row.get('inviteeId'),
          status: row.get('status'),
          createdAt: new Date(row.get('createdAt')),
          respondedAt: row.get('respondedAt') ? new Date(row.get('respondedAt')) : undefined
        }));

        // Obtener información de los grupos para las invitaciones
        try {
          const groupsSheet = doc.sheetsByTitle['Groups'];
          if (groupsSheet) {
            const groupRows = await groupsSheet.getRows();
            
            // Enriquecer las invitaciones con información del grupo
            const enrichedInvitations = userInvitations.map(invitation => {
              const groupRow = groupRows.find(row => row.get('id') === invitation.groupId);
              return {
                ...invitation,
                groupName: groupRow ? groupRow.get('name') : invitation.groupId,
                groupDescription: groupRow ? groupRow.get('description') : ''
              };
            });

            return NextResponse.json({ invitations: enrichedInvitations });
          }
        } catch (error) {
          console.error('[API] Error obteniendo información de grupos:', error);
        }

        return NextResponse.json({ invitations: userInvitations });
      }
    } catch (error) {
      console.error('[API] Error leyendo invitaciones desde Google Sheets:', error);
    }

    return NextResponse.json({ invitations: [] });

  } catch (error) {
    console.error('[API] Error obteniendo invitaciones:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST /api/invitations - Enviar invitación
export async function POST(request: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { groupId, inviteeEmail } = await request.json();

    // Validaciones básicas
    if (!groupId || !inviteeEmail) {
      return NextResponse.json({ error: 'ID del grupo y email del invitado son requeridos' }, { status: 400 });
    }

    if (inviteeEmail === session.user?.email) {
      return NextResponse.json({ error: 'No puedes invitarte a ti mismo' }, { status: 400 });
    }

    const invitationId = Date.now().toString();
    const newInvitation: GroupInvitation = {
      id: invitationId,
      groupId,
      inviterId: session.user?.email,
      inviteeId: inviteeEmail,
      status: 'pending',
      createdAt: new Date()
    };

    try {
      const doc = await getInvitationsDoc();
      if (doc) {
        let invitationsSheet = doc.sheetsByTitle['Invitations'];
        if (!invitationsSheet) {
          invitationsSheet = await doc.addSheet({
            title: 'Invitations',
            headerValues: ['id', 'groupId', 'inviterId', 'inviteeId', 'status', 'createdAt', 'respondedAt']
          });
        }

        // Verificar si ya existe una invitación pendiente
        const rows = await invitationsSheet.getRows();
        const existingInvitation = rows.find(row => 
          row.get('groupId') === groupId && 
          row.get('inviteeId') === inviteeEmail && 
          row.get('status') === 'pending'
        );

        if (existingInvitation) {
          return NextResponse.json({ error: 'Ya existe una invitación pendiente para este usuario' }, { status: 409 });
        }

        await invitationsSheet.addRow({
          id: newInvitation.id,
          groupId: newInvitation.groupId,
          inviterId: newInvitation.inviterId,
          inviteeId: newInvitation.inviteeId,
          status: newInvitation.status,
          createdAt: newInvitation.createdAt.toISOString(),
          respondedAt: ''
        });

        return NextResponse.json({ 
          invitation: newInvitation,
          message: 'Invitación enviada exitosamente' 
        }, { status: 201 });
      }
    } catch (error) {
      console.error('[API] Error guardando invitación en Google Sheets:', error);
    }

    return NextResponse.json({ error: 'Error al enviar la invitación' }, { status: 500 });

  } catch (error) {
    console.error('[API] Error enviando invitación:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// PUT /api/invitations - Responder a invitación
export async function PUT(request: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { invitationId, response } = await request.json();

    if (!invitationId || !response || !['accepted', 'declined'].includes(response)) {
      return NextResponse.json({ error: 'ID de invitación y respuesta válida son requeridos' }, { status: 400 });
    }

    try {
      const doc = await getInvitationsDoc();
      if (doc) {
        const invitationsSheet = doc.sheetsByTitle['Invitations'];
        if (!invitationsSheet) {
          return NextResponse.json({ error: 'Hoja de invitaciones no encontrada' }, { status: 404 });
        }

        const rows = await invitationsSheet.getRows();
        const invitationRow = rows.find(row => 
          row.get('id') === invitationId && 
          row.get('inviteeId') === session.user?.email &&
          row.get('status') === 'pending'
        );

        if (!invitationRow) {
          return NextResponse.json({ error: 'Invitación no encontrada o ya respondida' }, { status: 404 });
        }

        // Actualizar estado de la invitación
        invitationRow.set('status', response);
        invitationRow.set('respondedAt', new Date().toISOString());
        await invitationRow.save();

        // Si se acepta, agregar al grupo
        if (response === 'accepted') {
          const groupId = invitationRow.get('groupId');
          
          // Buscar la hoja de grupos
          const groupsSheet = doc.sheetsByTitle['Groups'];
          if (groupsSheet) {
            const groupRows = await groupsSheet.getRows();
            const groupRow = groupRows.find(row => row.get('id') === groupId);
            
            if (groupRow) {
              const currentMembers = groupRow.get('members').split(',').filter((m: string) => m.trim());
              if (!currentMembers.includes(session.user?.email)) {
                currentMembers.push(session.user?.email);
                groupRow.set('members', currentMembers.join(','));
                await groupRow.save();
              }
            }
          }
        }

        return NextResponse.json({ 
          message: `Invitación ${response === 'accepted' ? 'aceptada' : 'rechazada'} exitosamente` 
        });
      }
    } catch (error) {
      console.error('[API] Error respondiendo invitación:', error);
    }

    return NextResponse.json({ error: 'Error al responder la invitación' }, { status: 500 });

  } catch (error) {
    console.error('[API] Error respondiendo invitación:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
