import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser } from '@/lib/userService'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!username || !password) {
      return NextResponse.json(
        { error: 'กรุณากรอก Username และ Password' },
        { status: 400 }
      )
    }

    // ตรวจสอบการ Login จากฐานข้อมูล
    const user = await authenticateUser(username, password)

    if (user) {
      // Login สำเร็จ - ส่งข้อมูล user กลับไป (ไม่รวม password)
      return NextResponse.json(
        {
          success: true,
          message: 'เข้าสู่ระบบสำเร็จ',
          user: {
            iduser: user.iduser,
            usersname: user.usersname,
            username: user.username,
            site: user.site,
            department: user.department,
            userid: user.userid,
            role: user.role,
          },
        },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        { error: 'Username หรือ Password ไม่ถูกต้อง' },
        { status: 401 }
      )
    }
  } catch (error) {
    // console.error('Login error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { 
        error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ',
        details: errorMessage 
      },
      { status: 500 }
    )
  }
}
