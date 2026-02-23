# Configuración de Vercel para GymCounter

## Variables de Entorno Requeridas

Para que la aplicación funcione correctamente en Vercel, necesitas configurar las siguientes variables de entorno en el dashboard de Vercel:

### Firebase (OBLIGATORIO)

```
NEXT_PUBLIC_FIREBASE_API_KEY=tu-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX (opcional)
```

## Cómo Configurar en Vercel

1. Ve a tu proyecto en [vercel.com](https://vercel.com)
2. Haz clic en "Settings" -> "Environment Variables"
3. Agrega cada variable con su valor correspondiente
4. Marca todas como "Production", "Preview", y "Development"
5. Haz redeploy del proyecto

## Troubleshooting

Si sigues teniendo errores 500:

1. Verifica que todas las variables estén configuradas
2. Revisa los logs de Vercel en la sección "Functions"
3. Asegúrate de que las variables de Firebase sean correctas (consola Firebase -> Project settings)
