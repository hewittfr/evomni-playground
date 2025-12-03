import React from 'react'
import { Box, Button, Popover, MenuItem, ListItemText, Divider, Typography, Stack, TextField } from '@mui/material'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { useAppDispatch } from '../store/hooks'
import { fetchDashboard } from '../store/dashboardSlice'

type Range = { start: string; end: string }

const PRESETS: { id: string; label: string; range: (now: Date) => Range }[] = [
  { id: '30d', label: 'Last 30 days', range: (now) => ({ start: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29).toISOString().slice(0,10), end: now.toISOString().slice(0,10) }) },
  { id: '90d', label: 'Last 90 days', range: (now) => ({ start: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 89).toISOString().slice(0,10), end: now.toISOString().slice(0,10) }) },
  { id: 'month', label: 'This month', range: (now) => ({ start: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0,10), end: now.toISOString().slice(0,10) }) },
  { id: 'ytd', label: 'Year to date', range: (now) => ({ start: new Date(now.getFullYear(), 0, 1).toISOString().slice(0,10), end: now.toISOString().slice(0,10) }) }
]

export default function DateRangeSelector({
  onChange
}: {
  onChange?: (range: { start: string; end: string }) => void
}){
  const dispatch = useAppDispatch()
  const [anchor, setAnchor] = React.useState<HTMLElement | null>(null)
  const [range, setRange] = React.useState<Range>(() => {
    const now = new Date()
    return PRESETS[0].range(now)
  })
  const [startDate, setStartDate] = React.useState<Date | null>(() => new Date(range.start))
  const [endDate, setEndDate] = React.useState<Date | null>(() => new Date(range.end))

  const open = Boolean(anchor)

  const label = React.useMemo(() => {
    if (!range) return 'Select range'
    if (!range.start || !range.end) return 'Custom'
    if (range.start === PRESETS[0].range(new Date()).start && range.end === PRESETS[0].range(new Date()).end) return PRESETS[0].label
    return `${range.start} → ${range.end}`
  }, [range])

  const applyRange = (r: Range) => {
    setRange(r)
    onChange?.(r)
    // dispatch dashboard fetch with start/end params
    dispatch(fetchDashboard({ start: r.start, end: r.end }))
    setAnchor(null)
  }

  return (
    <>
      <Button
        size="small"
        startIcon={<CalendarTodayIcon fontSize="small" />}
        onClick={(e) => setAnchor(e.currentTarget)}
        sx={{ textTransform: 'none' }}
      >
        <Typography variant="body2">{label}</Typography>
      </Button>

      <Popover
        open={open}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Stack sx={{ width: 320, p: 1 }} spacing={1}>
          <Typography variant="subtitle2" sx={{ px: 1 }}>Presets</Typography>
          {PRESETS.map(p => (
            <MenuItem key={p.id} onClick={() => applyRange(p.range(new Date()))}>
              <ListItemText primary={p.label} />
            </MenuItem>
          ))}
          <Divider />
          <Typography variant="subtitle2" sx={{ px: 1 }}>Custom range</Typography>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ display: 'flex', gap: 1, px: 1 }}>
              <DatePicker
                label="Start"
                value={startDate}
                onChange={(d) => setStartDate(d)}
                renderInput={(params) => <TextField size="small" {...params} />}
              />
              <DatePicker
                label="End"
                value={endDate}
                onChange={(d) => setEndDate(d)}
                renderInput={(params) => <TextField size="small" {...params} />}
              />
            </Box>
          </LocalizationProvider>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 1, pb: 1 }}>
            <Button size="small" onClick={() => {
              const def = PRESETS[0].range(new Date())
              setRange(def)
              setStartDate(new Date(def.start))
              setEndDate(new Date(def.end))
            }}>Reset</Button>
            <Button size="small" variant="contained" onClick={() => {
              const s = startDate ? new Date(startDate) : null
              const e = endDate ? new Date(endDate) : null
              const r = { start: s ? s.toISOString().slice(0,10) : '', end: e ? e.toISOString().slice(0,10) : '' }
              applyRange(r)
            }} sx={{ ml: 1 }}>Apply</Button>
          </Box>
        </Stack>
      </Popover>
    </>
  )
}
