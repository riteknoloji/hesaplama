import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import pg from 'pg'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const { Pool } = pg
const databaseUrl = process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL

let pool = null
if (databaseUrl) {
  pool = new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } })
}

async function ensureTable() {
  if (!pool) return
  await pool.query(
    `CREATE TABLE IF NOT EXISTS calculations (
      id SERIAL PRIMARY KEY,
      number NUMERIC NOT NULL,
      percentage NUMERIC NOT NULL,
      days INTEGER NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`
  )
}

ensureTable().catch(() => {})

app.get('/api/health', (req, res) => {
  res.json({ ok: true, dbConfigured: Boolean(databaseUrl) })
})

app.get('/api/time', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ error: 'DATABASE_URL tanımlı değil' })
  }
  try {
    const r = await pool.query('SELECT NOW() as now')
    res.json({ now: r.rows[0].now })
  } catch (e) {
    res.status(500).json({ error: 'Veritabanı bağlantı hatası', detail: String(e.message || e) })
  }
})

app.get('/api/calculations', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ error: 'DATABASE_URL tanımlı değil' })
  }
  try {
    const r = await pool.query(
      'SELECT number, percentage, days, created_at FROM calculations ORDER BY created_at DESC LIMIT 50'
    )
    res.json(r.rows)
  } catch (e) {
    res.status(500).json({ error: 'Veritabanı sorgu hatası', detail: String(e.message || e) })
  }
})

app.post('/api/calculations', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ error: 'DATABASE_URL tanımlı değil' })
  }
  const { number, percentage, days } = req.body || {}
  const num = Number(number)
  const pct = Number(percentage)
  const d = Number(days)
  if (!Number.isFinite(num) || !Number.isFinite(pct) || !Number.isInteger(d)) {
    return res.status(400).json({ error: 'Geçersiz giriş' })
  }
  try {
    const r = await pool.query(
      'INSERT INTO calculations(number, percentage, days) VALUES ($1, $2, $3) RETURNING number, percentage, days, created_at',
      [num, pct, d]
    )
    res.status(201).json(r.rows[0])
  } catch (e) {
    res.status(500).json({ error: 'Veritabanı ekleme hatası', detail: String(e.message || e) })
  }
})

const port = process.env.PORT || 3001
app.listen(port, () => {
  console.log(`API çalışıyor: http://localhost:${port}`)
})
