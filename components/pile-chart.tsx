"use client"

import { forwardRef, useImperativeHandle, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import type { DataPoint } from "@/app/page"
import jsPDF from "jspdf"

interface PileChartProps {
  dataPoints: DataPoint[]
  projectNumber: string
  date: string
  pileSize: string
  scaleRatio: string
}

export const PileChart = forwardRef<{ exportChart: () => void }, PileChartProps>(
  ({ dataPoints, projectNumber, date, pileSize, scaleRatio }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const exportCanvasRef = useRef<HTMLCanvasElement>(null)
    const graphImageRef = useRef<HTMLImageElement | null>(null)
    const footerImageRef = useRef<HTMLImageElement | null>(null)

    useEffect(() => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      // Select image based on pile size and scale ratio
      const getImagePath = () => {
        if (pileSize === "0.3M") {
          const ratio = scaleRatio.replace(":", "_")
          return `/images/03M/3M-${ratio}.jpg`
        } else if (pileSize === "0.5M") {
          const ratio = scaleRatio.replace(":", "_")
          return `/images/05M/5M-${ratio}.jpg`
        } else {
          return "/images/dc-20ratio-presress-20pile-20i-22-5m-1-0.jpg"
        }
      }
      
      img.src = getImagePath()
      img.onload = () => {
        graphImageRef.current = img
        console.log(`Image dimensions: ${img.width} x ${img.height}`)
        drawPreview()
      }

      // Load footer image
      const footerImg = new Image()
      footerImg.crossOrigin = "anonymous"
      const footerPath = pileSize === "0.3M" ? "/images/Footer/Latter3m.jpg" : "/images/Footer/Latter5m.jpg"
      footerImg.src = footerPath
      footerImg.onload = () => {
        footerImageRef.current = footerImg
        console.log(`Footer loaded: ${footerPath}`)
      }
    }, [pileSize, scaleRatio])
//PDFEditor
    useImperativeHandle(ref, () => ({
      exportChart: () => {
        const exportCanvas = exportCanvasRef.current
        if (!exportCanvas) return

        // A4 size in mm: 210 x 297 (portrait)
        const scale = 2
        const a4Width = 794
        const a4Height = 1122
        exportCanvas.width = a4Width * scale
        exportCanvas.height = a4Height * scale

        const ctx = exportCanvas.getContext("2d")
        if (!ctx) return

        ctx.scale(scale, scale)

        drawExportChart(ctx, a4Width, a4Height)

        // Convert canvas to PDF
        const imgData = exportCanvas.toDataURL("image/png")
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
        })

        // A4 portrait: 210mm x 297mm
        pdf.addImage(imgData, "PNG", 0, 0, 210, 297)
        pdf.save(`แปลงที่-${projectNumber}.pdf`)
      },
    }))

    const drawGrid = (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
      offsetX: number,
      offsetY: number,
    ) => {
      // Grid settings - matched to background image
      const graphMarginLeft = 0.121
      const graphMarginRight = 1.139
      const graphMarginTop = 0.135
      const graphMarginBottom = 0.1149

      const plotWidth = width * (1 - graphMarginLeft - graphMarginRight)
      const plotHeight = height * (1 - graphMarginTop - graphMarginBottom)
      const plotOffsetX = offsetX + width * graphMarginLeft
      const plotOffsetY = offsetY + height * graphMarginTop

      // Draw white background
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(plotOffsetX, plotOffsetY, plotWidth, plotHeight)

      // Draw grid lines
      ctx.strokeStyle = "#d1d5db"
      ctx.lineWidth = 1

      // Vertical grid lines (0-10 on x-axis)
      for (let i = 0; i <= 10; i++) {
        const x = plotOffsetX + (i / 10) * plotWidth
        ctx.beginPath()
        ctx.moveTo(x, plotOffsetY)
        ctx.lineTo(x, plotOffsetY + plotHeight)
        ctx.stroke()
      }

      // Horizontal grid lines (0-10 on y-axis)
      for (let i = 0; i <= 10; i++) {
        const y = plotOffsetY + plotHeight - (i / 10) * plotHeight
        ctx.beginPath()
        ctx.moveTo(plotOffsetX, y)
        ctx.lineTo(plotOffsetX + plotWidth, y)
        ctx.stroke()
      }

      // Draw border
      ctx.strokeStyle = "#000000"
      ctx.lineWidth = 2
      ctx.strokeRect(plotOffsetX, plotOffsetY, plotWidth, plotHeight)

      // Draw axis labels
      ctx.fillStyle = "#000000"
      ctx.font = "14px Arial"
      ctx.textAlign = "center"

      // X-axis labels (0-10)
      for (let i = 0; i <= 10; i++) {
        const x = plotOffsetX + (i / 10) * plotWidth
        ctx.fillText(i.toString(), x, plotOffsetY + plotHeight + 25)
      }

      // Y-axis labels (0-10)
      ctx.textAlign = "right"
      for (let i = 0; i <= 10; i++) {
        const y = plotOffsetY + plotHeight - (i / 10) * plotHeight
        ctx.fillText(i.toString(), plotOffsetX - 10, y + 5)
      }
    }

    const drawGraphBackground = (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
      offsetX: number,
      offsetY: number,
    ) => {
      // Use the background image (which already has the grid)
      if (graphImageRef.current) {
        ctx.drawImage(graphImageRef.current, offsetX, offsetY, width, height)
      }
    }

    const drawDataPoints = (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
      offsetX: number,
      offsetY: number,
    ) => {
      if (dataPoints.length === 0) return

      // Match the grid in background image exactly
      const graphMarginLeft = 0.098
      const graphMarginRight = 0.028
      const graphMarginTop = 0.025
      const graphMarginBottom = 0.10

      const plotWidth = width * (1 - graphMarginLeft - graphMarginRight)
      const plotHeight = height * (1 - graphMarginTop - graphMarginBottom)
      const plotOffsetX = offsetX + width * graphMarginLeft
      const plotOffsetY = offsetY + height * graphMarginTop

      // Draw data points and labels
      dataPoints.forEach((point) => {
        const x = plotOffsetX + (point.horizontal / 10) * plotWidth
        const y = plotOffsetY + plotHeight - (point.vertical / 10) * plotHeight

        // Draw the point (solid blue circle - no hole)
        ctx.fillStyle = "#1e40af"
        ctx.beginPath()
        ctx.arc(x, y, 5, 0, Math.PI * 2)
        ctx.fill()

        // Draw label with yellow background (top-right of point)
        const labelText = `No. ${point.no}`
        ctx.font = "bold 12px Arial"
        const textMetrics = ctx.measureText(labelText)
        const textWidth = textMetrics.width
        const textHeight = 14
        const padding = 3
        
        // Position: top-right of the point
        const labelX = x + 5
        const labelY = y - textHeight - padding - 5

        // Draw yellow background
        ctx.fillStyle = "#ffff00"
        ctx.fillRect(labelX, labelY, textWidth + padding * 2, textHeight + padding * 2)
        
        // Draw border
        ctx.strokeStyle = "#000"
        ctx.lineWidth = 1
        ctx.strokeRect(labelX, labelY, textWidth + padding * 2, textHeight + padding * 2)

        // Draw red text
        ctx.fillStyle = "#ff0000"
        ctx.textAlign = "left"
        ctx.textBaseline = "top"
        ctx.fillText(labelText, labelX + padding, labelY + padding)
      })
    }

    const drawChart = (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
      offsetX: number,
      offsetY: number,
    ) => {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
      ctx.fillStyle = "#fff"
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

      drawGraphBackground(ctx, width, height, offsetX, offsetY)
      
      // Draw grid in the plot area
      const graphMarginLeft = 0.098
      const graphMarginRight = 0.028
      const graphMarginTop = 0.025
      const graphMarginBottom = 0.10
      const plotWidth = width * (1 - graphMarginLeft - graphMarginRight)
      const plotHeight = height * (1 - graphMarginTop - graphMarginBottom)
      const plotOffsetX = offsetX + width * graphMarginLeft
      const plotOffsetY = offsetY + height * graphMarginTop
      
      // Draw 10x10 grid
      ctx.strokeStyle = "#d1d5db"
      ctx.lineWidth = 1
      
      // Vertical grid lines
      for (let i = 0; i <= 10; i++) {
        const x = plotOffsetX + (i / 10) * plotWidth
        ctx.beginPath()
        ctx.moveTo(x, plotOffsetY)
        ctx.lineTo(x, plotOffsetY + plotHeight)
        ctx.stroke()
      }
      
      // Horizontal grid lines
      for (let i = 0; i <= 10; i++) {
        const y = plotOffsetY + (i / 10) * plotHeight
        ctx.beginPath()
        ctx.moveTo(plotOffsetX, y)
        ctx.lineTo(plotOffsetX + plotWidth, y)
        ctx.stroke()
      }
      
      drawDataPoints(ctx, width, height, offsetX, offsetY)
      
      // Draw red border around plot area for debugging (hidden)
      // ctx.strokeStyle = "#ff0000"
      // ctx.lineWidth = 5
      // ctx.strokeRect(plotOffsetX, plotOffsetY, plotWidth, plotHeight)
    }

    const drawExportChart = (ctx: CanvasRenderingContext2D, fullWidth: number, fullHeight: number) => {
      // Adjust for A4 portrait layout
      const chartWidth = Math.min(fullWidth * 0.75, 550)
      const chartHeight = chartWidth
      const chartOffsetX = (fullWidth - chartWidth) / 2
      const chartOffsetY = 130

      ctx.fillStyle = "#fff"
      ctx.fillRect(0, 0, fullWidth, fullHeight)

      // Draw title
      ctx.fillStyle = "#000"
      ctx.font = "bold 13px Arial"
      ctx.textAlign = "center"
      ctx.fillText("D/C RATIO-PRESRESS PILE SIZE I-0.22 (กำลังกด และ เปอร์เซ็นหยุด)", fullWidth / 2, 55)
      ctx.font = "11px Arial"
      const depthText = pileSize === "0.5M" ? "5 เมตร" : "3 เมตร"
      ctx.fillText(`(ความลึกอิ่มตัว ไม่เกิน ${depthText})`, fullWidth / 2, 70)

      // Draw yellow box for date (top right)
      ctx.fillStyle = "#ffff00"
      ctx.fillRect(fullWidth - 140, 15, 130, 22)
      ctx.strokeStyle = "#000"
      ctx.lineWidth = 1
      ctx.strokeRect(fullWidth - 140, 15, 130, 22)
      ctx.fillStyle = "#000"
      ctx.font = "11px Arial"
      ctx.textAlign = "left"
      const formattedDate = new Date(date).toLocaleDateString('th-TH', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      })
      ctx.fillText(`วันที่: ${formattedDate}`, fullWidth - 132, 30)

      // Draw green box for project number (below date box)
      ctx.fillStyle = "#90EE90"
      ctx.fillRect(fullWidth - 140, 42, 130, 22)
      ctx.strokeStyle = "#000"
      ctx.lineWidth = 1
      ctx.strokeRect(fullWidth - 140, 42, 130, 22)
      ctx.fillStyle = "#000"
      ctx.font = "11px Arial"
      ctx.textAlign = "left"
      ctx.fillText(`แปลงที่: ${projectNumber}`, fullWidth - 132, 57)

      drawGraphBackground(ctx, chartWidth, chartHeight, chartOffsetX, chartOffsetY)
      
      // Draw grid on export
      const graphMarginLeft = 0.098
      const graphMarginRight = 0.028
      const graphMarginTop = 0.025
      const graphMarginBottom = 0.10
      const plotWidth = chartWidth * (1 - graphMarginLeft - graphMarginRight)
      const plotHeight = chartHeight * (1 - graphMarginTop - graphMarginBottom)
      const plotOffsetX = chartOffsetX + chartWidth * graphMarginLeft
      const plotOffsetY = chartOffsetY + chartHeight * graphMarginTop
      
      ctx.strokeStyle = "#d1d5db"
      ctx.lineWidth = 1
      
      for (let i = 0; i <= 10; i++) {
        const x = plotOffsetX + (i / 10) * plotWidth
        ctx.beginPath()
        ctx.moveTo(x, plotOffsetY)
        ctx.lineTo(x, plotOffsetY + plotHeight)
        ctx.stroke()
      }
      
      for (let i = 0; i <= 10; i++) {
        const y = plotOffsetY + (i / 10) * plotHeight
        ctx.beginPath()
        ctx.moveTo(plotOffsetX, y)
        ctx.lineTo(plotOffsetX + plotWidth, y)
        ctx.stroke()
      }
      
      drawDataPoints(ctx, chartWidth, chartHeight, chartOffsetX, chartOffsetY)

      // Draw footer image at bottom
      if (footerImageRef.current) {
        const footerHeight = 150
        const footerWidth = fullWidth * 0.9
        const footerX = (fullWidth - footerWidth) / 2
        const footerY = chartOffsetY + chartHeight + 20
        
        ctx.drawImage(footerImageRef.current, footerX, footerY, footerWidth, footerHeight)
      }
    }

    const drawPreview = () => {
      const canvas = canvasRef.current
      if (!canvas || !graphImageRef.current) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const width = 600
      const height = 600
      const offsetX = 60
      const offsetY = 80

      canvas.width = 750
      canvas.height = 750

      drawChart(ctx, width, height, offsetX, offsetY)
    }

    useEffect(() => {
      if (graphImageRef.current) {
        drawPreview()
      }
    }, [dataPoints, projectNumber, date])

    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex justify-center">
            <canvas ref={canvasRef} className="border border-slate-200 rounded-lg shadow-sm max-w-full h-auto" />
          </div>
          <canvas ref={exportCanvasRef} className="hidden" />
        </CardContent>
      </Card>
    )
  },
)

PileChart.displayName = "PileChart"
