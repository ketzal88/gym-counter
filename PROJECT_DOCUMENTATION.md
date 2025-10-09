# GymCounter - Documentación del Proyecto

## 📋 **Estructura de Google Sheets**

### **Documento Principal (Users, Groups, Invitations)**

- **ID**: `1_f43T71BdLN5sky14zcdGEGp3sEEaBIjSD1v5v0myRU`
- **URL**: https://docs.google.com/spreadsheets/d/1_f43T71BdLN5sky14zcdGEGp3sEEaBIjSD1v5v0myRU/edit
- **Hojas**:
  - **Users**: Datos de usuarios (id, name, email, password, createdAt, googleSheetId)
  - **Groups**: Grupos/equipos del gym
  - **Invitations**: Invitaciones a grupos

### **Documento de Datos de Usuarios (Visitas, Mediciones)**

- **ID**: `1n4_Jb5VF-b9aPkiteeA6JCzDYK6SP6AdGHZ1PvcfhnQ`
- **Hojas**: Hojas individuales por usuario
  - `Usuario_1_gab` (Gabi)
  - `Usuario_1758595778972_Iña` (Iña)
  - `Usuario_1758657643627_Maria_carolina_` (Caro)
  - etc.

## 🔧 **Configuración de APIs**

### **API Principal (`/api/sheets/route.ts`)**

- **SPREADSHEET_ID**: `1_f43T71BdLN5sky14zcdGEGp3sEEaBIjSD1v5v0myRU` (documento principal)
- **Funciones**:
  - `type=users`: Lee de la hoja "Users" (documento principal)
  - `type=visits`: Lee de hojas individuales de usuarios (documento de datos)
  - `type=body`: Lee mediciones corporales de hojas individuales (documento de datos)

### **API de Grupos (`/api/groups/[groupId]/members/route.ts`)**

- **SPREADSHEET_ID**: `1n4_Jb5VF-b9aPkiteeA6JCzDYK6SP6AdGHZ1PvcfhnQ` (documento de datos)
- **Función**: Lee visitas de hojas individuales de usuarios

### **Configuración de Documentos por Tipo de Dato**

| Tipo de Dato          | Documento           | ID                                             |
| --------------------- | ------------------- | ---------------------------------------------- |
| **Users**             | Documento Principal | `1_f43T71BdLN5sky14zcdGEGp3sEEaBIjSD1v5v0myRU` |
| **Groups**            | Documento Principal | `1_f43T71BdLN5sky14zcdGEGp3sEEaBIjSD1v5v0myRU` |
| **Invitations**       | Documento Principal | `1_f43T71BdLN5sky14zcdGEGp3sEEaBIjSD1v5v0myRU` |
| **Visits**            | Documento de Datos  | `1n4_Jb5VF-b9aPkiteeA6JCzDYK6SP6AdGHZ1PvcfhnQ` |
| **Body Measurements** | Documento de Datos  | `1n4_Jb5VF-b9aPkiteeA6JCzDYK6SP6AdGHZ1PvcfhnQ` |

## 👥 **Usuarios del Sistema**

| ID            | Nombre | Email                     | Hoja                                    |
| ------------- | ------ | ------------------------- | --------------------------------------- |
| 1             | Gabi   | gabrielucc@gmail.com      | Usuario_3_gab                           |
| 1758591764603 | Cin    | cinthianpereira@gmail.com | Usuario_1758591764603_Cin               |
| 1758595778972 | Iña    | inayabarb@gmail.com       | Usuario_1758595778972_Iña               |
| 1758657643627 | Caro   | carolasoa1984@gmail.com   | Usuario*1758657643627_Maria_carolina*   |
| 1758658608549 | Vivi   | vivipalladino@gmail.com   | Usuario_1758658608549_Viviana_Palladino |
| 1758659922902 | Marian | mestrada160180@gmail.com  | Usuario_1758659922902_Mariano_Estrada   |

## 🏃‍♂️ **Grupos/Equipos**

1. **Bigote** - "Tengo casi 40 y le gano a iña"
   - Miembros: gabrielucc@gmail.com, inayabarb@gmail.com
2. **9am** - "Los crossfiteros de las 9"
   - Miembros: gabrielucc@gmail.com, carolasoa1984@gmail.com

## 🔄 **Flujo de Datos**

1. **UnifiedDashboard** carga datos del usuario actual desde cache
2. **TeamDashboard** recibe `currentUser` y `currentUserVisits` como props
3. **Para otros usuarios**: TeamDashboard llama a `/api/sheets?type=visits` y `/api/sheets?type=users`
4. **Cache**: Datos cacheados por 2 minutos para evitar cuota excedida

## ⚠️ **Problemas Conocidos y Soluciones**

### **Problema**: Contadores duplicados en TeamDashboard

**Solución**: Usar datos cacheados del usuario actual, solo cargar datos de otros usuarios

### **Problema**: API quota exceeded (429)

**Solución**: Implementar cache con TTL de 2 minutos

### **Problema**: Datos guardados en hoja incorrecta

**Solución**: Usar regex más preciso para identificar hojas de usuarios

### **Problema**: TeamDashboard no carga datos

**Solución**: Usar documento correcto para usuarios (`1_f43T71BdLN5sky14zcdGEGp3sEEaBIjSD1v5v0myRU`)

## 🚀 **Estado Actual**

- ✅ Contadores corregidos (158 visitas para Gabi)
- ✅ Cache implementado para evitar quota exceeded
- ✅ TeamDashboard optimizado (usa datos cacheados del usuario actual)
- ✅ API de usuarios corregida (usa documento correcto)
- ✅ Debug buttons removidos

## 📁 **Archivos Principales**

- `src/app/components/UnifiedDashboard.tsx` - Dashboard principal
- `src/app/components/TeamDashboard.tsx` - Dashboard de equipos
- `src/app/api/sheets/route.ts` - API principal de Google Sheets
- `src/app/api/groups/[groupId]/members/route.ts` - API de miembros de grupos
- `src/data/sheetsService.ts` - Servicio de datos con cache
- `src/lib/cache.ts` - Sistema de cache simple
