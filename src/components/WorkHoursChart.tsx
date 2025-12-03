import React, { useEffect, useRef, useState } from 'react'
import { Box, useTheme, Typography } from '@mui/material'
import { getColorForLabel } from './chartColors'

type Series = { name: string; months: Array<{ month: string; value: number }> }

export default function WorkHoursChart({ series, height = 140 }: { series?: Series[], height?: number }){
  const theme = useTheme()
  if (!series || !series.length) return <Box sx={{ height: height + 60, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.palette.text.secondary }}>No data</Box>

  const monthsSet = new Set<string>()
  series.forEach(s => s.months.forEach(m => monthsSet.add(m.month)))
  const months = Array.from(monthsSet).sort()

  const stacks = months.map(month => ({ month, values: series.map(s => s.months.find(m => m.month === month)?.value ?? 0) }))

  const rawMax = Math.max(...stacks.flatMap(s => s.values), 1)

  const colors = series.map(s => getColorForLabel(s.name, theme))

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

  const leftMargin = 56
  const rightMargin = 20
  const topMargin = 20
  const bottomMargin = 50
  const chartHeight = height

  const n = months.length
  const availableWidth = containerWidth ?? Math.max(n * 48 + leftMargin + rightMargin, 600)
  const step = (availableWidth - leftMargin - rightMargin) / Math.max(1, n - 1)
  const svgWidth = availableWidth
  const svgHeight = chartHeight + topMargin + bottomMargin

  const ticks = 4

  const y = (val: number) => topMargin + chartHeight - (val / rawMax) * chartHeight

  return (
    <Box ref={containerRef} sx={{ width: '100%', overflowX: 'auto', py: 1 }}>
      <svg width="100%" viewBox={`0 0 ${svgWidth} ${svgHeight}`} height={svgHeight} preserveAspectRatio="xMinYMin meet">
        {/* gridlines */}
        {Array.from({ length: ticks + 1 }).map((_, ti) => {
          const val = (rawMax * ti) / ticks
          const yy = y(val)
          return (
            <g key={`g-${ti}`}>
              <line x1={leftMargin} x2={svgWidth - rightMargin} y1={yy} y2={yy} stroke={theme.palette.divider} strokeOpacity={0.6} />
              <text x={leftMargin - 8} y={yy + 4} fontSize={11} textAnchor="end" fill={theme.palette.text.secondary}>{Math.round(val)}</text>
            </g>
          )
        })}

        {/* lines */}
        {series.map((s, si) => {
          const points = s.months.map((m, i) => ({ x: leftMargin + i * step, y: y(m.value) }))
          const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
          return (
            <g key={s.name}>
              <path d={d} fill="none" stroke={getColorForLabel(s.name, theme)} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" opacity={0.95} />
              {points.map((p, pi) => (
                <circle key={`pt-${si}-${pi}`} cx={p.x} cy={p.y} r={2.4} fill={getColorForLabel(s.name, theme)} />
              ))}
            </g>
          )
        })}

        {/* x labels */}
        {months.map((m, i) => (
          <text key={m} x={leftMargin + i * step} y={topMargin + chartHeight + 22} fontSize={11} textAnchor="middle" fill={theme.palette.text.secondary}>{m}</text>
        ))}
      </svg>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center', pt: 1 }}>
        {series.map((s, i) => (
          <Box key={s.name} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, bgcolor: getColorForLabel(s.name, theme), borderRadius: 1 }} />
            <Typography variant="body2" color="text.primary">{s.name}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  )
}
