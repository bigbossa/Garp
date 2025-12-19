import pool from '@/lib/db'

export interface ProjectName {
  pj_id: number
  pj_name: string
  date_created: string
  date_updated: string
}

export async function getAllProjectNames(): Promise<ProjectName[]> {
  const result = await pool.query(`SELECT * FROM project_namelist ORDER BY date_created DESC`)
  return result.rows
}

export async function getProjectNameById(id: number): Promise<ProjectName | null> {
  const result = await pool.query(`SELECT * FROM project_namelist WHERE pj_id = $1`, [id])
  return result.rows[0] || null
}

export async function getProjectNameByName(pj_name: string): Promise<ProjectName | null> {
  const result = await pool.query(`SELECT * FROM project_namelist WHERE LOWER(pj_name) = LOWER($1)`, [pj_name])
  return result.rows[0] || null
}

export async function createProjectName(pj_name: string): Promise<number> {
  const result = await pool.query(
    `INSERT INTO project_namelist (pj_name) VALUES ($1) RETURNING pj_id`,
    [pj_name]
  )
  return result.rows[0].pj_id
}

export async function updateProjectName(id: number, pj_name: string): Promise<void> {
  await pool.query(
    `UPDATE project_namelist SET pj_name = $1, date_updated = CURRENT_TIMESTAMP WHERE pj_id = $2`,
    [pj_name, id]
  )
}

export async function deleteProjectName(id: number): Promise<void> {
  await pool.query(`DELETE FROM project_namelist WHERE pj_id = $1`, [id])
}

export default {
  getAllProjectNames,
  getProjectNameById,
  getProjectNameByName,
  createProjectName,
  updateProjectName,
  deleteProjectName,
}
