# 📚 Documentación de GymCounter

Bienvenido a la documentación completa de GymCounter. Aquí encontrarás guías técnicas y de usuario para todas las funcionalidades de la aplicación.

## 📖 Documentación Disponible

### Herramientas Administrativas

#### 🔧 Recuperación de Progreso
Herramienta para restaurar tu día actual de entrenamiento en caso de pérdida de datos o problemas de sincronización.

- **[Guía de Usuario](RECOVERY_TOOL_USER_GUIDE.md)** - Cómo usar la herramienta paso a paso *(No técnica)*
- **[Documentación Técnica](RECOVERY_TOOL_TECHNICAL.md)** - Arquitectura, seguridad y detalles de implementación *(Para desarrolladores)*

### Integraciones

- **[Integración de Badges](../BADGES_INTEGRATION.md)** - Sistema de gamificación y logros
- **[Modo Offline](../OFFLINE_MODE_INTEGRATION.md)** - Funcionamiento sin conexión con IndexedDB
- **[Videos de YouTube](../YOUTUBE_VIDEOS_INTEGRATION.md)** - Integración de tutoriales de ejercicios
- **[Configuración de Stripe](../STRIPE_SETUP.md)** - Sistema de pagos y suscripciones

### Setup y Deploy

- **[Configuración de Vercel](../VERCEL_SETUP.md)** - Guía de despliegue en producción
- **[README Principal](../README.md)** - Instalación local y primeros pasos

## 🎯 Navegación Rápida

### Para Usuarios
1. [Cómo recuperar mi progreso perdido](RECOVERY_TOOL_USER_GUIDE.md#cómo-usar-la-herramienta)
2. [Preguntas frecuentes sobre recuperación](RECOVERY_TOOL_USER_GUIDE.md#preguntas-frecuentes-faq)
3. [Ejemplos de uso real](RECOVERY_TOOL_USER_GUIDE.md#ejemplos-de-uso-real)

### Para Desarrolladores
1. [Arquitectura de la herramienta de recuperación](RECOVERY_TOOL_TECHNICAL.md#arquitectura)
2. [Estructura de datos](RECOVERY_TOOL_TECHNICAL.md#estructura-de-datos)
3. [Seguridad y reglas de Firestore](RECOVERY_TOOL_TECHNICAL.md#seguridad)
4. [Testing y troubleshooting](RECOVERY_TOOL_TECHNICAL.md#testing)

## 🔍 Buscar Documentación

### Por Tema

**Autenticación y Seguridad**
- Reglas de Firestore
- Protección de rutas
- Gestión de sesiones

**Base de Datos**
- Estructura de colecciones
- Sincronización en tiempo real
- Modo offline

**UI/UX**
- Componentes reutilizables
- Sistema de temas
- Responsive design

**Protocolo de Entrenamiento**
- Motor de generación de workouts
- Sistema de progresión
- Cálculo de pesos

## 📝 Convenciones

### Iconos Usados

- 📊 Datos y análisis
- 🔧 Herramientas y utilidades
- 🔒 Seguridad
- 🏋️ Entrenamientos y ejercicios
- 🎨 Diseño y UI
- 🚀 Deploy y producción
- ⚠️ Advertencias importantes
- 💡 Tips y mejores prácticas
- ✅ Confirmaciones y success
- ❌ Errores y restricciones

### Código de Colores (en guías de usuario)

- 🟢 **Verde**: Acciones seguras y recomendadas
- 🟡 **Amarillo**: Precauciones y advertencias
- 🔴 **Rojo**: Peligros y acciones no recomendadas
- 🔵 **Azul**: Información y sugerencias

## 🆘 Obtener Ayuda

### Para Usuarios
Si tienes problemas usando la aplicación:
1. Consulta la [Guía de Usuario](RECOVERY_TOOL_USER_GUIDE.md) correspondiente
2. Revisa las [Preguntas Frecuentes](RECOVERY_TOOL_USER_GUIDE.md#preguntas-frecuentes-faq)
3. Contacta al soporte técnico

### Para Desarrolladores
Si tienes problemas técnicos:
1. Consulta la sección de [Troubleshooting](RECOVERY_TOOL_TECHNICAL.md#troubleshooting)
2. Revisa los logs en la consola del navegador
3. Verifica las reglas de Firestore
4. Abre un issue en GitHub con detalles del problema

## 🔄 Actualizaciones

La documentación se actualiza regularmente con nuevas funcionalidades y mejoras.

**Última actualización general**: 2026-02-26

### Registro de Cambios

#### 2026-02-26
- ✅ Agregada documentación de Herramienta de Recuperación de Progreso
- ✅ Creada guía técnica y de usuario
- ✅ Actualizado README principal

## 📞 Contacto

Para consultas sobre la documentación:
- GitHub Issues: Para reportar errores en la documentación
- Pull Requests: Para contribuir con mejoras a la documentación

---

**Nota**: Esta documentación está en constante evolución. Si encuentras información desactualizada o incorrecta, por favor repórtala.
