import { NextResponse } from 'next/server'
import userPool from '@/lib/userDb'
import projectPool from '@/lib/db'

export async function GET() {
  try {
    // ทดสอบเชื่อมต่อ useryc database
    const userDbTest = await userPool.query('SELECT NOW() as time, current_database() as db')
    
    // ทดสอบเชื่อมต่อ Garp_RatioPresress database
    const projectDbTest = await projectPool.query('SELECT NOW() as time, current_database() as db')
    
    // ทดสอบ query ตาราง useryc
    const usersTest = await userPool.query('SELECT COUNT(*) as count FROM useryc')
    
    return NextResponse.json({
      success: true,
      userDb: {
        connected: true,
        database: userDbTest.rows[0].db,
        time: userDbTest.rows[0].time,
        usersCount: usersTest.rows[0].count
      },
      projectDb: {
        connected: true,
        database: projectDbTest.rows[0].db,
        time: projectDbTest.rows[0].time
      }
    })
  } catch (error) {
    // console.error('Database test error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { 
        success: false,
        error: 'Database connection failed',
        details: errorMessage
      },
      { status: 500 }
    )
  }
}
