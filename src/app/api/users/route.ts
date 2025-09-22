import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';
import { User } from '@/data/types';

// Por ahora usaremos un array en memoria, después migraremos a base de datos
let users: User[] = [
  {
    id: '1',
    name: 'Gabi',
    email: 'gabi@example.com',
    password: '$2a$10$dummy.hash.for.testing',
    createdAt: new Date('2024-01-01'),
    streak: 0,
    totalVisits: 0,
    subscription: 'free',
    weight: 75,
    height: 175,
    gender: 'male',
    musclePercentage: 45,
    fatPercentage: 15
  },
  {
    id: '2',
    name: 'Iña',
    email: 'ina@example.com',
    password: '$2a$10$dummy.hash.for.testing',
    createdAt: new Date('2024-01-01'),
    streak: 0,
    totalVisits: 0,
    subscription: 'free',
    weight: 60,
    height: 165,
    gender: 'female',
    musclePercentage: 40,
    fatPercentage: 20
  }
];

// GET /api/users - Obtener información del usuario actual
export async function GET() {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = users.find(u => u.email === session.user.email);
    
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // No devolver la contraseña
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

    // Verificar si el email ya existe
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return NextResponse.json({ error: 'El email ya está registrado' }, { status: 409 });
    }

    // Crear nuevo usuario
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser: User = {
      id: (users.length + 1).toString(),
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

    // Crear medición corporal inicial si se proporcionaron los porcentajes
    if (musclePercentage !== undefined || fatPercentage !== undefined) {
      try {
        const bodyMeasurementResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/sheets`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'body',
            userId: newUser.id,
            date: new Date().toISOString(),
            muscle: musclePercentage || 0,
            fat: fatPercentage || 0
          }),
        });

        if (bodyMeasurementResponse.ok) {
          console.log(`Medición corporal inicial creada para usuario ${newUser.id}`);
        } else {
          console.error('Error creando medición corporal inicial:', await bodyMeasurementResponse.text());
        }
      } catch (error) {
        console.error('Error al crear medición corporal inicial:', error);
      }
    }

    // No devolver la contraseña
    const { password: _, ...userWithoutPassword } = newUser;
    
    return NextResponse.json({ 
      user: userWithoutPassword,
      message: 'Usuario creado exitosamente' 
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
    const userIndex = users.findIndex(u => u.email === session.user.email);
    
    if (userIndex === -1) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Actualizar campos
    if (name) users[userIndex].name = name;
    if (avatar !== undefined) users[userIndex].avatar = avatar;

    // No devolver la contraseña
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
