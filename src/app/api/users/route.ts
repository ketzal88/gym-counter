import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';
import { User } from '@/data/types';
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

// Array en memoria como fallback (solo para casos de emergencia)
const users: User[] = [];

// GET /api/users - Obtener información del usuario actual
export async function GET() {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Intentar leer desde Google Sheets primero
    try {
      const doc = await getUsersDoc();
      if (doc) {
        const sheet = doc.sheetsByIndex[0]; // Primera hoja (Hoja 1)
        const rows = await sheet.getRows();
        
        const user = rows.find(row => row.get('email') === session.user?.email);
        
        if (user) {
          const userData = {
            id: user.get('id'),
            name: user.get('name'),
            email: user.get('email'),
            createdAt: new Date(user.get('createdAt')),
            streak: 0,
            totalVisits: 0,
            subscription: 'free' as const,
            weight: 0,
            height: 0,
            gender: 'male' as const,
            googleSheetId: user.get('googleSheetId')
          };
          
          console.log('[API] Usuario encontrado en Google Sheets:', userData.email);
          return NextResponse.json({ user: userData });
        }
      }
    } catch (error) {
      console.error('[API] Error leyendo desde Google Sheets, usando fallback:', error);
    }

    // Fallback: buscar en memoria
    const user = users.find(u => u.email === session.user?.email);
    
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // No devolver la contraseña
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    
    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('[API] Error obteniendo usuario:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST /api/users - Crear nuevo usuario
export async function POST(request: Request) {
  try {
    const { 
      name, 
      email, 
      password, 
      weight, 
      height, 
      gender, 
      musclePercentage, 
      fatPercentage 
    } = await request.json();

    // Validaciones básicas
    if (!name || !email || !password || !weight || !height || !gender) {
      return NextResponse.json({ error: 'Faltan campos requeridos (nombre, email, contraseña, peso, estatura, sexo)' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 });
    }

    if (weight <= 0 || weight > 300) {
      return NextResponse.json({ error: 'El peso debe estar entre 1 y 300 kg' }, { status: 400 });
    }

    if (height <= 0 || height > 250) {
      return NextResponse.json({ error: 'La estatura debe estar entre 1 y 250 cm' }, { status: 400 });
    }

    if (!['male', 'female', 'other'].includes(gender)) {
      return NextResponse.json({ error: 'El sexo debe ser: male, female u other' }, { status: 400 });
    }

    // Validaciones opcionales
    if (musclePercentage !== undefined && (musclePercentage < 0 || musclePercentage > 100)) {
      return NextResponse.json({ error: 'El porcentaje de músculo debe estar entre 0 y 100' }, { status: 400 });
    }

    if (fatPercentage !== undefined && (fatPercentage < 0 || fatPercentage > 100)) {
      return NextResponse.json({ error: 'El porcentaje de grasa debe estar entre 0 y 100' }, { status: 400 });
    }

    // Verificar si el email ya existe en Google Sheets
    try {
      const doc = await getUsersDoc();
      if (doc) {
        const sheet = doc.sheetsByIndex[0];
        const rows = await sheet.getRows();
        const existingUser = rows.find(row => row.get('email') === email);
        
        if (existingUser) {
          return NextResponse.json({ error: 'El email ya está registrado' }, { status: 409 });
        }
      }
    } catch (error) {
      console.error('[API] Error verificando email en Google Sheets:', error);
    }

    // Fallback: verificar en memoria
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return NextResponse.json({ error: 'El email ya está registrado' }, { status: 409 });
    }

    // Crear nuevo usuario
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = Date.now().toString(); // ID único basado en timestamp
    
    // Intentar guardar en Google Sheets primero
    try {
      const doc = await getUsersDoc();
      if (doc) {
        const sheet = doc.sheetsByIndex[0];
        
        // Crear hoja personal para el usuario
        let userSheetTitle = '';
        try {
          const { GoogleSpreadsheet: GS } = await import('google-spreadsheet');
          const { JWT: JWT_Auth } = await import('google-auth-library');
          
          const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '';
          const SPREADSHEET_ID = '1n4_Jb5VF-b9aPkiteeA6JCzDYK6SP6AdGHZ1PvcfhnQ';
          
          if (PRIVATE_KEY) {
            const serviceAccountAuth = new JWT_Auth({
              email: CLIENT_EMAIL,
              key: PRIVATE_KEY,
              scopes: ['https://www.googleapis.com/auth/spreadsheets'],
            });
            
            const userDoc = new GS(SPREADSHEET_ID, serviceAccountAuth);
            await userDoc.loadInfo();
            
            userSheetTitle = `Usuario_${userId}_${name.replace(/\s+/g, '_')}`;
            
            // Verificar si la hoja ya existe
            let userSheet = userDoc.sheetsByTitle[userSheetTitle];
            if (!userSheet) {
              userSheet = await userDoc.addSheet({
                title: userSheetTitle,
                headerValues: ['id', 'userId', 'date', 'type', 'muscle', 'fat']
              });
              console.log(`[API] Hoja personal creada para usuario ${name}: ${userSheetTitle}`);
            }
          }
        } catch (error) {
          console.error('[API] Error creando hoja personal:', error);
        }
        
        // Guardar usuario en Google Sheets
        await sheet.addRow({
          id: userId,
          name,
          email,
          password: hashedPassword,
          createdAt: new Date().toISOString().split('T')[0],
          googleSheetId: userSheetTitle
        });
        
        console.log(`[API] Usuario guardado en Google Sheets: ${email}`);
        
        // Crear medición corporal inicial si se proporcionaron los porcentajes
        if (musclePercentage !== undefined || fatPercentage !== undefined && userSheetTitle) {
          try {
            const { GoogleSpreadsheet: GS } = await import('google-spreadsheet');
            const { JWT: JWT_Auth } = await import('google-auth-library');
            
            const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '';
            const SPREADSHEET_ID = '1n4_Jb5VF-b9aPkiteeA6JCzDYK6SP6AdGHZ1PvcfhnQ';
            
            if (PRIVATE_KEY) {
              const serviceAccountAuth = new JWT_Auth({
                email: CLIENT_EMAIL,
                key: PRIVATE_KEY,
                scopes: ['https://www.googleapis.com/auth/spreadsheets'],
              });
              
              const userDoc = new GS(SPREADSHEET_ID, serviceAccountAuth);
              await userDoc.loadInfo();
              
              // Buscar la hoja personal del usuario
              const userSheet = userDoc.sheetsByTitle[userSheetTitle];
              
              if (userSheet) {
                // Agregar la medición corporal inicial en la hoja personal del usuario
                const measurementId = Date.now().toString();
                await userSheet.addRow({
                  id: measurementId,
                  userId: userId,
                  date: new Date().toISOString(),
                  type: 'body_measurement',
                  muscle: musclePercentage || 0,
                  fat: fatPercentage || 0
                });
                
                console.log(`Medición corporal inicial guardada en hoja personal del usuario ${userId}`);
              } else {
                console.error(`No se encontró la hoja personal del usuario: ${userSheetTitle}`);
              }
            }
          } catch (error) {
            console.error('Error al crear medición corporal inicial:', error);
          }
        }
        
        // Crear objeto de usuario para respuesta
        const newUser: User = {
          id: userId,
          name,
          email,
          createdAt: new Date(),
          streak: 0,
          totalVisits: 0,
          subscription: 'free',
          weight,
          height,
          gender,
          musclePercentage,
          fatPercentage,
          googleSheetId: userSheetTitle
        };
        
        // También agregar a memoria como fallback
        users.push(newUser);
        
        // No devolver la contraseña
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: userPassword, ...userWithoutPassword } = newUser;
        
        return NextResponse.json({ 
          user: userWithoutPassword,
          message: 'Usuario creado exitosamente en Google Sheets' 
        }, { status: 201 });
      }
    } catch (error) {
      console.error('[API] Error guardando en Google Sheets, usando memoria:', error);
    }

    // Fallback: crear en memoria
    const newUser: User = {
      id: userId,
      name,
      email,
      password: hashedPassword,
      createdAt: new Date(),
      streak: 0,
      totalVisits: 0,
      subscription: 'free',
      weight,
      height,
      gender,
      musclePercentage,
      fatPercentage
    };

    users.push(newUser);

    // No devolver la contraseña
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: fallbackPassword, ...userWithoutPassword } = newUser;
    
    return NextResponse.json({ 
      user: userWithoutPassword,
      message: 'Usuario creado exitosamente (fallback a memoria)' 
    }, { status: 201 });

  } catch (error) {
    console.error('[API] Error creando usuario:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// PUT /api/users - Actualizar información del usuario
export async function PUT(request: Request) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { name, avatar } = await request.json();
    const userIndex = users.findIndex(u => u.email === session.user?.email);
    
    if (userIndex === -1) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Actualizar campos
    if (name) users[userIndex].name = name;
    if (avatar !== undefined) users[userIndex].avatar = avatar;

    // No devolver la contraseña
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = users[userIndex];
    
    return NextResponse.json({ 
      user: userWithoutPassword,
      message: 'Usuario actualizado exitosamente' 
    });

  } catch (error) {
    console.error('[API] Error actualizando usuario:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
