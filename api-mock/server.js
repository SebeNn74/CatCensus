import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import { handleLogin, handleRegistroPersona } from './handlers/auth.js'
import { handlePersonas } from './handlers/personas.js'
import { handleMascotas } from './handlers/mascotas.js'
import { handleCensos } from './handlers/censos.js'
import { handlePushKey, handlePushSubscriptions } from './handlers/push.js'
import { resetMockDatabase } from './db.js'

const app = express()
app.use(cors())
app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))

// AUTH ENDPOINTS
app.post('/api/v1/auth/login', async (req, res) => {
  const result = await handleLogin(req.body)
  if (result.data) return res.status(result.status).json(result.data)
  return res.status(result.status).json({ error: result.error })
})

app.post('/api/v1/personas/registro', async (req, res) => {
  const result = await handleRegistroPersona(req.body)
  if (result.data) return res.status(result.status).json(result.data)
  return res.status(result.status).json({ error: result.error })
})

// PERSONAS ENDPOINTS
app.get('/api/v1/personas', async (req, res) => {
  const result = await handlePersonas('GET', null, null)
  return res.status(result.status).json(result.data)
})

app.get('/api/v1/personas/:id', async (req, res) => {
  const result = await handlePersonas('GET', null, null, req.params.id)
  if (result.data) return res.status(result.status).json(result.data)
  return res.status(result.status).json({ error: result.error })
})

app.post('/api/v1/personas', async (req, res) => {
  const result = await handlePersonas('POST', req.body, req.headers.authorization)
  if (result.data) return res.status(result.status).json(result.data)
  return res.status(result.status).json({ error: result.error })
})

// MASCOTAS ENDPOINTS
app.get('/api/v1/mascotas', async (req, res) => {
  const result = await handleMascotas('GET', null, null)
  return res.status(result.status).json(result.data)
})

app.get('/api/v1/mascotas/:id', async (req, res) => {
  const result = await handleMascotas('GET', null, null, req.params.id)
  if (result.data) return res.status(result.status).json(result.data)
  return res.status(result.status).json({ error: result.error })
})

app.post('/api/v1/mascotas', async (req, res) => {
  const result = await handleMascotas('POST', req.body, req.headers.authorization)
  if (result.data) return res.status(result.status).json(result.data)
  return res.status(result.status).json({ error: result.error })
})

// CENSOS ENDPOINTS
app.get('/api/v1/censos', async (req, res) => {
  const result = await handleCensos('GET', null, req.headers.authorization)
  return res.status(result.status).json(result.data)
})

app.get('/api/v1/censos/:id', async (req, res) => {
  const result = await handleCensos('GET', null, req.headers.authorization, req.params.id)
  if (result.data) return res.status(result.status).json(result.data)
  return res.status(result.status).json({ error: result.error })
})

app.post('/api/v1/censos', async (req, res) => {
  const result = await handleCensos('POST', req.body, req.headers.authorization)
  if (result.data) return res.status(result.status).json(result.data)
  return res.status(result.status).json({ error: result.error })
})

// PUSH NOTIFICATIONS ENDPOINTS
app.get('/api/v1/push/key', async (req, res) => {
  const result = await handlePushKey('GET')
  if (result.data) return res.status(result.status).json(result.data)
  return res.status(result.status).json({ error: result.error })
})

app.post('/api/v1/push/subscriptions', async (req, res) => {
  const result = await handlePushSubscriptions('POST', req.body, req.headers.authorization)
  if (result.status === 204) {
    return res.status(204).send()
  }
  if (result.data) return res.status(result.status).json(result.data)
  return res.status(result.status).json({ error: result.error })
})

// MOCK RESET ENDPOINT
app.post('/__mock/reset', (req, res) => {
  resetMockDatabase()
  res.json({ ok: true })
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`🚀 Mock API server running at http://localhost:${PORT}`)
  console.log(`📝 Base URL: http://localhost:${PORT}/api/v1`)
  console.log(`✅ Endpoints available:`)
  console.log(`   - POST /api/v1/auth/login`)
  console.log(`   - POST /api/v1/personas/registro`)
  console.log(`   - GET/POST /api/v1/personas`)
  console.log(`   - GET /api/v1/personas/:id`)
  console.log(`   - GET/POST /api/v1/mascotas`)
  console.log(`   - GET /api/v1/mascotas/:id`)
  console.log(`   - GET/POST /api/v1/censos`)
  console.log(`   - GET /api/v1/censos/:id`)
  console.log(`   - GET /api/v1/push/key`)
  console.log(`   - POST /api/v1/push/subscriptions`)
})

export function startServer(port = PORT) {
  return new Promise((resolve) => {
    app.listen(port, () => {
      console.log(`Mock API server running at http://localhost:${port}/api/v1`)
      resolve()
    })
  })
}
