# Cat Census (Censo de Mascotas)

Este repositorio contiene la solución completa para el sistema de Censo de Mascotas. El proyecto está dividido en dos partes principales: el backend simulado (`api-mock`) y la Aplicación Web Progresiva (`pwa-cat-census`).

## 📁 Estructura del Proyecto

### 1. Backend: API Mock (`api-mock`)
Es un servidor REST simulado construido con **Node.js** y **Express.js** que provee los servicios necesarios para que el frontend funcione sin requerir una base de datos de producción real durante la fase de desarrollo.

- **Características Principales:**
  - **Autenticación real simulada:** Cuenta con endpoints para registro (`POST /api/v1/auth/register`) y login (`POST /api/v1/auth/login`) que validan contra los usuarios guardados.
  - **CRUD de Entidades:** Gestiona Personas (dueños), Mascotas (animales) y Censos (avistamientos).
  - **Persistencia en disco:** Aunque es un mock, guarda la información en un archivo local `data.json`, por lo que los datos no se pierden al reiniciar el servidor.

**¿Cómo ejecutarlo?**
```bash
cd api-mock
npm install
npm start
```
*El servidor correrá por defecto en: http://localhost:4000/api/v1*

---

### 2. Frontend: PWA Censo Mascotas (`pwa-cat-census`)
Es una **Aplicación Web Progresiva (PWA)** desarrollada con **React** y **Vite**. Está diseñada con el principio de "Offline-first", permitiendo que los censistas realicen su trabajo en zonas rurales o sin cobertura de internet.

- **Características Principales:**
  - **Capacidades Offline (PWA):** Cuenta con Service Workers y un `manifest.json`. Si no hay internet, los censos, mascotas y personas se guardan localmente en **IndexedDB**.
  - **Cámara Integrada y Compresión:** Permite tomar fotos directamente desde el navegador y, automáticamente mediante un *canvas*, las comprime a Base64 asegurando que pesen **menos de 50Kb**.
  - **Geolocalización Automática:** Captura la ubicación exacta (Latitud y Longitud) usando el GPS del dispositivo al momento de registrar el censo.
  - **Mapa Interactivo:** Desarrollado con `react-leaflet`, muestra todos los censos en el mapa utilizando marcadores personalizados con forma de "gatito" del color del proyecto, integrando la información de mascota y dueño.

**¿Cómo ejecutarlo?**
```bash
cd pwa-cat-census
npm install
npm run dev
```
*La aplicación correrá en: http://localhost:5173/*

---

## 📋 Estado de los Requisitos (Checklist)

A continuación se detalla el progreso del proyecto en relación con el documento de requisitos técnicos:

### ✅ Implementado (Completado)
- [x] **Arquitectura PWA:** `manifest.json` y Service Workers configurados para instalación en escritorio y móviles.
- [x] **Captura de Geolocalización (RF):** Implementada captura automática vía API del navegador en la pantalla de Censos.
- [x] **Cámara y Compresión de Imagen:** Captura embebida en la app y reducción dinámica de calidad para garantizar cadenas Base64 < 50Kb.
- [x] **Integridad de Datos Relacionales:** Formularios dependientes donde el Censo conecta correctamente a una Persona (Dueño) y una Mascota previamente registrada.
- [x] **Autenticación (Login/Registro):** Validación cruzada y creación de Personas (Usuarios) desde la pantalla de inicio de sesión.
- [x] **Mapa Dinámico:** Visualización de pines interactivos personalizados (forma de gatito) según las coordenadas geográficas guardadas.

### ⏳ Pendiente (Lo que todavía toca poner)
De acuerdo a las necesidades completas descritas en los documentos técnicos:

1. **Sincronización Total Manual / Automática:**
   - Actualmente, los datos offline se guardan exitosamente en IndexedDB. Hace falta implementar el botón o proceso de fondo ("Background Sync") que recorra todos esos registros con estado pendiente (Offline) y haga las peticiones `POST` al servidor backend cuando regrese la conexión.
2. **Conexión al Backend Definitivo:**
   - Cuando esté listo, se deberá reemplazar la URL del `api-mock` por la conexión a la **API Real del sistema central** (ej. backend en Java/Spring Boot) conectada a la base de datos de producción (PostgreSQL/MySQL).
3. **Filtros Adicionales en el Mapa (RF07, RF08, etc.):**
   - Implementar controles sobre el mapa para poder filtrar los censos (por fecha, tipo de mascota, proyectos, etc.) en lugar de mostrar siempre todos juntos.
4. **Validaciones Estrictas Finales:**
   - Incluir control riguroso de errores: asegurar que el tipo de documento y el número sean únicos, y que no se puedan enviar fechas incongruentes.
5. **Despliegue a Producción (HTTPS):**
   - Para que la cámara web y la instalación PWA funcionen en los dispositivos móviles de los censistas en la vida real, es mandatorio desplegar este frontend en un entorno de nube que provea un certificado seguro `HTTPS` (ej. Vercel, Netlify, Firebase Hosting, o un servidor propio con Nginx/SSL).
