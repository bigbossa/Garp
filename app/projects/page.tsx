"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash2, FolderOpen } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Project {
  id: number
  project_number: string
  projects_name?: string
  date: string
  pile_size: string
  scale_ratio: string
  created_at: string
  data_points: any[]
}

export default function ProjectsPage() {
  const [list, setList] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const fetchList = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/projects')
      if (res.ok) setList(await res.json())
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchList() }, [])

  const handleOpen = async (id: number) => {
    try {
      const res = await fetch(`/api/projects?id=${id}`)
      if (!res.ok) return
      const project = await res.json()
      // Save project data to sessionStorage and navigate to home where it will be loaded
      sessionStorage.setItem('openProjectData', JSON.stringify(project))
      router.push('/')
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('ต้องการลบโปรเจคหรือไม่?')) return
    try {
      const res = await fetch(`/api/projects?id=${id}`, { method: 'DELETE' })
      if (res.ok) fetchList()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>โปรเจคที่บันทึกไว้</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div>กำลังโหลด...</div>
            ) : (
              <div className="space-y-2">
                {list.length === 0 && <div className="text-sm text-slate-500">ยังไม่มีโปรเจค</div>}
                {list.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-3 bg-slate-50 rounded">
                    <div>
                      <div className="font-medium">{(p as any).projects_name ? `${(p as any).projects_name} | ${p.project_number}` : p.project_number}</div>
                      <div className="text-xs text-slate-400">วันที่: {new Date(p.date).toLocaleDateString('th-TH')}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleOpen(p.id)}><FolderOpen className="w-4 h-4"/> เปิด</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(p.id)}><Trash2 className="w-4 h-4"/></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
