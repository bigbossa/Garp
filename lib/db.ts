import { Pool } from 'pg'

// Connection pool สำหรับ Garp_RatioPresress database (สำหรับเก็บข้อมูลโปรเจค)
const projectPool = new Pool({
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
projectPool.on('connect', () => {
  // console.log('✅ Connected to Garp_RatioPresress database (Project Data)')
})

projectPool.on('error', (err) => {
  // console.error('❌ Unexpected error on Garp_RatioPresress database client', err)
  process.exit(-1)
})

export default projectPool
