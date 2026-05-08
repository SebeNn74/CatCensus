import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import { handleLogin } from './handlers/auth.js'
import { handlePersonas } from './handlers/personas.js'
import { handleMascotas } from './handlers/mascotas.js'
import { handleCensos } from './handlers/censos.js'
import { resetMockDatabase } from './db.js'

const app = express()
app.use(cors())
app.use(bodyParser.json())

app.post('/api/v1/auth/login', async (req, res) => {
  const result = await handleLogin(req.body)
  if (result.data) return res.status(result.status).json(result.data)
  return res.status(result.status).json({ error: result.error })
})

app.get('/api/v1/personas', async (req, res) => {
  const result = await handlePersonas('GET', null, req.headers.authorization)
  return res.status(result.status).json(result.data)
})

app.post('/api/v1/personas', async (req, res) => {
  const result = await handlePersonas('POST', req.body, req.headers.authorization)
  if (result.data) return res.status(result.status).json(result.data)
  return res.status(result.status).json({ error: result.error })
})

app.get('/api/v1/mascotas', async (req, res) => {
  const result = await handleMascotas('GET', null, req.headers.authorization)
  return res.status(result.status).json(result.data)
})

app.post('/api/v1/mascotas', async (req, res) => {
  const result = await handleMascotas('POST', req.body, req.headers.authorization)
  if (result.data) return res.status(result.status).json(result.data)
  return res.status(result.status).json({ error: result.error })
})

app.get('/api/v1/censos', async (req, res) => {
  const result = await handleCensos('GET', null, req.headers.authorization)
  return res.status(result.status).json(result.data)
})

app.post('/api/v1/censos', async (req, res) => {
  const result = await handleCensos('POST', req.body, req.headers.authorization)
  if (result.data) return res.status(result.status).json(result.data)
  return res.status(result.status).json({ error: result.error })
})

app.post('/__mock/reset', (req, res) => {
  resetMockDatabase()
  res.json({ ok: true })
})

const PORT = process.env.PORT || 4000

if (process.argv[1] && process.argv[1].includes('server.js')) {
  app.listen(PORT, () => console.log(`Mock API server running at http://localhost:${PORT}/api/v1`))
}

export function startServer(port = PORT) {
  return new Promise((resolve) => {
    app.listen(port, () => {
      console.log(`Mock API server running at http://localhost:${port}/api/v1`)
      resolve()
    })
  })
}
