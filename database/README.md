# วิธีการสร้างฐานข้อมูล

## 1. สร้างฐานข้อมูลใน PostgreSQL

เปิด PowerShell หรือ Command Prompt แล้วรันคำสั่ง:

```bash
# เข้าสู่ PostgreSQL
psql -U postgres -h 127.0.0.1

# สร้างฐานข้อมูล
CREATE DATABASE "Garp_RatioPresress";

# ออกจาก psql
\q
```

## 2. รันไฟล์ SQL เพื่อสร้างตาราง

```bash
# รันไฟล์ setup.sql
psql -U postgres -h 127.0.0.1 -d Garp_RatioPresress -f database/setup.sql
```

หรือใช้คำสั่ง:

```bash
psql -U postgres -h 127.0.0.1 -d Garp_RatioPresress < database/setup.sql
```

## 3. ติดตั้ง package ที่จำเป็น

```bash
npm install pg
# หรือ
pnpm add pg
```

## 4. โครงสร้างตาราง

### ตาราง `projects`
- `id` (SERIAL) - Primary Key
- `project_number` (VARCHAR) - แปลงที่
- `date` (DATE) - วันที่
- `pile_size` (VARCHAR) - ขนาดเสา (0.3M, 0.5M)
- `scale_ratio` (VARCHAR) - อัตราส่วน (1:30, 1:50, etc.)
- `created_at` (TIMESTAMP) - วันเวลาที่สร้าง
- `updated_at` (TIMESTAMP) - วันเวลาที่แก้ไข

### ตาราง `data_points`
- `id` (SERIAL) - Primary Key
- `project_id` (INTEGER) - Foreign Key -> projects(id)
- `no` (VARCHAR) - หมายเลขจุด (A1, A2, etc.)
- `horizontal` (DECIMAL) - ค่าแกนแข็ง (cm)
- `vertical` (DECIMAL) - ค่าแกนอ่อน (cm)
- `created_at` (TIMESTAMP) - วันเวลาที่สร้าง

## 5. การใช้งาน API Functions

```typescript
import { 
  saveProject, 
  getAllProjects, 
  getProjectById, 
  updateProject, 
  deleteProject 
} from '@/lib/projectService'

// บันทึกโครงการใหม่
const projectId = await saveProject(
  '001-001',              // project_number
  '2025-12-19',          // date
  '0.3M',                // pile_size
  '1:30',                // scale_ratio
  dataPoints             // DataPoint[]
)

// ดึงโครงการทั้งหมด
const projects = await getAllProjects()

// ดึงโครงการตาม ID
const project = await getProjectById(1)

// อัพเดทโครงการ
await updateProject(1, '001-002', '2025-12-20', '0.5M', '1:50', dataPoints)

// ลบโครงการ
await deleteProject(1)
```

## 6. ตรวจสอบข้อมูล

```sql
-- ดูโครงการทั้งหมด
SELECT * FROM projects;

-- ดูจุดข้อมูลทั้งหมด
SELECT * FROM data_points;

-- ดูโครงการพร้อมจุดข้อมูล
SELECT p.*, 
       json_agg(json_build_object('no', dp.no, 'horizontal', dp.horizontal, 'vertical', dp.vertical)) as data_points
FROM projects p
LEFT JOIN data_points dp ON p.id = dp.project_id
GROUP BY p.id;
```
