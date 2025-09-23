import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

// Configuración de Google Sheets
const GROUPS_SPREADSHEET_ID = '1_f43T71BdLN5sky14zcdGEGp3sEEaBIjSD1v5v0myRU';
const USERS_SPREADSHEET_ID = '1_f43T71BdLN5sky14zcdGEGp3sEEaBIjSD1v5v0myRU';
const SPREADSHEET_ID = '1n4_Jb5VF-b9aPkiteeA6JCzDYK6SP6AdGHZ1PvcfhnQ';
const CLIENT_EMAIL = 'gymcounter@possible-byte-351918.iam.gserviceaccount.com';

const serviceAccountAuth = new JWT({
  email: CLIENT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

async function getGroupsDoc() {
  try {
    const doc = new GoogleSpreadsheet(GROUPS_SPREADSHEET_ID, serviceAccountAuth);
    await doc.loadInfo();
    return doc;
  } catch (error) {
    console.error('[API] Error conectando con Google Sheets de grupos:', error);
    return null;
  }
}

async function getUsersDoc() {
  try {
    const doc = new GoogleSpreadsheet(USERS_SPREADSHEET_ID, serviceAccountAuth);
    await doc.loadInfo();
    return doc;
  } catch (error) {
    console.error('[API] Error conectando con Google Sheets de usuarios:', error);
    return null;
  }
}

async function getMainDoc() {
  try {
    const doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);
    await doc.loadInfo();
    return doc;
  } catch (error) {
    console.error('[API] Error conectando con Google Sheets:', error);
    return null;
  }
}

// GET /api/groups/[groupId]/members - Obtener datos de todos los miembros del grupo
export async function GET(
  request: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { groupId } = await params;
    


    // 1. Obtener información del grupo
    const groupsDoc = await getGroupsDoc();
    if (!groupsDoc) {
      return NextResponse.json({ error: 'Error conectando con Google Sheets' }, { status: 500 });
    }

    const groupsSheet = groupsDoc.sheetsByTitle['Groups'];
    if (!groupsSheet) {
      return NextResponse.json({ error: 'Hoja de grupos no encontrada' }, { status: 404 });
    }

    const groupRows = await groupsSheet.getRows();
    
    const group = groupRows.find(row => row.get('id') === groupId);
    
    if (!group) {
      return NextResponse.json({ error: 'Grupo no encontrado' }, { status: 404 });
    }

    // Verificar que el usuario es miembro del grupo
    const members = group.get('members').split(',');
    
    if (!members.includes(session.user.email)) {
      return NextResponse.json({ error: 'No eres miembro de este grupo' }, { status: 403 });
    }

    // 2. Obtener información de usuarios de todos los miembros
    const usersDoc = await getUsersDoc();
    if (!usersDoc) {
      return NextResponse.json({ error: 'Error conectando con Google Sheets de usuarios' }, { status: 500 });
    }
    
    // Usar "Users" que es donde están los usuarios
    const usersSheet = usersDoc.sheetsByTitle['Users'];
                     
    if (!usersSheet) {
      return NextResponse.json({ error: 'Hoja de usuarios no encontrada' }, { status: 404 });
    }

    const userRows = await usersSheet.getRows();
    
    const memberUsers = userRows.filter(row => {
      const email = row.get('email');
      return email && members.includes(email);
    }).map(row => ({
      id: row.get('id'),
      name: row.get('name'),
      email: row.get('email'),
      googleSheetId: row.get('googleSheetId')
    }));

    // 3. Obtener visitas de todos los miembros
    const mainDoc = await getMainDoc();
    if (!mainDoc) {
      return NextResponse.json({ error: 'Error conectando con Google Sheets principal' }, { status: 500 });
    }

    const memberVisits: Array<{
      id: string;
      userId: string;
      userName: string;
      userEmail: string;
      date: string;
    }> = [];
    
    for (const member of memberUsers) {
      if (member.googleSheetId) {
        try {
          // Buscar la hoja del usuario por su googleSheetId
          const userSheet = mainDoc.sheetsByTitle[member.googleSheetId];
          if (userSheet) {
            const visitRows = await userSheet.getRows();
            const visits = visitRows
              .filter(row => row.get('type') === 'visit')
              .map(row => ({
                id: row.get('id'),
                userId: member.id,
                userName: member.name,
                userEmail: member.email,
                date: row.get('date')
              }));
            
            memberVisits.push(...visits);
          }
        } catch (error) {
          console.error(`Error obteniendo visitas de ${member.name}:`, error);
        }
      }
    }


    // 4. Calcular estadísticas de asistencia para cada miembro
    const memberStats = memberUsers.map(member => {
      const memberVisitList = memberVisits.filter(v => v.userId === member.id);
      const today = new Date().toLocaleDateString('en-CA');
      const thisWeekStart = new Date();
      thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay() + 1); // Lunes
      
      const weeklyVisits = memberVisitList.filter(visit => {
        const visitDate = new Date(visit.date).toLocaleDateString('en-CA');
        const weekStart = thisWeekStart.toLocaleDateString('en-CA');
        return visitDate >= weekStart && visitDate <= today;
      });

      return {
        ...member,
        totalVisits: memberVisitList.length,
        weeklyVisits: weeklyVisits.length,
        lastVisit: memberVisitList.length > 0 ? memberVisitList[memberVisitList.length - 1].date : null,
        visitedToday: memberVisitList.some(v => v.date === today)
      };
    });

    const responseData = {
      group: {
        id: group.get('id'),
        name: group.get('name'),
        description: group.get('description'),
        adminId: group.get('adminId'),
        members: members,
        createdAt: group.get('createdAt'),
        isPublic: group.get('isPublic') === 'true'
      },
      members: memberStats,
      visits: memberVisits
    };


    return NextResponse.json(responseData);

  } catch (error) {
    console.error('[API] Error obteniendo datos de miembros:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
