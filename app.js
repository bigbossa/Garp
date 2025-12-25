// apps/graph/app.js
const next = require('next')
const express = require('express')

// 🔇 ปิด log เมื่อเป็น production
if (process.env.NODE_ENV === 'production') {
  console.log = () => {}
  console.info = () => {}
  console.warn = () => {}
}

// ✅ บังคับให้รัน production mode เสมอ (ไม่มี Next.js dev logo)
const dev = false

const nextApp = next({
  dev,
  dir: __dirname,
})

const handle = nextApp.getRequestHandler()
const router = express.Router()
let isReady = false

nextApp.prepare().then(() => {
  isReady = true
})

router.use((req, res) => {
  if (!isReady) {
    return res.status(503).send('Graph app is starting...')
  }

  handle(req, res)
})

module.exports = router
