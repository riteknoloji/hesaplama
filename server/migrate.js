import dotenv from 'dotenv'
import pg from 'pg'

dotenv.config()

const { Pool } = pg
const primary = process.env.DATABASE_URL
const secondary = process.env.DATABASE_PUBLIC_URL
let pool = new Pool({ connectionString: primary || secondary, ssl: { rejectUnauthorized: false } })

async function migrate() {
  await pool.query(
    `CREATE TABLE IF NOT EXISTS calculations (
      id SERIAL PRIMARY KEY,
      number NUMERIC NOT NULL,
      percentage NUMERIC NOT NULL,
      days INTEGER NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`
  )
  await pool.query('CREATE INDEX IF NOT EXISTS idx_calculations_created_at ON calculations(created_at DESC)')
}

migrate()
  .then(() => {
    console.log('migration ok')
    process.exit(0)
  })
  .catch(async (e) => {
    if (secondary && String(e?.message).includes('ENOTFOUND')) {
      pool = new Pool({ connectionString: secondary, ssl: { rejectUnauthorized: false } })
      try {
        await migrate()
        console.log('migration ok via public url')
        process.exit(0)
        return
      } catch (e2) {
        console.error('migration error fallback', e2?.message || e2)
      }
    } else {
      console.error('migration error', e?.message || e)
    }
    process.exit(1)
  })
