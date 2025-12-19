"use client"

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Trash2, Edit, Menu } from 'lucide-react'

interface ProjectName {
  pj_id: number
  pj_name: string
  date_created: string
  date_updated: string
}

export default function ProjectNameListPage() {
  const [list, setList] = useState<ProjectName[]>([])
  const [pjName, setPjName] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const [showHeaderMenu, setShowHeaderMenu] = useState(false)
  const headerMenuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const el = headerMenuRef.current as any
      if (!el) return
      if (el.contains && !el.contains(e.target)) setShowHeaderMenu(false)
    }
    if (showHeaderMenu) window.addEventListener('click', handler)
    return () => window.removeEventListener('click', handler)
  }, [showHeaderMenu])

  const fetchList = async () => {
    const res = await fetch('/api/project-namelist')
    if (res.ok) setList(await res.json())
  }

  useEffect(() => { fetchList() }, [])

  const handleCreate = async () => {
    if (!pjName) return
    // client-side duplicate check
    const exists = list.find(l => l.pj_name.toLowerCase() === pjName.toLowerCase())
    if (exists) {
      toast({ title: 'ข้อมูลซ้ำ', description: 'มีชื่อโครงการนี้อยู่แล้ว', variant: 'default' })
      setPjName('')
      return
    }

    const res = await fetch('/api/project-namelist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pj_name: pjName }) })
    if (res.status === 409) {
      toast({ title: 'ข้อมูลซ้ำ', description: 'มีชื่อโครงการนี้อยู่แล้ว', variant: 'default' })
      setPjName('')
      fetchList()
      return
    }

    setPjName('')
    fetchList()
  }

  const handleEdit = (p: ProjectName) => {
    setEditingId(p.pj_id)
    setPjName(p.pj_name)
  }

  const handleUpdate = async () => {
    if (!editingId) return
    await fetch('/api/project-namelist', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pj_id: editingId, pj_name: pjName }) })
    setEditingId(null)
    setPjName('')
    fetchList()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('ต้องการลบรายการนี้หรือไม่?')) return
    await fetch(`/api/project-namelist?id=${id}`, { method: 'DELETE' })
    fetchList()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">ระบบพล็อตกราฟ D/C Ratio-Presress Pile</h1>
            <p className="text-sm text-slate-600 mt-1">จัดการรายโครงการ</p>
          </div>
          <div className="flex items-center gap-4 relative" ref={headerMenuRef as any}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHeaderMenu((v) => !v)}
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6 text-slate-400" />
            </Button>

            {showHeaderMenu && (
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-md shadow-lg z-50 overflow-hidden">
                <button className="w-full text-left px-3 py-2 hover:bg-slate-50" onClick={() => { setShowHeaderMenu(false); router.push('/') }}>
                  หน้าแรก
                </button>
                <button className="w-full text-left px-3 py-2 hover:bg-slate-50" onClick={() => { setShowHeaderMenu(false); router.push('/project-namelist') }}>
                  จัดการรายโครงการ
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>จัดการรายโครงการ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-3 mb-4">
                <div>
                  <Label>โครงการ</Label>
                  <Input value={pjName} onChange={(e:any) => setPjName(e.target.value)} />
                </div>
              </div>

              <div className="flex gap-2 mb-4">
                {editingId ? (
                  <>
                    <Button onClick={handleUpdate}>บันทึก</Button>
                    <Button variant="outline" onClick={() => { setEditingId(null); setPjName(''); }}>ยกเลิก</Button>
                  </>
                ) : (
                  <Button onClick={handleCreate}>เพิ่ม</Button>
                )}
              </div>

              <div className="space-y-2">
                {list.map(item => (
                  <div key={item.pj_id} className="flex items-center justify-between p-3 bg-slate-50 rounded">
                    <div>
                      <div className="font-medium">{item.pj_name}</div>
                      <div className="text-xs text-slate-400">สร้าง: {new Date(item.date_created).toLocaleString('th-TH')}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}><Edit className="w-4 h-4"/></Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(item.pj_id)}><Trash2 className="w-4 h-4"/></Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2">
            <p className="text-sm text-slate-600">
              © {new Date().getFullYear()} ระบบพล็อตกราฟ D/C Ratio-Presress Pile. All rights reserved by JTP.
            </p>
            <p className="text-xs text-slate-500">
              Powered by Next.js & PostgreSQL
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
