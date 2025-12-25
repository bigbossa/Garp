import { NextResponse } from 'next/server'
import { getAllSites } from '@/lib/userService'

export async function GET() {
  try {
    const sites = await getAllSites()
    return NextResponse.json({ sites }, { status: 200 })
  } catch (error) {
    // console.error('Error fetching sites:', error)
    return NextResponse.json(
      { error: 'ไม่สามารถดึงข้อมูล sites ได้' },
      { status: 500 }
    )
  }
}
