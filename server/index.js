import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import pg from 'pg'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const { Pool } = pg
const databaseUrlPublic = process.env.DATABASE_PUBLIC_URL
const databaseUrlPrivate = process.env.DATABASE_URL
const initialConn = databaseUrlPublic || databaseUrlPrivate

let pool = null
if (initialConn) {
  pool = new Pool({ connectionString: initialConn, ssl: { rejectUnauthorized: false } })
}

async function ensurePoolHealthy() {
  if (!pool) return false
  try {
    await pool.query('SELECT 1')
    return true
  } catch {
    if (databaseUrlPrivate && pool && initialConn !== databaseUrlPrivate) {
      await pool.end().catch(() => {})
      pool = new Pool({ connectionString: databaseUrlPrivate, ssl: { rejectUnauthorized: false } })
      try {
        await pool.query('SELECT 1')
        return true
      } catch {
        return false
      }
    }
    return false
  }
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
  await pool.query('ALTER TABLE calculations ADD COLUMN IF NOT EXISTS result NUMERIC')
}

ensureTable().catch(() => {})

app.get('/api/health', async (req, res) => {
  const configured = Boolean(initialConn)
  let healthy = false
  if (configured) healthy = await ensurePoolHealthy()
  res.json({ ok: true, dbConfigured: configured, dbHealthy: healthy, using: healthy ? 'active' : (databaseUrlPublic ? 'public' : 'private') })
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

app.get('/api/db-check', async (req, res) => {
  if (!pool) return res.json({ ok: false })
  try {
    await pool.query('SELECT 1')
    res.json({ ok: true })
  } catch (e) {
    res.json({ ok: false, error: String(e.message || e) })
  }
})

app.get('/api/calculations', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ error: 'DATABASE_URL tanımlı değil' })
  }
  try {
    const allowed = [50, 100, 150, 200, 250]
    const limitQ = Number(req.query.limit)
    const pageQ = Number(req.query.page)
    const limit = allowed.includes(limitQ) ? limitQ : 50
    const page = Number.isInteger(pageQ) && pageQ > 0 ? pageQ : 1
    const offset = (page - 1) * limit
    const count = await pool.query('SELECT COUNT(*) AS c FROM calculations')
    const r = await pool.query(
      'SELECT id, number, percentage, days, COALESCE(result, number * POWER(1 + (percentage/100.0), days)) AS result, created_at FROM calculations ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    )
    res.json({ rows: r.rows, total: Number(count.rows[0].c), page, limit })
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
    let result = num
    for (let i = 0; i < d; i++) {
      result += result * (pct / 100)
    }
    const r = await pool.query(
      'INSERT INTO calculations(number, percentage, days, result) VALUES ($1, $2, $3, $4) RETURNING id, number, percentage, days, result, created_at',
      [num, pct, d, result]
    )
    res.status(201).json(r.rows[0])
  } catch (e) {
    res.status(500).json({ error: 'Veritabanı ekleme hatası', detail: String(e.message || e) })
  }
})

app.delete('/api/calculations/:id', async (req, res) => {
  if (!pool) {
    return res.status(503).json({ error: 'DATABASE_URL tanımlı değil' })
  }
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Geçersiz id' })
  try {
    await pool.query('DELETE FROM calculations WHERE id=$1', [id])
    res.status(204).end()
  } catch (e) {
    res.status(500).json({ error: 'Veritabanı silme hatası', detail: String(e.message || e) })
  }
})

const port = process.env.PORT || 3001
app.listen(port, () => {
  console.log(`API çalışıyor: http://localhost:${port}`)
})
