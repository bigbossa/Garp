-- สร้างฐานข้อมูล (รันคำสั่งนี้ใน PostgreSQL เป็นครั้งแรก)
-- CREATE DATABASE "Garp_RatioPresress";

-- เชื่อมต่อไปยังฐานข้อมูล Garp_RatioPresress แล้วรันคำสั่งด้านล่าง

\c Garp_RatioPresress;

-- สร้างตาราง projects
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    project_number VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    pile_size VARCHAR(10) NOT NULL,
    scale_ratio VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- สร้างตาราง data_points
CREATE TABLE IF NOT EXISTS data_points (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    no VARCHAR(50) NOT NULL,
    horizontal DECIMAL(10, 2) NOT NULL,
    vertical DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- สร้าง index
CREATE INDEX IF NOT EXISTS idx_projects_project_number ON projects(project_number);
CREATE INDEX IF NOT EXISTS idx_projects_date ON projects(date);
CREATE INDEX IF NOT EXISTS idx_data_points_project_id ON data_points(project_id);

-- Function สำหรับอัพเดท updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- เพิ่มข้อมูลตัวอย่าง (ถ้าต้องการ)
-- INSERT INTO projects (project_number, date, pile_size, scale_ratio) 
-- VALUES ('001-001', '2025-12-19', '0.3M', '1:30');

-- INSERT INTO data_points (project_id, no, horizontal, vertical) 
-- VALUES (1, 'A1', 5.50, 7.25), (1, 'A2', 6.00, 6.75);
