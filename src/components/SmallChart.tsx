import React from 'react'
import { SparkLineChart } from '@mui/x-charts'
import { Box, LinearProgress, Typography } from '@mui/material'

export default function SmallChart({ data }: { data?: Array<{ x: string | number; y: number }> }){
  // Ensure we have an array and extract numeric values; SparkLineChart expects `data` prop as number[]
  const values = Array.isArray(data) ? data.map(d => Number(d?.y ?? 0)) : []

  if (!values.length) {
    return (
      <Box sx={{ height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>
        <Typography variant="caption" color="text.secondary">No data</Typography>
      </Box>
    )
  }

  // If we only have a single numeric value (common for progress%), show a compact determinate progress bar
  if (values.length === 1) {
    const raw = Number(values[0] ?? 0)
    const value = Math.max(0, Math.min(100, isNaN(raw) ? 0 : raw))
    return (
      <Box sx={{ width: 120, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ flex: 1 }}>
          <LinearProgress variant="determinate" value={value} sx={{ height: 8, borderRadius: 2 }} />
        </Box>
        <Typography variant="caption" sx={{ minWidth: 36, textAlign: 'right' }}>{`${Math.round(value)}%`}</Typography>
      </Box>
    )
  }

  // For multi-point series render a sparkline with a compact height
  return (
    <Box sx={{ height: 40 }}>
      <SparkLineChart data={values} />
    </Box>
  )
}
