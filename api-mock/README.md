# API Mock - Censo de Mascotas PWA

API Mock completamente funcional para pruebas de la aplicación PWA de Censo de Mascotas. Implementa todos los endpoints especificados en el documento de requisitos y la colección de Postman.

## Inicio rápido

```bash
cd api-mock
npm install
npm start
```

El servidor se ejecutará en `http://localhost:3000`

## Endpoints disponibles

### Autenticación
- **POST** `/api/v1/auth/login` - Autenticar usuario y obtener JWT
  - Credenciales por defecto: `usuario: admin`, `contraseña: Admin123*`
  - Retorna: `{ token, tipoToken: "Bearer", expiraEn: 3600 }`
  
- **POST** `/api/v1/personas/registro` - Registro de nueva persona con usuario y contraseña
  - Retorna: persona creada con ID generado

### Personas
- **GET** `/api/v1/personas` - Listar todas las personas (sin contraseñas)
- **GET** `/api/v1/personas/:id` - Obtener persona por ID (sin contraseña)
- **POST** `/api/v1/personas` - Crear nueva persona
  - Campos requeridos: nombres, apellidos, tipoDocumento, documento
  - Campos opcionales: direccion, telefono, ciudad

### Mascotas
- **GET** `/api/v1/mascotas` - Listar todas las mascotas
- **GET** `/api/v1/mascotas/:id` - Obtener mascota por ID
- **POST** `/api/v1/mascotas` - Crear nueva mascota
  - Campos requeridos: nombre, tipo, genero, edad

### Censos (requiere JWT)
- **GET** `/api/v1/censos` - Listar todos los censos con datos anidados (para mapa)
  - Retorna array con estructura DTO optimizada para Google Maps
  - Incluye datos anidados de mascota y dueño
  - Incluye campo `fotografiaCenso` con imagen en Base64
  
- **GET** `/api/v1/censos/:id` - Obtener censo por ID
  - Retorna censo con datos anidados

- **POST** `/api/v1/censos` - Crear nuevo censo
  - Requiere: `Authorization: Bearer <token>`
  - Campos requeridos: idMascota, idDueno, fotografia (Base64), lat, lon, idProyecto, color
  - Validación: Fotografía máximo 50KB
  - Retorna: Censo creado con datos anidados

### Push Notifications
- **GET** `/api/v1/push/key` - Obtener clave pública VAPID
  - Retorna: `{ publicKey: "..." }`

- **POST** `/api/v1/push/subscriptions` - Suscribirse a push notifications
  - Requiere: `Authorization: Bearer <token>`
  - Retorna: 204 No Content

## Especificaciones de respuestas

### Crear Censo (POST /api/v1/censos)
```json
{
  "id": "uuid",
  "idMascota": "uuid",
  "idDueno": "uuid",
  "fotografia": "data:image/jpeg;base64,...",
  "lat": 4.6097,
  "lon": -74.0817,
  "idProyecto": "PWA_GRUPO_01",
  "color": "#FF5733",
  "fotografiaCenso": "data:image/jpeg;base64,...",
  "mascota": {
    "id": "uuid",
    "nombre": "Firulais",
    "tipo": "PERRO",
    "edad": 3.5
  },
  "dueno": {
    "id": "uuid",
    "nombres": "Juan",
    "apellidos": "Pérez",
    "telefono": "3001234567"
  }
}
```

### Listar Censos (GET /api/v1/censos)
```json
[
  {
    "id": "uuid",
    "lat": 4.6097,
    "lon": -74.0817,
    "color": "#FF5733",
    "idProyecto": "PWA_GRUPO_01",
    "fotografiaCenso": "data:image/jpeg;base64,...",
    "mascota": {
      "id": "uuid",
      "nombre": "Firulais",
      "tipo": "PERRO",
      "edad": 3.5
    },
    "dueno": {
      "id": "uuid",
      "nombres": "Hugo Armando",
      "apellidos": "Cristancho Chinome",
      "telefono": "3001234567"
    }
  }
]
```

## Validaciones

- **Fotografías en censos**: Máximo 50KB (validación por tamaño de Base64)
- **JWT**: Requerido para POST censos y POST push/subscriptions
- **Documentos**: No pueden duplicarse entre personas
- **Base64**: Debe ser una cadena válida (data:image/...;base64,...)
- **Coordenadas**: Números flotantes para lat/lon

## Endpoints especiales

- **POST** `/__mock/reset` - Reiniciar la base de datos a estado inicial
- **GET** `/health` - Health check del servidor

## Estructura de la base de datos

### Modelos

**Personas**
```
id: UUID
nombres: string
apellidos: string
tipoDocumento: string (CC, CE, Pasaporte, etc.)
documento: string (único)
direccion: string
telefono: string
ciudad: string
usuario: string (solo si registro con usuario/contraseña)
contrasena: string (solo si registro con usuario/contraseña)
```

**Mascotas**
```
id: UUID
nombre: string
tipo: string (GATO, PERRO, PAJARO, etc.)
genero: string
edad: number
fotografia: string (URL o Base64)
```

**Censos**
```
id: UUID
idMascota: UUID (FK)
idDueno: UUID (FK)
fotografia: string (Base64, máximo 50KB)
lat: number
lon: number
idProyecto: string
color: string (hex color)
```

## Importar en Postman

Usa los archivos adjuntos:
- `censo-postman-collection.json` - Colección de endpoints
- `censo-postman-environment.json` - Variables de ambiente

En Postman:
1. Import > File > censo-postman-collection.json
2. Import > File > censo-postman-environment.json
3. Selecciona el environment "Censo API - Local Development"
4. La colección ejecutará los tests y guardará variables automáticamente

## Flujo recomendado de pruebas

1. **Login** → Obtener JWT
2. **Crear Persona** → Obtener personaId
3. **Crear Mascota** → Obtener mascotaId
4. **Crear Censo** → Usar JWT + personaId + mascotaId
5. **Listar Censos** → Verificar estructura para mapa
6. **Obtener VAPID** → Para push notifications
7. **Suscribir Push** → Usar JWT

## Notas importantes

- ⚠️ El mock NO implementa buenas prácticas de producción
- ⚠️ La base de datos es en memoria (se reinicia al reiniciar el servidor)
- ⚠️ El JWT es simulado y no valida firma
- ⚠️ Las contraseñas se almacenan en texto plano
- ⚠️ Solo para pruebas locales

## Códigos de estado HTTP

- **200** - OK
- **201** - Created
- **204** - No Content (push subscriptions)
- **400** - Bad Request (validación fallida)
- **401** - Unauthorized (JWT inválido o faltante)
- **404** - Not Found
- **405** - Method Not Allowed
