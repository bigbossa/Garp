import { NextRequest, NextResponse } from 'next/server'
import userPool from '@/lib/userDb'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username') || 'admin'

    // ค้นหา user จาก username (แสดงทั้ง password เพื่อ debug)
    const result = await userPool.query(
      'SELECT * FROM useryc WHERE username = $1',
      [username]
    )

    return NextResponse.json({
      success: true,
      found: result.rows.length > 0,
      user: result.rows[0] || null
    })
  } catch (error) {
    // console.error('Debug user error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage
      },
      { status: 500 }
    )
  }
}
