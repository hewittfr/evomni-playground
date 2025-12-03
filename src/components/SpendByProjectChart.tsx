import React, { useEffect, useRef, useState } from 'react'
import { Box, useTheme, Typography } from '@mui/material'
import { getColorForLabel } from './chartColors'

type Series = {
  name: string
  months: Array<{ month: string; value: number }>
}
export default function SpendByProjectChart({ series, height = 140 }: { series?: Series[], height?: number }){
  const theme = useTheme()
  // If no series provided, show placeholder
  if (!series || !series.length) {
    return (
      <Box sx={{ height: height + 80, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.palette.text.secondary }}>
        No data
      </Box>
    )
  }

  // Collect months (union across series) and sort
  const monthsSet = new Set<string>()
  series.forEach(s => s.months.forEach(m => monthsSet.add(m.month)))
  const months = Array.from(monthsSet).sort()

  // Compute stacked values per month
  const stacks: Array<{ month: string; totals: Array<{ name: string; value: number }> }> = months.map(month => ({
    month,
    totals: series.map(s => ({ name: s.name, value: s.months.find(m => m.month === month)?.value ?? 0 }))
  }))

  // Determine max total for scaling (round up to a nice value)
  const rawMax = Math.max(...stacks.map(s => s.totals.reduce((acc, t) => acc + t.value, 0)), 1)
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawMax)))
  const niceMax = Math.ceil(rawMax / magnitude) * magnitude

  const colors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.success.main,
    theme.palette.info.main
  ]
  
  // responsiveness: measure container width and compute bar widths to fill available space
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [containerWidth, setContainerWidth] = useState<number | null>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const resize = (entries: any) => {
      for (const entry of entries) setContainerWidth(entry.contentRect.width)
    }
    const ro = new ResizeObserver(resize)
    ro.observe(el)
    // set initial
    setContainerWidth(el.getBoundingClientRect().width)
    return () => ro.disconnect()
  }, [])

  const barWidthBase = 22
  // scale factor to make bars narrower (half width)
  const barWidthScale = 0.5
  const minGap = 6
  let gap = 10
  const leftMargin = 56
  const rightMargin = 20
  const topMargin = 20
  const bottomMargin = 60
  const chartHeight = height

  const n = stacks.length
  const availableWidth = containerWidth ?? Math.max(n * (barWidthBase + gap) + leftMargin + rightMargin, 700)
  // initial total gap based on tentative gap value
  let totalGap = Math.max(0, (n - 1) * gap)
  // available width for bars + gaps
  let availForBars = Math.max(0, availableWidth - leftMargin - rightMargin)

  // compute raw per-bar width (if no scaling) and then apply scale
  const rawPerBar = n > 0 ? Math.floor(availForBars / n) : barWidthBase
  let barWidth = Math.max(1, Math.floor(rawPerBar * barWidthScale))

  // now compute leftover space after placing narrow bars; distribute into gaps so the chart spans full width
  const totalBarsWidth = barWidth * n
  let leftover = Math.max(0, availForBars - totalBarsWidth)
  if (n > 1) {
    gap = Math.max(minGap, Math.floor(leftover / (n - 1)))
  } else {
    gap = Math.max(minGap, leftover)
  }
  totalGap = Math.max(0, (n - 1) * gap)
  // recompute availForBars for clarity (should equal totalBarsWidth + totalGap)
  availForBars = totalBarsWidth + totalGap
  // clamp
  const maxBar = 90
  const minBar = 8
  if (barWidth > maxBar) barWidth = maxBar
  if (barWidth < minBar) barWidth = minBar

  const chartWidth = n * barWidth + totalGap
  const svgWidth = chartWidth + leftMargin + rightMargin
  const svgHeight = chartHeight + topMargin + bottomMargin

  const ticks = 5
  const formatCurrency = (v: number) => new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v)

  return (
    <Box ref={containerRef} sx={{ width: '100%', overflowX: 'auto', py: 1 }}>
      <svg width="100%" viewBox={`0 0 ${svgWidth} ${svgHeight}`} height={svgHeight} preserveAspectRatio="xMinYMin meet">
        {/* Y gridlines and labels */}
        {Array.from({ length: ticks + 1 }).map((_, ti) => {
          const val = (niceMax * ti) / ticks
          const y = topMargin + chartHeight - (val / niceMax) * chartHeight
          return (
            <g key={`grid-${ti}`}>
              <line x1={leftMargin} x2={svgWidth - rightMargin} y1={y} y2={y} stroke={theme.palette.divider} strokeOpacity={0.6} />
              <text x={leftMargin - 8} y={y + 4} fontSize={11} textAnchor="end" fill={theme.palette.text.secondary}>{formatCurrency(val)}</text>
            </g>
          )
        })}

        {/* Bars */}
        {stacks.map((s, i) => {
          let yAcc = 0
          const x = leftMargin + i * (barWidth + gap)
          // determine topmost visible segment index (last with value > 0)
          const topIndex = (() => {
            for (let k = s.totals.length - 1; k >= 0; k--) if ((s.totals[k].value ?? 0) > 0) return k
            return -1
          })()

          return (
            <g key={s.month}>
              {s.totals.map((t, si) => {
                const h = (t.value / niceMax) * chartHeight
                const y = topMargin + chartHeight - yAcc - h

                // skip zero-height segments
                if (h <= 0) {
                  return null
                }

                // If this segment is the topmost visible one, draw a rect with rounded top corners only
                if (si === topIndex) {
                  // radius capped by half height/width
                  const r = Math.min(6, h / 2, barWidth / 2)
                  // build a path that rounds only the top-left and top-right corners
                  const x0 = x
                  const x1 = x + barWidth
                  const y0 = y
                  const y1 = y + h
                  // path: move to bottom-left, line to just below top-left arc, arc top-left, line to top-right arc start, arc top-right, line to bottom-right, close
                  const path = `M ${x0} ${y1} L ${x0} ${y0 + r} A ${r} ${r} 0 0 1 ${x0 + r} ${y0} L ${x1 - r} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y0 + r} L ${x1} ${y1} Z`
                  yAcc += h
                  return <path key={`${t.name}-${si}`} d={path} fill={colors[si % colors.length]} />
                }

                // otherwise draw a square rect (no rounding) so stacks align perfectly
                const rect = <rect key={`${t.name}-${si}`} x={x} y={y} width={barWidth} height={h} fill={getColorForLabel(t.name, theme)} />
                yAcc += h
                return rect
              })}

              <text x={x + barWidth / 2} y={topMargin + chartHeight + 26} fontSize={11} textAnchor="middle" fill={theme.palette.text.secondary}>{s.month}</text>
            </g>
          )
        })}

        {/* X and Y axis labels */}
        {/* center the Y label vertically along the chart area and rotate around that point */}
        {(() => {
          const yCenter = topMargin + chartHeight / 2
          return (
            <text
              x={leftMargin - 80}
              y={yCenter}
              fontSize={12}
              fill={theme.palette.text.secondary}
              textAnchor="middle"
              transform={`rotate(-90, ${leftMargin - 80}, ${yCenter})`}
            >
              Spend (USD)
            </text>
          )
        })()}
  {/* move X-axis title left to avoid overlapping tick labels */}
  <text x={(svgWidth + leftMargin - rightMargin) / 2 - 40} y={svgHeight - 36} fontSize={12} fill={theme.palette.text.secondary} textAnchor="middle">Month</text>

        {/* legend removed from SVG; rendered as HTML below for better wrapping and sizing */}
      </svg>
      {/* HTML/CSS legend below the SVG for natural wrapping and precise spacing */}
      <Box sx={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', pt: 1, pb: 1 }}>
        {series.map((ser, i) => (
          <Box key={ser.name} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, bgcolor: getColorForLabel(ser.name, theme), borderRadius: '2px' }} />
            <Typography variant="body2" color="text.primary">{ser.name}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  )
}
