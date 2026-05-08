Mock API modular para CatCensus

- Interceptor en el navegador: importa y llama a `initializeMockApi()` desde tu app para interceptar `fetch` en `*/api/v1/*`.
- Servidor local opcional: en `api-mock/` ejecuta `npm install` y `npm start` para levantar un servidor HTTP en `http://localhost:4000/api/v1`.

Endpoints expuestos (simulan la API real):
- POST /api/v1/auth/login  -> { usuario, contrasena }
- GET /api/v1/personas
- POST /api/v1/personas -> requiere Authorization: Bearer mock_jwt_token_12345
- GET /api/v1/mascotas
- POST /api/v1/mascotas -> requiere Authorization
- GET /api/v1/censos
- POST /api/v1/censos -> requiere Authorization

Utilities:
- POST /__mock/reset -> resetea la base de datos in-memory (solo para el servidor Express).

Credenciales mock: any usuario + contraseña `password` -> token `mock_jwt_token_12345`.
