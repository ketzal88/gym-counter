import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
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
      console.error('[AUTH] Error: No se encontró la clave privada para usuarios');
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
    console.error('[AUTH] Error conectando con Google Sheets de usuarios:', error);
    return null;
  }
}

// Usuarios temporales (fallback) - solo para emergencias
const fallbackUsers: Array<{
  id: string;
  name: string;
  email: string;
  password: string;
}> = [];

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Intentar buscar usuario en Google Sheets primero
        try {
          const doc = await getUsersDoc();
          if (doc) {
            const sheet = doc.sheetsByIndex[0];
            const rows = await sheet.getRows();
            const user = rows.find(row => row.get('email') === credentials.email);
            
            if (user) {
              const storedPassword = user.get('password');
              
              // Verificar contraseña
              const isValidPassword = await bcrypt.compare(credentials.password, storedPassword);
              
              if (isValidPassword) {
                console.log(`[AUTH] Usuario autenticado desde Google Sheets: ${user.get('email')}`);
                return {
                  id: user.get('id'),
                  email: user.get('email'),
                  name: user.get('name'),
                };
              }
            }
          }
        } catch (error) {
          console.error('[AUTH] Error autenticando desde Google Sheets, usando fallback:', error);
        }

        // Fallback: buscar en usuarios temporales
        const user = fallbackUsers.find(u => u.email === credentials.email);
        
        if (!user) {
          return null;
        }

        // Por ahora aceptamos cualquier contraseña para usuarios existentes
        if (user.password === '$2a$10$dummy.hash.for.testing') {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        }

        // Verificar contraseña
        const isValidPassword = await bcrypt.compare(credentials.password, user.password);
        
        if (!isValidPassword) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      }
    })
  ],
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as { id: string }).id = token.id as string;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 días - token "eterno"
  },
});

export { handler as GET, handler as POST };
