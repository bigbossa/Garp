import userPool from './userDb'

// Interface สำหรับ User
export interface User {
  iduser: number
  usersname: string
  username: string
  site: string
  password: string
  department: string
  userid: string
  role: number
}

// ดึงข้อมูล User จาก username และ site
export async function getUserByUsernameAndSite(
  username: string,
  site: string
): Promise<User | null> {
  try {
    const query = `
      SELECT iduser, usersname, site, username, password, department, userid, "Role" as role
      FROM useryc 
      WHERE username = $1 AND site = $2
    `
    const result = await userPool.query(query, [username, site])

    if (result.rows.length === 0) {
      return null
    }

    return result.rows[0] as User
  } catch (error) {
    // console.error('Error fetching user:', error)
    throw error
  }
}

// ดึงข้อมูล User จาก username เฉยๆ (ไม่ต้องระบุ site)
export async function getUserByUsername(username: string): Promise<User | null> {
  try {
    const query = `
      SELECT iduser, usersname, site, username, password, department, userid, "Role" as role
      FROM useryc 
      WHERE username = $1
      LIMIT 1
    `
    const result = await userPool.query(query, [username])

    if (result.rows.length === 0) {
      return null
    }

    return result.rows[0] as User
  } catch (error) {
    // console.error('Error fetching user:', error)
    throw error
  }
}

// ตรวจสอบการ Login (ไม่ต้องระบุ site)
export async function authenticateUser(
  username: string,
  password: string
): Promise<User | null> {
  try {
    // console.log('🔍 Attempting to authenticate user:', username)
    const user = await getUserByUsername(username)

    if (!user) {
      console.log('❌ User not found:', username)
      return null
    }

    // console.log('✅ User found:', { username: user.username, site: user.site })
    // console.log('🔑 Comparing passwords...')
    // console.log('Input password length:', password.length)
    // console.log('Stored password length:', user.password.length)

    // เปรียบเทียบ password (ถ้าเป็น plain text)
    // หมายเหตุ: ควรใช้ bcrypt เพื่อความปลอดภัย
    if (user.password === password) {
      console.log('✅ Password match!')
      // ไม่ return password กลับไป
      const { password: _, ...userWithoutPassword } = user
      return userWithoutPassword as User
    }

    // console.log('❌ Password mismatch!')
    return null
  } catch (error) {
    // console.error('Error authenticating user:', error)
    throw error
  }
}

// ดึงรายการ sites ทั้งหมด
export async function getAllSites(): Promise<string[]> {
  try {
    const query = 'SELECT DISTINCT site FROM useryc ORDER BY site'
    const result = await userPool.query(query)
    return result.rows.map((row) => row.site)
  } catch (error) {
    // console.error('Error fetching sites:', error)
    throw error
  }
}
