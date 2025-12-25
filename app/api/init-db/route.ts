import { NextResponse } from 'next/server'
import { initializeDatabase } from '@/lib/initDb'

export async function GET() {
  try {
    await initializeDatabase()
    return NextResponse.json({ 
      success: true, 
      message: 'สร้างตารางฐานข้อมูลเรียบร้อยแล้ว' 
    })
  } catch (error) {
    // console.error('Database initialization error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'เกิดข้อผิดพลาดในการสร้างตาราง',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
