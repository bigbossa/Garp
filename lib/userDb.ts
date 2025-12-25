import { Pool } from 'pg'

// Connection pool สำหรับ useryc database (สำหรับระบบ Login)
const userPool = new Pool({
  host: process.env.USER_DB_HOST || '127.0.0.1',
  port: parseInt(process.env.USER_DB_PORT || '5432'),
  database: process.env.USER_DB_NAME || 'useryc',
  user: process.env.USER_DB_USER || 'postgres',
  password: process.env.USER_DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

userPool.on('connect', () => {
  // console.log('✅ Connected to useryc database (User Authentication)')
})

userPool.on('error', (err) => {
  console.error('❌ Unexpected error on useryc database client', err)
})

export default userPool
