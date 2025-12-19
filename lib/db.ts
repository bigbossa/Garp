import { Pool } from 'pg'

// สร้าง connection pool สำหรับเชื่อมต่อ PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'Garp_RatioPresress',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 20, // จำนวน connection สูงสุด
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// ทดสอบการเชื่อมต่อ
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database')
})

pool.on('error', (err) => {
  console.error('❌ Unexpected error on PostgreSQL client', err)
  process.exit(-1)
})

export default pool
