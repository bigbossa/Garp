"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!username.trim() || !password.trim()) {
      toast({
        title: "ข้อมูลไม่ครบ",
        description: "กรุณากรอก Username และ Password",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    
    try {
      const response = await fetch('/graph/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      const result = await response.json()
      console.log('Login response:', result)

      if (response.ok) {
        toast({
          title: "เข้าสู่ระบบสำเร็จ",
          description: "กำลังเข้าสู่ระบบ..."
        })
        
        // เก็บ session ใน localStorage
        // ใช้ usersname เป็นหลัก (ชื่อจริงจากฐานข้อมูล)
        const displayName = result.user.usersname || username
        console.log('Display name to save:', displayName)
        console.log('User object:', result.user)
        localStorage.setItem('isAuthenticated', 'true')
        localStorage.setItem('username', displayName)
        localStorage.setItem('user', JSON.stringify(result.user))
        
        setTimeout(() => {
          router.push('/')
        }, 500)
      } else {
        toast({
          title: "เข้าสู่ระบบไม่สำเร็จ",
          description: result.error || "ข้อมูลไม่ถูกต้อง",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเข้าสู่ระบบได้",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            เข้าสู่ระบบ
          </CardTitle>
          <p className="text-sm text-slate-600 text-center">
            ระบบพล็อตกราฟ D/C Ratio-Presress Pile
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="กรอก username"
                autoComplete="username"
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="กรอก password"
                autoComplete="current-password"
                disabled={isLoading}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </Button>
          </form>

          <div className="mt-4 text-center text-xs text-slate-500">
            <p>ติดต่อผู้ดูแลระบบหากลืม Username หรือ Password</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
