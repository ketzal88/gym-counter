# 🔄 Guía de Usuario - Herramienta de Recuperación de Progreso

## ¿Qué es esta herramienta?

La **Herramienta de Recuperación de Progreso** te permite restaurar tu día actual de entrenamiento si por algún motivo tu progreso se reseteo o se perdió.

## ¿Cuándo debo usarla?

Usa esta herramienta si:
- ✅ Tu progreso se reseteo al día 1 por error
- ✅ Completaste entrenamientos pero no se registró tu avance
- ✅ Hubo un problema de sincronización con tu cuenta
- ✅ Necesitas ajustar manualmente tu día de entrenamiento

**NO uses esta herramienta para:**
- ❌ Saltarte días de entrenamiento sin hacerlos
- ❌ "Hacer trampa" en tu progreso
- ❌ Cambiar tu día constantemente sin razón

## Cómo acceder

### Paso 1: Inicia sesión
Asegúrate de haber iniciado sesión en tu cuenta de GymCounter.

### Paso 2: Ve a la URL especial
En tu navegador, escribe la siguiente dirección:

```
https://tu-dominio.com/admin/recover-progress
```

O si estás en desarrollo local:
```
http://localhost:3000/admin/recover-progress
```

### Paso 3: Espera a que cargue
La página cargará tu información automáticamente.

## Cómo usar la herramienta

### 1️⃣ Revisa tu Información

Al entrar, verás varias secciones:

#### 👤 Información del Usuario
- Tu email
- Tu nombre
- Tu ID de usuario

#### 📊 Estado Actual
- **Día actual**: El día en el que estás ahora según el sistema
- **Sesiones completadas**: Cuántos entrenamientos has hecho
- **Plan**: Tu plan de entrenamiento actual
- **Completado**: Si ya terminaste el protocolo completo

#### 🏋️ Historial de Entrenamientos
- Total de entrenamientos registrados
- Último día que completaste
- Lista de tus últimos 5 entrenamientos

### 2️⃣ La Sugerencia Automática

La herramienta analiza tu historial y te sugiere el día correcto.

**Ejemplo**:
```
💡 Sugerencia: Según tu historial de entrenamientos,
completaste hasta el día 6.
Tu siguiente entrenamiento debería ser el día 7.
```

Si ves esto, la herramienta ya identificó tu progreso real. ¡Puedes usar el día sugerido!

### 3️⃣ Selecciona el Día a Restaurar

En el formulario verás:
- Un campo con un número (el día sugerido)
- Puedes cambiarlo manualmente si necesitas otro día
- El día debe estar entre 1 y 180

**Ejemplos de uso**:

**Caso 1: Recuperar progreso perdido**
- Estabas en día 6
- El sistema muestra día 1
- Selecciona día 6 para recuperar

**Caso 2: Continuar después de vacaciones**
- Completaste día 5 hace una semana
- Selecciona día 6 para continuar

**Caso 3: Corrección de error**
- Accidentalmente avanzaste de día
- Puedes retroceder al día correcto

### 4️⃣ Restaurar tu Progreso

1. Verifica que el número del día es correcto
2. Haz clic en el botón azul **"Restaurar al Día X"**
3. Espera unos segundos (verás "Actualizando...")
4. ¡Listo! Verás un mensaje verde de éxito

### 5️⃣ Verificación

Después de restaurar:
- Verás un mensaje: "✅ ¡Progreso restaurado exitosamente! Día actualizado a X"
- La sección "Estado Final Verificado" mostrará tu nuevo día
- Puedes volver a la app principal y continuar entrenando

## Preguntas Frecuentes (FAQ)

### ❓ ¿Puedo usar esta herramienta varias veces?
Sí, pero úsala solo cuando sea necesario. No está diseñada para uso frecuente.

### ❓ ¿Afecta mi historial de entrenamientos?
No. Solo actualiza tu día actual. Tus entrenamientos pasados no se modifican.

### ❓ ¿Cambia mis pesos o récords?
No. Solo ajusta el día del protocolo. Tus levantamientos y récords permanecen intactos.

