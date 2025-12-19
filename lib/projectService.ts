import pool from '@/lib/db'
import type { DataPoint } from '@/app/page'

export interface Project {
  id: number
  project_number: string
  date: string
  pile_size: string
  scale_ratio: string
  created_at: Date
  updated_at: Date
  data_points?: DataPoint[]
}

// บันทึกโครงการใหม่พร้อมจุดข้อมูล
export async function saveProject(
  projectNumber: string,
  date: string,
  pileSize: string,
  scaleRatio: string,
  dataPoints: DataPoint[]
): Promise<number> {
  const client = await pool.connect()
  
  try {
    await client.query('BEGIN')
    
    // บันทึกโครงการ
    const projectResult = await client.query(
      `INSERT INTO projects (project_number, date, pile_size, scale_ratio) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id`,
      [projectNumber, date, pileSize, scaleRatio]
    )
    
    const projectId = projectResult.rows[0].id
    
    // บันทึกจุดข้อมูลทั้งหมด
    for (const point of dataPoints) {
      await client.query(
        `INSERT INTO data_points (project_id, no, horizontal, vertical) 
         VALUES ($1, $2, $3, $4)`,
        [projectId, point.no, point.horizontal, point.vertical]
      )
    }
    
    await client.query('COMMIT')
    return projectId
    
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

// ดึงรายการโครงการทั้งหมด
export async function getAllProjects(): Promise<Project[]> {
  const result = await pool.query(
    `SELECT p.*, 
            json_agg(
              json_build_object(
                'no', dp.no, 
                'horizontal', dp.horizontal, 
                'vertical', dp.vertical
              ) ORDER BY dp.id
            ) as data_points
     FROM projects p
     LEFT JOIN data_points dp ON p.id = dp.project_id
     GROUP BY p.id
     ORDER BY p.created_at DESC`
  )
  
  return result.rows
}

// ดึงข้อมูลโครงการเฉพาะ ID
export async function getProjectById(id: number): Promise<Project | null> {
  const result = await pool.query(
    `SELECT p.*, 
            json_agg(
              json_build_object(
                'no', dp.no, 
                'horizontal', dp.horizontal, 
                'vertical', dp.vertical
              ) ORDER BY dp.id
            ) as data_points
     FROM projects p
     LEFT JOIN data_points dp ON p.id = dp.project_id
     WHERE p.id = $1
     GROUP BY p.id`,
    [id]
  )
  
  return result.rows[0] || null
}

// อัพเดทโครงการ
export async function updateProject(
  id: number,
  projectNumber: string,
  date: string,
  pileSize: string,
  scaleRatio: string,
  dataPoints: DataPoint[]
): Promise<void> {
  const client = await pool.connect()
  
  try {
    await client.query('BEGIN')
    
    // อัพเดทข้อมูลโครงการ
    await client.query(
      `UPDATE projects 
       SET project_number = $1, date = $2, pile_size = $3, scale_ratio = $4
       WHERE id = $5`,
      [projectNumber, date, pileSize, scaleRatio, id]
    )
    
    // ลบจุดข้อมูลเก่า
    await client.query('DELETE FROM data_points WHERE project_id = $1', [id])
    
    // เพิ่มจุดข้อมูลใหม่
    for (const point of dataPoints) {
      await client.query(
        `INSERT INTO data_points (project_id, no, horizontal, vertical) 
         VALUES ($1, $2, $3, $4)`,
        [id, point.no, point.horizontal, point.vertical]
      )
    }
    
    await client.query('COMMIT')
    
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

// ลบโครงการ
export async function deleteProject(id: number): Promise<void> {
  await pool.query('DELETE FROM projects WHERE id = $1', [id])
}
