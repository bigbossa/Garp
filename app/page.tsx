"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PileChart } from "@/components/pile-chart"
import { Download, Plus, Trash2, Save, FolderOpen } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Project {
  id: number
  project_number: string
  date: string
  pile_size: string
  scale_ratio: string
  created_at: string
  data_points: DataPoint[]
}

export interface DataPoint {
  no: string
  horizontal: number
  vertical: number
}

export default function PilePlottingSystem() {
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([])
  const [currentPoint, setCurrentPoint] = useState({ no: "", horizontal: "", vertical: "" })
  const [projectNumber, setProjectNumber] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [pileSize, setPileSize] = useState("0.3M")
  const [scaleRatio, setScaleRatio] = useState("1:30")
  const [savedProjects, setSavedProjects] = useState<Project[]>([])
  const [showProjectList, setShowProjectList] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const chartRef = useRef<{ exportChart: () => void }>(null)
  const { toast } = useToast()

  // Update scale ratio options when pile size changes
  const handlePileSizeChange = (value: string) => {
    setPileSize(value)
    setScaleRatio("1:30") // Reset to default scale when pile size changes
  }

  // Get available scale ratios based on pile size
  const getScaleOptions = () => {
    if (pileSize === "0.3M") {
      return [
        { value: "1:150", label: "ไม่ล้มดิ่ง" },
        { value: "1:100", label: "1:100" },
        { value: "1:75", label: "1:75" },
        { value: "1:50", label: "1:50" },
        { value: "1:30", label: "1:30" },
      ]
    } else {
      return [
        { value: "1:150", label: "ไม่ล้มดิ่ง" },
        { value: "1:100", label: "1:100" },
        { value: "1:75", label: "1:75" },
        { value: "1:50", label: "1:50" },
        { value: "1:30", label: "1:30" },
      ]
    }
  }

  const addDataPoint = () => {
    if (currentPoint.no && currentPoint.horizontal && currentPoint.vertical) {
      const newPoint: DataPoint = {
        no: currentPoint.no,
        horizontal: Number.parseFloat(currentPoint.horizontal),
        vertical: Number.parseFloat(currentPoint.vertical),
      }
      setDataPoints([...dataPoints, newPoint])
      setCurrentPoint({ no: "", horizontal: "", vertical: "" })
    }
  }

  const removeDataPoint = (index: number) => {
    setDataPoints(dataPoints.filter((_, i) => i !== index))
  }

  const handleExport = () => {
    if (chartRef.current) {
      chartRef.current.exportChart()
    }
  }

  // โหลดรายการโปรเจคที่บันทึกไว้
  const loadProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      if (response.ok) {
        const projects = await response.json()
        setSavedProjects(projects)
        setShowProjectList(true)
        setCurrentPage(1) // Reset to first page
      }
    } catch (error) {
      console.error('Error loading projects:', error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดรายการโปรเจคได้",
        variant: "destructive"
      })
    }
  }

  // บันทึกโปรเจค
  const handleSaveProject = async () => {
    if (!projectNumber || dataPoints.length === 0) {
      toast({
        title: "ข้อมูลไม่ครบ",
        description: "กรุณากรอกแปลงที่และเพิ่มจุดข้อมูลอย่างน้อย 1 จุด",
        variant: "destructive"
      })
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectNumber,
          date,
          pileSize,
          scaleRatio,
          dataPoints
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "บันทึกสำเร็จ",
          description: `บันทึกโปรเจค ${projectNumber} เรียบร้อยแล้ว`,
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error saving project:', error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error instanceof Error ? error.message : "ไม่สามารถบันทึกโปรเจคได้",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  // โหลดโปรเจคที่เลือก
  const loadProject = (project: Project) => {
    setProjectNumber(project.project_number)
    setDate(project.date)
    setPileSize(project.pile_size)
    setScaleRatio(project.scale_ratio)
    setDataPoints(project.data_points || [])
    setShowProjectList(false)
    toast({
      title: "โหลดโปรเจคสำเร็จ",
      description: `โหลดโปรเจค ${project.project_number} แล้ว`,
    })
  }

  // ลบโปรเจค
  const deleteProject = async (id: number, projectNumber: string) => {
    if (!confirm(`ต้องการลบโปรเจค ${projectNumber} หรือไม่?`)) return

    try {
      const response = await fetch(`/api/projects?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: "ลบสำเร็จ",
          description: `ลบโปรเจค ${projectNumber} แล้ว`,
        })
        loadProjects() // โหลดรายการใหม่
      }
    } catch (error) {
      console.error('Error deleting project:', error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบโปรเจคได้",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">ระบบพล็อตกราฟ D/C Ratio-Presress Pile</h1>
          <p className="text-sm text-slate-600 mt-1">กรอกข้อมูลเพื่อพล็อตจุดบนกราฟและส่งออกผลลัพธ์</p>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">

        <div className="grid md:grid-cols-3 gap-6">
          {/* Data Input Form */}

          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                กรอกข้อมูล
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Project Info */}
              <div className="space-y-2">
                <Label htmlFor="project">แปลงที่</Label>
                <Input
                  id="project"
                  value={projectNumber}
                  onChange={(e) => setProjectNumber(e.target.value)}
                  placeholder="333-333"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">วันที่</Label>
                <Input id="date" value={date} type="date" onChange={(e) => setDate(e.target.value)} placeholder="16/12/65" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pileSize">ขนาดเสา</Label>
                <select
                  id="pileSize"
                  value={pileSize}
                  onChange={(e) => handlePileSizeChange(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="0.3M">0.3M</option>
                  <option value="0.5M">0.5M</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="scaleRatio">อัตราส่วน</Label>
                <select
                  id="scaleRatio"
                  value={scaleRatio}
                  onChange={(e) => setScaleRatio(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {getScaleOptions().map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="border-t pt-4 space-y-4">
                <h3 className="font-semibold">เพิ่มจุดข้อมูล</h3>

                <div className="space-y-2">
                  <Label htmlFor="no">No.</Label>
                  <Input
                    id="no"
                    value={currentPoint.no}
                    onChange={(e) => setCurrentPoint({ ...currentPoint, no: e.target.value })}
                    placeholder="A1, A2, ..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="horizontal">แกนนอน (cm.)</Label>
                  <Input
                    id="horizontal"
                    type="number"
                    step="0.01"
                    value={currentPoint.horizontal}
                    onChange={(e) => setCurrentPoint({ ...currentPoint, horizontal: e.target.value })}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vertical">แกนตั้ง (cm.)</Label>
                  <Input
                    id="vertical"
                    type="number"
                    step="0.01"
                    value={currentPoint.vertical}
                    onChange={(e) => setCurrentPoint({ ...currentPoint, vertical: e.target.value })}
                    placeholder="0.00"
                  />
                </div>

                <Button onClick={addDataPoint} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  เพิ่มจุดข้อมูล
                </Button>
              </div>

              {/* Data Points List */}
              {dataPoints.length > 0 && (
                <div className="border-t pt-4 space-y-2">
                  <h3 className="font-semibold">จุดข้อมูลที่เพิ่ม</h3>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {dataPoints.map((point, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                        <span className="text-sm">
                          {point.no}: ({point.horizontal.toFixed(2)}, {point.vertical.toFixed(2)})
                        </span>
                        <Button variant="ghost" size="sm" onClick={() => removeDataPoint(index)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="border-t pt-4 space-y-2">
                <Button 
                  onClick={handleSaveProject} 
                  className="w-full" 
                  variant="outline" 
                  disabled={dataPoints.length === 0 || isSaving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? "กำลังบันทึก..." : "บันทึกโปรเจค"}
                </Button>
                
                <Button 
                  onClick={loadProjects} 
                  className="w-full" 
                  variant="outline"
                >
                  <FolderOpen className="w-4 h-4 mr-2" />
                  เปิดโปรเจคที่บันทึก
                </Button>

                <Button onClick={handleExport} className="w-full" variant="default" disabled={dataPoints.length === 0}>
                  <Download className="w-4 h-4 mr-2" />
                  Export รูปภาพ PDF
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Chart Display */}
          <div className="md:col-span-2">
            <PileChart ref={chartRef} dataPoints={dataPoints} projectNumber={projectNumber} date={date} pileSize={pileSize} scaleRatio={scaleRatio} />
          </div>
        </div>

        {/* Project List Modal */}
        {showProjectList && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-4xl w-full h-[80vh] overflow-hidden flex flex-col">
              <CardHeader className="flex-shrink-0">
                <CardTitle className="flex items-center justify-between">
                  <span>โปรเจคที่บันทึกไว้</span>
                  <Button variant="ghost" size="sm" onClick={() => setShowProjectList(false)}>
                    ✕
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 overflow-hidden">
                {savedProjects.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    ยังไม่มีโปรเจคที่บันทึกไว้
                  </div>
                ) : (
                  <>
                    {/* Controls */}
                    <div className="flex items-center justify-between mb-4 pb-3 border-b">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-600">แสดง</span>
                        <select
                          value={itemsPerPage}
                          onChange={(e) => {
                            setItemsPerPage(Number(e.target.value))
                            setCurrentPage(1)
                          }}
                          className="flex h-8 rounded-md border border-input bg-background px-2 py-1 text-sm"
                        >
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                          <option value={30}>30</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                        </select>
                        <span className="text-sm text-slate-600">รายการ</span>
                      </div>
                      <div className="text-sm text-slate-600">
                        ทั้งหมด {savedProjects.length} รายการ
                      </div>
                    </div>

                    {/* Project List */}
                    <div className="flex-1 overflow-y-auto space-y-2">
                      {savedProjects
                        .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                        .map((project) => (
                          <div
                            key={project.id}
                            className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                          >
                            <div className="flex-1">
                              <div className="font-semibold text-lg">{project.project_number}</div>
                              <div className="text-sm text-slate-600">
                                วันที่: {new Date(project.date).toLocaleDateString('th-TH')} | 
                                ขนาด: {project.pile_size} | 
                                อัตราส่วน: {project.scale_ratio} | 
                                จุดข้อมูล: {project.data_points?.length || 0} จุด
                              </div>
                              <div className="text-xs text-slate-400 mt-1">
                                บันทึกเมื่อ: {new Date(project.created_at).toLocaleDateString('th-TH')}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => loadProject(project)}
                                size="sm"
                                variant="default"
                              >
                                เปิด
                              </Button>
                              <Button
                                onClick={() => deleteProject(project.id, project.project_number)}
                                size="sm"
                                variant="destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {Math.ceil(savedProjects.length / itemsPerPage) > 1 && (
                      <div className="flex items-center justify-center gap-2 mt-4 pt-3 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                        >
                          ก่อนหน้า
                        </Button>
                        
                        <div className="flex gap-1">
                          {Array.from({ length: Math.ceil(savedProjects.length / itemsPerPage) }, (_, i) => i + 1)
                            .filter(page => {
                              // Show first page, last page, current page, and pages around current
                              const totalPages = Math.ceil(savedProjects.length / itemsPerPage)
                              return page === 1 || 
                                     page === totalPages || 
                                     Math.abs(page - currentPage) <= 1
                            })
                            .map((page, index, array) => (
                              <div key={page} className="flex gap-1">
                                {index > 0 && array[index - 1] !== page - 1 && (
                                  <span className="px-2 py-1 text-sm">...</span>
                                )}
                                <Button
                                  variant={currentPage === page ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setCurrentPage(page)}
                                  className="min-w-[2.5rem]"
                                >
                                  {page}
                                </Button>
                              </div>
                            ))}
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.min(Math.ceil(savedProjects.length / itemsPerPage), prev + 1))}
                          disabled={currentPage === Math.ceil(savedProjects.length / itemsPerPage)}
                        >
                          ถัดไป
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}
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
