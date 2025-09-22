import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

// Usuarios temporales (los migraremos a la base de datos después)
const users = [
  {
    id: '1',
    name: 'Gabi',
    email: 'gabi@example.com',
    password: '$2a$10$dummy.hash.for.testing', // Cualquier contraseña funciona por ahora
  },
  {
    id: '2', 
    name: 'Iña',
    email: 'ina@example.com',
    password: '$2a$10$dummy.hash.for.testing', // Cualquier contraseña funciona por ahora
  }
];

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

        // Buscar usuario por email
        const user = users.find(u => u.email === credentials.email);
        
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

        // Verificar contraseña (implementaremos bcrypt después)
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
        (session.user as any).id = token.id as string;
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
