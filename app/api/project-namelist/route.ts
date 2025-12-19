import { NextRequest, NextResponse } from 'next/server'
import {
  getAllProjectNames,
  createProjectName,
  updateProjectName,
  deleteProjectName,
} from '@/lib/projectNameService'
import { getProjectNameByName } from '@/lib/projectNameService'

export async function GET() {
  try {
    const rows = await getAllProjectNames()
    return NextResponse.json(rows)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pj_name } = body
    if (!pj_name) {
      return NextResponse.json({ error: 'ข้อมูลไม่ครบ' }, { status: 400 })
    }
    // Check duplicate (case-insensitive)
    const existing = await getProjectNameByName(pj_name)
    if (existing) {
      return NextResponse.json({ error: 'ชื่อโครงการซ้ำ', pj_id: existing.pj_id }, { status: 409 })
    }
    const id = await createProjectName(pj_name)
    return NextResponse.json({ success: true, pj_id: id })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการบันทึก' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { pj_id, pj_name } = body
    if (!pj_id || !pj_name) {
      return NextResponse.json({ error: 'ข้อมูลไม่ครบ' }, { status: 400 })
    }
    await updateProjectName(Number(pj_id), pj_name)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการอัพเดท' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'กรุณาระบุ id' }, { status: 400 })
    await deleteProjectName(Number(id))
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการลบ' }, { status: 500 })
  }
}
