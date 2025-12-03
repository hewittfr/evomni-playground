import React, { useEffect, useRef, useState } from 'react'
import { Box, useTheme, Typography } from '@mui/material'
import { getColorForLabel } from './chartColors'

type Item = { label: string; value: number }

export default function SimpleBarChart({ items, height = 160, color }: { items: Item[], height?: number, color?: string }){
  const theme = useTheme()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [containerWidth, setContainerWidth] = useState<number | null>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver((entries: any) => {
      for (const entry of entries) setContainerWidth(entry.contentRect.width)
    })
    ro.observe(el)
    setContainerWidth(el.getBoundingClientRect().width)
    return () => ro.disconnect()
  }, [])

  // Horizontal layout: labels at left, bars extend right
  const labelWidth = 120
  const rightMargin = 12
  const topMargin = 12
  const bottomMargin = 12
  const chartHeight = height

  const sorted = [...items].sort((a,b) => b.value - a.value)
  const max = Math.max(...sorted.map(i=>i.value), 1)

  const n = sorted.length
  const available = containerWidth ?? Math.max(420, labelWidth + 240)
  const gap = 8
  const rowHeight = Math.max(18, Math.floor((chartHeight - topMargin - bottomMargin) / Math.max(1, n)))
  const svgWidth = available
  const svgHeight = chartHeight

  return (
    <Box ref={containerRef} sx={{ width: '100%', overflowX: 'auto', py: 1 }}>
      <svg width="100%" viewBox={`0 0 ${svgWidth} ${svgHeight}`} height={svgHeight} preserveAspectRatio="xMinYMin meet">
        {/* horizontal rows */}
        {sorted.map((it, idx) => {
          const y = topMargin + idx * rowHeight
          const barMaxWidth = svgWidth - labelWidth - rightMargin - 20
          const w = Math.max(2, Math.round((it.value / max) * barMaxWidth))
          return (
              <g key={it.label}>
                {/* label on left */}
                <text x={8} y={y + rowHeight/2 + 4} fontSize={12} textAnchor="start" fill={theme.palette.text.secondary}>{it.label}</text>
                {/* bar */}
                <rect x={labelWidth} y={y + (rowHeight/2 - 10)} width={w} height={14} fill={color ?? getColorForLabel(it.label, theme)} rx={6} />
                {/* value at end */}
                <text x={labelWidth + w + 8} y={y + rowHeight/2 + 4} fontSize={11} textAnchor="start" fill={theme.palette.text.primary}>{it.value}</text>
              </g>
          )
        })}
      </svg>
    </Box>
  )
}
