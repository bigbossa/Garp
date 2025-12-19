import { NextRequest, NextResponse } from 'next/server'
import { saveProject, getAllProjects, getProjectById, deleteProject } from '@/lib/projectService'

// GET - ดึงรายการโปรเจคทั้งหมด หรือ โปรเจคเฉพาะ ID
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')
    
    if (id) {
      const project = await getProjectById(parseInt(id))
      if (!project) {
        return NextResponse.json({ error: 'ไม่พบโปรเจค' }, { status: 404 })
      }
      return NextResponse.json(project)
    }
    
    const projects = await getAllProjects()
    return NextResponse.json(projects)
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' },
      { status: 500 }
    )
  }
}

// POST - บันทึกโปรเจคใหม่
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectNumber, date, pileSize, scaleRatio, dataPoints } = body
    
    // ตรวจสอบข้อมูล
    if (!projectNumber || !date || !pileSize || !scaleRatio || !dataPoints || dataPoints.length === 0) {
      return NextResponse.json(
        { error: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
        { status: 400 }
      )
    }
    
    const projectId = await saveProject(
      projectNumber,
      date,
      pileSize,
      scaleRatio,
      dataPoints
    )
    
    return NextResponse.json({
      success: true,
      message: 'บันทึกโปรเจคเรียบร้อยแล้ว',
      projectId
    })
  } catch (error) {
    console.error('Error saving project:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' },
      { status: 500 }
    )
  }
}

// DELETE - ลบโปรเจค
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'กรุณาระบุ ID' }, { status: 400 })
    }
    
    await deleteProject(parseInt(id))
    
    return NextResponse.json({
      success: true,
      message: 'ลบโปรเจคเรียบร้อยแล้ว'
    })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการลบข้อมูล' },
      { status: 500 }
    )
  }
}