### ❓ ¿Qué pasa si pongo un día incorrecto?
Puedes volver a entrar y corregirlo. No hay problema.

### ❓ ¿Por qué dice "Error al actualizar"?
Posibles causas:
- No tienes conexión a internet
- Tu sesión expiró (vuelve a iniciar sesión)
- Hay un problema temporal con el servidor

Solución: Refresca la página y vuelve a intentar.

### ❓ ¿Puedo compartir esta URL con otros?
No es necesario. Cada usuario solo puede ver y modificar su propio progreso.

### ❓ ¿Es seguro usar esta herramienta?
Sí, completamente. Solo tú puedes acceder a tu información y solo cuando estás autenticado.

## Ejemplos de Uso Real

### Ejemplo 1: Gabriel recupera su progreso

**Situación**: Gabriel había llegado al día 6, pero al abrir la app aparece día 1.

**Pasos**:
1. Gabriel va a `/admin/recover-progress`
2. Ve que su historial muestra entrenamientos hasta día 6
3. La herramienta sugiere día 7 (el siguiente)
4. Gabriel confirma y hace clic en "Restaurar"
5. Su progreso vuelve al día 6 ✅

### Ejemplo 2: Usuario después de vacaciones

**Situación**: María completó el día 15 hace 2 semanas y quiere continuar.

**Pasos**:
1. María accede a la herramienta
2. Ve que su último entrenamiento fue día 15
3. La herramienta sugiere día 16
4. María restaura al día 16
5. Continúa su rutina desde donde lo dejó ✅

### Ejemplo 3: Corrección de avance accidental

**Situación**: Pedro avanzó por error al día 30 sin completar el día 29.

**Pasos**:
1. Pedro accede a la herramienta
2. Ve que está en día 30 pero su último workout fue día 28
3. Pedro manualmente ingresa "29"
4. Restaura su progreso
5. Completa correctamente el día 29 ✅

## Advertencias Importantes

### ⚠️ No es una "máquina del tiempo"

Esta herramienta **NO**:
- Borra entrenamientos pasados
- Recupera entrenamientos que nunca registraste
- Cambia fechas de tus workouts
- Modifica tus pesos o récords

### ⚠️ Úsala responsablemente

- Solo para corregir errores técnicos
- No para "adelantar" artificialmente tu progreso
- Tu progreso real está en tu esfuerzo en el gym

### ⚠️ Si tienes dudas

Antes de usar la herramienta:
1. Revisa tu historial de entrenamientos
2. Verifica cuál fue tu último día completado
3. Asegúrate de seleccionar el día correcto

## Soporte

Si tienes problemas:
1. Verifica que estás autenticado
2. Refresca la página
3. Intenta desde otro navegador
4. Contacta al soporte técnico con esta información:
   - Tu email de usuario
   - El día que intentas restaurar
   - El mensaje de error que aparece

## Consejos

### 💡 Toma una captura de pantalla
Antes de restaurar, toma una foto de:
- Tu estado actual
- Tu historial de entrenamientos
- El día que vas a restaurar

Por si necesitas referencias futuras.

### 💡 Verifica después
Después de restaurar, vuelve a la app principal y:
- Confirma que el día se actualizó
- Verifica que puedes continuar entrenando normalmente

### 💡 Anota el incidente
Si perdiste tu progreso, anota:
- Qué día era
- Qué estabas haciendo cuando pasó
- Si se repite, contacta al soporte

## Resumen Rápido

```
✅ Pasos para recuperar tu progreso:
1. Inicia sesión en GymCounter
2. Ve a /admin/recover-progress
3. Revisa tu historial y el día sugerido
4. Confirma o ajusta el día
5. Haz clic en "Restaurar"
6. ¡Listo! Continúa entrenando
```

---

**Recuerda**: Esta herramienta es tu red de seguridad. Úsala cuando la necesites, pero tu verdadero progreso está en el gym 💪

**¿Alguna pregunta?** Contacta al soporte técnico.

**Última actualización**: 2026-02-26
