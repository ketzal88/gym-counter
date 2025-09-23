# Configuración de Vercel para GymCounter

## Variables de Entorno Requeridas

Para que la aplicación funcione correctamente en Vercel, necesitas configurar las siguientes variables de entorno en el dashboard de Vercel:

### 1. NextAuth.js (OBLIGATORIO)

```
NEXTAUTH_URL=https://tu-dominio.vercel.app
NEXTAUTH_SECRET=tu-clave-secreta-super-segura-aqui
```

### 2. Google Sheets API (OBLIGATORIO)

```
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
Tu clave privada aquí
-----END PRIVATE KEY-----"
NEXT_PUBLIC_GOOGLE_API_KEY=tu-api-key-de-google
```

## Cómo Configurar en Vercel

1. Ve a tu proyecto en [vercel.com](https://vercel.com)
2. Haz clic en "Settings" → "Environment Variables"
3. Agrega cada variable con su valor correspondiente
4. Marca todas como "Production", "Preview", y "Development"
5. Haz redeploy del proyecto

## Generar NEXTAUTH_SECRET

Puedes generar una clave secreta segura con:

```bash
openssl rand -base64 32
```

## Usuario de Prueba Temporal

Mientras configuras las variables de entorno, puedes usar:

- **Email:** gabrielucc@gmail.com
- **Contraseña:** test123

## Troubleshooting

Si sigues teniendo errores 500:

1. Verifica que todas las variables estén configuradas
2. Revisa los logs de Vercel en la sección "Functions"
3. Asegúrate de que GOOGLE_PRIVATE_KEY esté en formato correcto con saltos de línea
