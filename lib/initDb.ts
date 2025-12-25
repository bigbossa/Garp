import projectPool from './db'

// ฟังก์ชันเช็คการเชื่อมต่อและสร้างตารางอัตโนมัติ
export async function initializeDatabase() {
  const client = await projectPool.connect()
  
  try {
    // console.log('🔄 กำลังสร้างตารางฐานข้อมูล...')
    
    // สร้างตาราง projects
    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        project_number VARCHAR(100) NOT NULL,
        projects_name VARCHAR(255),
        date DATE NOT NULL,
        pile_size VARCHAR(10) NOT NULL,
        scale_ratio VARCHAR(10) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    // สร้างตาราง data_points
    await client.query(`
      CREATE TABLE IF NOT EXISTS data_points (
        id SERIAL PRIMARY KEY,
        project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        no VARCHAR(50) NOT NULL,
        horizontal DECIMAL(10, 2) NOT NULL,
        vertical DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    // สร้าง indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_projects_project_number ON projects(project_number)
    `)
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_projects_date ON projects(date)
    `)
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_data_points_project_id ON data_points(project_id)
    `)
    
    // สร้าง function สำหรับ auto-update timestamp
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `)
    
    // สร้าง trigger
    await client.query(`
      DROP TRIGGER IF EXISTS update_projects_updated_at ON projects
    `)
    await client.query(`
      CREATE TRIGGER update_projects_updated_at 
      BEFORE UPDATE ON projects
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `)
    
    // console.log('✅ สร้างตารางฐานข้อมูลเรียบร้อยแล้ว')
    
  } catch (error) {
    // console.error('❌ เกิดข้อผิดพลาดในการสร้างตาราง:', error)
    throw error
  } finally {
    client.release()
  }
}
