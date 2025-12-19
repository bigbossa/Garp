-- สร้างฐานข้อมูล Garp_RatioPresress
-- Database: Garp_RatioPresress

-- ตาราง projects - เก็บข้อมูลโครงการกราฟแต่ละรอบ
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    project_number VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    pile_size VARCHAR(10) NOT NULL,
    scale_ratio VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ตาราง data_points - เก็บจุดข้อมูลแต่ละจุดของโครงการ
CREATE TABLE IF NOT EXISTS data_points (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    no VARCHAR(50) NOT NULL,
    horizontal DECIMAL(10, 2) NOT NULL,
    vertical DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- สร้าง index สำหรับการค้นหา
CREATE INDEX IF NOT EXISTS idx_projects_project_number ON projects(project_number);
CREATE INDEX IF NOT EXISTS idx_projects_date ON projects(date);
CREATE INDEX IF NOT EXISTS idx_data_points_project_id ON data_points(project_id);

-- Function สำหรับอัพเดท updated_at อัตโนมัติ
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger สำหรับอัพเดท updated_at เมื่อมีการแก้ไขข้อมูล
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ตัวอย่างการ Query ข้อมูล
-- SELECT p.*, json_agg(json_build_object('no', dp.no, 'horizontal', dp.horizontal, 'vertical', dp.vertical)) as data_points
-- FROM projects p
-- LEFT JOIN data_points dp ON p.id = dp.project_id
-- GROUP BY p.id
-- ORDER BY p.created_at DESC;
