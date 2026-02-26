# Guía de Configuración de Stripe

Esta guía te ayudará a configurar Stripe para el sistema de suscripciones de GymCounter.

## 1. Crear Cuenta de Stripe

1. Visita [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Completa el registro con tu información

## 2. Modo de Prueba (Test Mode)

Por defecto, Stripe inicia en **Test Mode**. Asegúrate de que el toggle esté en "Test" en la parte superior izquierda del dashboard.

## 3. Obtener API Keys

1. Ve a: [Developers → API keys](https://dashboard.stripe.com/test/apikeys)
2. Copia las siguientes keys:
   - **Publishable key** (empieza con `pk_test_...`)
   - **Secret key** (empieza con `sk_test_...`) - Click "Reveal test key"

3. Añádelas a tu archivo `.env.local`:
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

## 4. Crear Productos y Precios

### Producto: GymCounter Pro

1. Ve a: [Products](https://dashboard.stripe.com/test/products)
2. Click "Add product"

#### Plan Mensual
- **Name**: GymCounter Pro - Mensual
- **Description**: Plan mensual con acceso completo
- **Pricing model**: Recurring
- **Price**: $4.99 USD
- **Billing period**: Monthly
- **Free trial**: 7 days
- Click "Save product"
- **Copia el Price ID** (empieza con `price_...`)

#### Plan Anual
- **Name**: GymCounter Pro - Anual
- **Description**: Plan anual con 2 meses gratis
- **Pricing model**: Recurring
- **Price**: $49.90 USD
- **Billing period**: Yearly
- **Free trial**: 7 days
- Click "Save product"
- **Copia el Price ID** (empieza con `price_...`)

3. Añade los Price IDs a tu `.env.local`:
```bash
NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID=price_...
```

## 5. Configurar Webhook

### Desarrollo Local (con Stripe CLI)

1. Instala Stripe CLI:
   - **Windows**: `scoop install stripe`
   - **Mac**: `brew install stripe/stripe-cli/stripe`
   - **Linux**: [Descarga binario](https://github.com/stripe/stripe-cli/releases/latest)

2. Autentica la CLI:
```bash
stripe login
```

3. Reenvía eventos a tu localhost:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

4. La CLI mostrará un **webhook signing secret** (empieza con `whsec_...`)
5. Cópialo a tu `.env.local`:
```bash
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Producción (Webhook en servidor)

1. Ve a: [Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Click "Add endpoint"
3. **Endpoint URL**: `https://tu-dominio.com/api/webhooks/stripe`
4. **Events to send**: Selecciona los siguientes:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
   - `customer.subscription.trial_will_end`
5. Click "Add endpoint"
6. Copia el **Signing secret** (empieza con `whsec_...`)
7. Añádelo a las variables de entorno de producción

## 6. Configurar Firebase Admin SDK

Para que las API routes funcionen, necesitas credenciales de Firebase Admin:

1. Ve a: [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Click en ⚙️ (Settings) → **Project settings**
4. Ve a la pestaña **Service accounts**
5. Click "Generate new private key"
6. Se descargará un archivo JSON

7. Del archivo JSON, extrae:
   - `client_email`
   - `private_key`

8. Añádelos a tu `.env.local`:
```bash
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**IMPORTANTE**: En producción (Vercel), al pegar la private key en las variables de entorno, asegúrate de que los `\n` se mantengan como literales, no como saltos de línea reales.

## 7. Archivo .env.local Completo

Tu archivo `.env.local` debería verse así:

```bash
# Firebase Client (ya configurado)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...

# Firebase Admin SDK
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Stripe Keys (TEST MODE)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs
NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID=price_...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 8. Testing en Desarrollo

### Tarjetas de Prueba

Usa estas tarjetas para probar diferentes escenarios:

- **Pago exitoso**: `4242 4242 4242 4242`
- **Pago rechazado**: `4000 0000 0000 0002`
- **Requiere autenticación (3D Secure)**: `4000 0025 0000 3155`

Cualquier fecha futura y cualquier CVC funcionan.

### Flujo de Prueba

1. Inicia el servidor: `npm run dev`
2. En otra terminal, inicia Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
3. Navega a: `http://localhost:3000`
4. Regístrate y completa el onboarding
5. En el paywall, click "Suscribirme Ahora"
6. Usa la tarjeta `4242 4242 4242 4242`
7. Verifica en Firestore que el usuario tiene `subscriptionStatus: 'trial'`
8. Verifica en Stripe Dashboard que se creó la suscripción

## 9. Transición a Producción

Cuando estés listo para aceptar pagos reales:

1. Completa la activación de tu cuenta Stripe
2. Cambia el toggle a **Live Mode**
3. Crea los productos y precios nuevamente en Live Mode
4. Obtén las Live API keys (empiezan con `pk_live_...` y `sk_live_...`)
5. Crea el webhook endpoint en Live Mode
6. Actualiza todas las variables de entorno con las claves Live
7. Deploy a producción

## 10. Monitoreo

- **Dashboard de Stripe**: [https://dashboard.stripe.com/](https://dashboard.stripe.com/)
- **Logs de Webhooks**: [https://dashboard.stripe.com/test/webhooks](https://dashboard.stripe.com/test/webhooks)
- **Eventos**: [https://dashboard.stripe.com/test/events](https://dashboard.stripe.com/test/events)

## Troubleshooting

### Webhook no funciona
- Verifica que Stripe CLI esté corriendo
- Verifica que el webhook secret sea correcto
- Revisa logs en la consola del servidor

### Checkout redirige a error
- Verifica que las API keys sean correctas
- Verifica que los Price IDs existan
- Revisa logs del navegador y servidor

### Usuario no se actualiza después de pagar
- Verifica que el webhook se esté ejecutando
- Revisa Firestore para ver si el evento se registró
- Verifica que el userId esté en los metadatos de Stripe

## Recursos

- [Documentación de Stripe](https://stripe.com/docs)
- [Stripe CLI Docs](https://stripe.com/docs/stripe-cli)
- [Testing en Stripe](https://stripe.com/docs/testing)
