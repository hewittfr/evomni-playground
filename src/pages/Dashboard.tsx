import React, { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchDashboard } from '../store/dashboardSlice'
import { Grid, Card, CardContent, Typography, Skeleton, Box, Divider, Chip, Avatar, useTheme, List, ListItem, ListItemAvatar, ListItemText, Tooltip } from '@mui/material'
import { Link } from 'react-router-dom'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import SettingsIcon from '@mui/icons-material/Settings'
import FactCheckIcon from '@mui/icons-material/FactCheck'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import AutorenewIcon from '@mui/icons-material/Autorenew'
import StorageIcon from '@mui/icons-material/Storage'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import SecurityIcon from '@mui/icons-material/Security'
import BuildIcon from '@mui/icons-material/Build'
import PersonIcon from '@mui/icons-material/Person'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import WorkOutlineIcon from '@mui/icons-material/WorkOutline'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import SmallChart from '../components/SmallChart'
import SpendByProjectChart from '../components/SpendByProjectChart'
import WorkHoursChart from '../components/WorkHoursChart'
import SectionHeader from '../components/SectionHeader'
import SimpleBarChart from '../components/SimpleBarChart'
import { getColorForLabel } from '../components/chartColors'

export default function Dashboard(){
  const dispatch = useAppDispatch()
  const { data, loading } = useAppSelector(s => s.dashboard as any)
  const theme = useTheme()
  const sectionGap = 3

  useEffect(() => {
    dispatch(fetchDashboard({}))
  }, [dispatch])

  // kpis from the mock API may be an object (e.g. { EV: 1234, PV: 1200 }) or an array.
  // Normalize to an array of { id, label, value } so the UI can safely map over it.
  const kpiArray: Array<any> = React.useMemo(() => {
    const k = data?.kpis
    if (!k) return []
    if (Array.isArray(k)) return k
    if (typeof k === 'object') {
      return Object.entries(k).map(([key, val], idx) => ({ id: `kpi-${key}-${idx}`, label: key, value: val }))
    }
    return []
  }, [data])

  // Find the EM project (case-insensitive match). Projects may include budget fields under several names;
  // try common variants and compute remaining when possible.
  const emProject = React.useMemo(() => {
    const projects = data?.projects || []
    if (!projects || projects.length === 0) return null
    const found = projects.find((p: any) => {
      const name = (p?.name || '').toString().toLowerCase()
      return name === 'em' || name.includes(' em') || name.includes('em ' ) || name.includes('em-') || name.includes('em')
    })
    return found || null
  }, [data])

  const formatCurrency = (v: number | null | undefined) => {
    if (v == null || Number.isNaN(v)) return 'N/A'
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v)
    } catch (e) {
      return `$${Math.round(v).toLocaleString()}`
    }
  }

  const totalBudget = React.useMemo(() => {
    if (!emProject) return null
    return emProject?.budgetTotal ?? emProject?.totalBudget ?? emProject?.budget ?? emProject?.allocation ?? null
  }, [emProject])

  const spentBudget = React.useMemo(() => {
    if (!emProject) return null
    return emProject?.budgetSpent ?? emProject?.spent ?? emProject?.actual ?? emProject?.cost ?? null
  }, [emProject])

  const remainingBudget = React.useMemo(() => {
    if (totalBudget == null || spentBudget == null) return null
    return totalBudget - spentBudget
  }, [totalBudget, spentBudget])

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'name', headerName: 'Project', width: 240 },
    { field: 'status', headerName: 'Status', width: 160 },
    { field: 'progress', headerName: 'Progress', width: 120 }
  ]

  // Shared sample projects used for the Project Overview and as fallback chart data
  const overviewSamples: any = {
    'CAP-1': { id: 'cap-1', name: 'CAP-1', budgetTotal: 250000, budgetSpent: 60000, startDate: '2024-02-01', dueDate: '2024-10-01', status: 'On-Track', progress: 40 },
    'CAP-2': { id: 'cap-2', name: 'CAP-2', budgetTotal: 180000, budgetSpent: 120000, startDate: '2023-07-15', dueDate: '2024-09-30', status: 'Behind', progress: 65 },
    'CAP-3': { id: 'cap-3', name: 'CAP-3', budgetTotal: 300000, budgetSpent: 150000, startDate: '2024-05-01', dueDate: '2026-01-31', status: 'On-Track', progress: 50 },
    'EM': { id: emProject?.id ?? 'em', name: emProject?.name ?? 'EM', budgetTotal: emProject?.budgetTotal ?? 1500000, budgetSpent: emProject?.budgetSpent ?? 600000, startDate: emProject?.startDate ?? '2024-01-15', dueDate: emProject?.dueDate ?? '2025-12-31', status: emProject?.status ?? 'On-Track', progress: emProject?.progress ?? 55 },
    'X-326': { id: 'x326', name: 'X-326', budgetTotal: 1200000, budgetSpent: 300000, startDate: '2024-01-15', dueDate: '2025-12-31', status: 'Ahead', progress: 25 },
    'X-333': { id: 'x333', name: 'X-333', budgetTotal: 900000, budgetSpent: 450000, startDate: '2023-11-01', dueDate: '2025-03-30', status: 'Behind', progress: 60 }
  }
  const overviewArr = Object.values(overviewSamples).sort((a: any, b: any) => a.name.localeCompare(b.name))
  // Accent colors for project cards are derived deterministically per project name

  // deterministic pseudo-random generator for reproducible monthly variations per project
  const seededRandom = (seed: string) => {
    let h = 2166136261 >>> 0
    for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619)
    return () => {
      h += 0x6D2B79F5
      let t = Math.imul(h ^ (h >>> 15), 1 | h)
      t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
  }

  const lastNMonths = (n: number) => {
    const out: string[] = []
    const now = new Date()
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      out.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`)
    }
    return out
  }

  return (
    <div>
      <style>{`@keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }`}</style>
  {/* App Export Status - horizontal apps-based layout */}
  <Box sx={{ mt: sectionGap, mb: sectionGap, border: '1px solid #e0e0e0', borderRadius: 1 }}>
    <Box sx={{ p: 3 }}>
      <SectionHeader title="App Export Status" description="Recent export activity per app." />
      <Grid container spacing={2} sx={{ mt: 1 }}>
        {(() => {
          const appsList = ['EVMS','EVFC','EVCSA','EVBF','EVUTIL','AVA']
          return appsList.map((app, i) => {
            const rng = seededRandom(String(app) + '-export')
            const exporting = rng() > 0.72
            const r2 = rng()
            // status: in-progress if exporting, otherwise failed with small prob, else success
            const status = exporting ? 'in-progress' : (r2 > 0.86 ? 'failed' : 'success')
            // compute deterministic start and finish times
            const startOffsetMinutes = Math.round(rng() * 180) // up to 3 hours ago
            const durationMinutes = exporting ? Math.round(2 + rng() * 25) : Math.round(5 + rng() * 120)
            const start = new Date(Date.now() - startOffsetMinutes * 60 * 1000)
            const finish = new Date(start.getTime() + durationMinutes * 60 * 1000)
            // full date + time, e.g. 2025-10-22 14:05
            const fmtDateTime = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
            const users = ['s.jones','k.smith','a.lee','m.garcia','t.nguyen']
            const rawUser = users[Math.floor(rng() * users.length)]
            const user = rawUser.split('.').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ')
            const color = getColorForLabel(app, theme)

            const StatusIcon = status === 'success' ? CheckCircleIcon : status === 'failed' ? ErrorOutlineIcon : AutorenewIcon
            // reuse same nav app icons: FactCheck when idle, Settings when exporting (animated)
            const AppIcon = exporting ? SettingsIcon : FactCheckIcon

            return (
              <Grid item key={`app-export-${app}`} xs={12} sm={6} md={2}>
                <Card variant="outlined" elevation={0} sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 1.25, minHeight: 110, boxShadow: 'none' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar variant="square" sx={{ bgcolor: theme.palette.grey[300], color: theme.palette.grey[700], width: 44, height: 44, borderRadius: 1.25 }}>
                      <AppIcon sx={exporting ? { color: theme.palette.warning.main, animation: 'spin 1.2s linear infinite', fontSize: 22 } : { fontSize: 22, color: theme.palette.text.secondary }} />
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{app}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                      <Chip
                        icon={<StatusIcon fontSize="small" sx={status === 'in-progress' ? { animation: 'spin 1.2s linear infinite', color: 'inherit' } : { color: 'inherit' }} />}
                        label={status === 'in-progress' ? 'In Progress' : status === 'failed' ? 'Failed' : 'Success'}
                        size="small"
                        color={status === 'success' ? 'success' : status === 'failed' ? 'error' : 'warning'}
                        sx={{ mt: 0.5 }}
                        aria-label={`Export status: ${status}`}
                      />
                    </Box>
                  </Box>

                  {/* Bottom row: start and finish times and user */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1, pt: 0.5, borderTop: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="caption" color="text.secondary">{`User: ${user}`}</Typography>
                    <Typography variant="caption" color="text.secondary">{`Start: ${fmtDateTime(start)}`}</Typography>
                    <Typography variant="caption" color="text.secondary">{`Finish: ${exporting ? 'in-progress' : fmtDateTime(finish)}`}</Typography>
                  </Box>
                </Card>
              </Grid>
            )
          })
        })()}
      </Grid>
    </Box>
  </Box>
  {/* Project Overview section (multiple project cards) */}
  <Box sx={{ mt: sectionGap, mb: sectionGap, border: '1px solid #e0e0e0', borderRadius: 1 }}>
    <Box sx={{ p: 3 }}>
          <SectionHeader title="Project Overview" description="Quick status and budget summary for active projects." />
          {/* divider removed to match Budget section styling */}
          <Grid container spacing={2} sx={{ mt: 0 }}>
              {(() => {
                const arr = overviewArr

              if (loading) {
                return arr.map((_, i) => (
                  <Grid item key={`overview-skel-${i}`} xs={12} sm={6} md={2} sx={{ display: 'flex' }}>
                    <Card variant="outlined" elevation={0} sx={{ display: 'flex', flexDirection: 'column', flex: 1, borderColor: theme.palette.grey[200], backgroundColor: i % 2 ? theme.palette.action.hover : 'transparent' }}>
                      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 2, flex: 1 }}>
                        <Skeleton width={120} height={20} />
                        <Skeleton width={100} height={28} sx={{ mt: 1 }} />
                        <Skeleton width={160} height={16} sx={{ mt: 1 }} />
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              }

                return arr.map((p: any, idx: number) => {
                const accent = getColorForLabel(String(p.name ?? p.id ?? `project-${idx}`), theme)
                return (
                  <Grid item key={p.id} xs={12} sm={6} md={2} sx={{ display: 'flex' }}>
                    <Card
                      variant="outlined"
                      elevation={0}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        flex: 1,
                        borderColor: theme.palette.grey[200],
                        borderLeft: `4px solid ${accent}`,
                        backgroundColor: idx % 2 ? theme.palette.action.hover : 'transparent'
                      }}
                    >
                        <CardContent sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1, flex: 1 }}>
                          {/* Layout sections get consistent min-heights so adjacent cards align */}
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: '1 1 auto' }}>
                            {/* header */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', minHeight: 56 }}>
                              <Box sx={{ width: 44, height: 44, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: theme.palette.mode === 'light' ? theme.palette.grey[50] : theme.palette.grey[900], border: `1px solid ${theme.palette.grey[200]}` }}>
                                <Avatar variant="circular" sx={{ width: 36, height: 36, bgcolor: 'transparent', color: theme.palette.primary.main, boxShadow: 'none' }}>
                                  <WorkOutlineIcon sx={{ fontSize: 20 }} />
                                </Avatar>
                              </Box>

                              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography component={Link} to={`/projects/${p.id}`} variant="subtitle1" sx={{ fontWeight: 700, fontSize: '1rem', textDecoration: 'none', color: 'text.primary' }}>
                                  {p.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">{p.status ? p.status : 'No status'}</Typography>
                              </Box>

                              {/* total budget taken down to its own row for clarity */}
                            </Box>


                            {/* Budget and Remaining side-by-side */}
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'space-between', mt: 1, minHeight: 56 }}>
                              <Box sx={{ minWidth: 0 }}>
                                <Typography variant="caption" color="text.secondary">Budget</Typography>
                                <Typography variant="h6" sx={{ fontWeight: 800 }}>{formatCurrency(p.budgetTotal)}</Typography>
                              </Box>

                              <Box sx={{ textAlign: 'right', minWidth: 0 }}>
                                <Typography variant="caption" color="text.secondary">Remaining</Typography>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>{formatCurrency((p.budgetTotal ?? 0) - (p.budgetSpent ?? 0))}</Typography>
                              </Box>
                            </Box>

                            <Divider sx={{ borderColor: theme.palette.grey[200], my: 0.5 }} />

                            {/* Start and Finish side-by-side (like Budget/Remaining) */}
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'space-between', mt: 1, minHeight: 56 }}>
                              <Box sx={{ minWidth: 0 }}>
                                <Typography variant="caption" color="text.secondary">Start</Typography>
                                <Typography variant="body2" color="text.secondary">{p.startDate}</Typography>
                              </Box>

                              <Box sx={{ textAlign: 'right', minWidth: 0 }}>
                                <Typography variant="caption" color="text.secondary">Finish</Typography>
                                <Typography variant="body2" color="text.secondary">{p.dueDate}</Typography>
                              </Box>
                            </Box>

                            <Divider sx={{ borderColor: theme.palette.grey[200], my: 0 }} />

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, py: 0, mt: 0, minHeight: 48 }}>
                              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1, m: 0 }}>Status</Typography>
                              {(() => {
                                const status = (p.status || '').toString().toLowerCase()
                                let label = 'Unknown'
                                let chipSx: any = { fontSize: '0.72rem', height: 22, borderRadius: 1, py: 0 }
                                if (status.includes('on')) { label = 'On-Track'; chipSx = { ...chipSx, bgcolor: theme.palette.warning.light, color: theme.palette.getContrastText(theme.palette.warning.light) } }
                                else if (status.includes('behind') || status.includes('late')) { label = 'Behind Schedule'; chipSx = { ...chipSx, bgcolor: theme.palette.error.light, color: theme.palette.getContrastText(theme.palette.error.light) } }
                                else if (status.includes('ahead') || status.includes('early')) { label = 'Ahead of Schedule'; chipSx = { ...chipSx, bgcolor: theme.palette.success.light, color: theme.palette.getContrastText(theme.palette.success.light) } }
                                return <Chip label={label} size="small" sx={chipSx} />
                              })()}

                              <Box sx={{ ml: 'auto' }}>
                                <SmallChart data={[{ x: 'progress', y: Number(p.progress ?? 0) }]} />
                              </Box>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                </Grid>
              )
            })
          })()}
        </Grid>
      </Box>
    </Box>

      {/* Budget Spend by Project and Invoice Volume side-by-side */}
  <Box sx={{ mt: sectionGap }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            {loading ? (
              <Card variant="outlined" elevation={0} sx={{ boxShadow: 'none' }}>
                <CardContent>
                  <SectionHeader title="Budget Spend by Project" description="Monthly stacked spend across projects (last 12 months)." />
                  <Skeleton variant="rectangular" height={240} />
                </CardContent>
              </Card>
            ) : (
              <Card variant="outlined" elevation={0} sx={{ boxShadow: 'none' }}>
                <CardContent>
                  <SectionHeader title="Budget Spend by Project" description="Monthly stacked spend across projects (last 12 months)." />
                  {(() => {
                    const projects = (data?.projects && data.projects.length) ? data.projects : overviewArr
                    const monthsWindow = lastNMonths(12)

                    const series = projects.map((p: any, idx: number) => {
                      if (Array.isArray(p.monthlySpend) && p.monthlySpend.length) {
                        return { name: p.name || `Project ${idx+1}`, months: p.monthlySpend }
                      }

                      const base = Number(p.budgetSpent ?? p.spent ?? 0) || Math.round((p.budgetTotal ?? 0) * 0.4)
                      const rng = seededRandom(String(p.id || p.name || idx))
                      const vals: number[] = []
                      let sum = 0
                      for (let i = 0; i < monthsWindow.length; i++) {
                        const factor = 0.6 + rng() * 0.8
                        const v = Math.round((base / 12) * factor)
                        vals.push(v)
                        sum += v
                      }
                      const scale = sum > 0 ? base / sum : 1
                      const months = monthsWindow.map((m, i) => ({ month: m, value: Math.round(vals[i] * scale) }))
                      return { name: p.name || `Project ${idx+1}`, months }
                    })

                    return <SpendByProjectChart series={series} height={120} />
                  })()}
                </CardContent>
              </Card>
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            {loading ? (
              <Card variant="outlined" elevation={0} sx={{ boxShadow: 'none' }}>
                <CardContent>
                  <SectionHeader title="Invoice Volume By Month" description="Monthly invoice volume stacked by project (last 12 months)." />
                  <Skeleton variant="rectangular" height={240} />
                </CardContent>
              </Card>
            ) : (
              <Card variant="outlined" elevation={0} sx={{ boxShadow: 'none' }}>
                <CardContent>
                  <SectionHeader title="Invoice Volume By Month" description="Monthly invoice volume stacked by project (last 12 months)." />
                  {(() => {
                    const projects = (data?.projects && data.projects.length) ? data.projects : overviewArr
                    const monthsWindow = lastNMonths(12)

                    // Generate invoice counts per project per month based on budgetSpent (scaled down) with deterministic variation
                    const invoiceSeries = projects.map((p: any, idx: number) => {
                      const baseCount = Math.max(5, Math.round((Number(p.budgetSpent ?? p.spent ?? 0) || Math.round((p.budgetTotal ?? 0) * 0.05)) / 20000))
                      const rng = seededRandom(String((p.id || p.name || idx) + '-inv'))
                      const months = monthsWindow.map((m, i) => ({ month: m, value: Math.max(0, Math.round(baseCount * (0.5 + rng() * 1.5))) }))
                      return { name: p.name || `Project ${idx+1}`, months }
                    })

                    return <SpendByProjectChart series={invoiceSeries} height={120} />
                  })()}
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      </Box>

      {/* Work Hours by Project - separate row */}
  <Box sx={{ mt: sectionGap }}>
        <Card variant="outlined" elevation={0} sx={{ boxShadow: 'none' }}>
          <CardContent>
            <SectionHeader title="Work Hours by Project" description="Monthly logged work hours per project (last 12 months)." />
            {(() => {
              const projects = (data?.projects && data.projects.length) ? data.projects : overviewArr
              const monthsWindow = lastNMonths(12)

              const hoursSeries = projects.map((p: any, idx: number) => {
                // base hours proportional to progress/budget; deterministic variation
                const baseHours = Math.max(30, Math.round((Number(p.budgetSpent ?? p.spent ?? 0) || Math.round((p.budgetTotal ?? 0) * 0.02)) / 10000))
                const rng = seededRandom(String((p.id || p.name || idx) + '-hrs'))
                const months = monthsWindow.map((m, i) => ({ month: m, value: Math.max(0, Math.round(baseHours * (0.6 + rng() * 1.2))) }))
                return { name: p.name || `Project ${idx+1}`, months }
              })

              return <WorkHoursChart series={hoursSeries} height={120} />
            })()}
          </CardContent>
        </Card>
      </Box>

      {/* Error volume row with 3 charts */}
  <Box sx={{ mt: sectionGap }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Card variant="outlined" elevation={0} sx={{ boxShadow: 'none' }}>
              <CardContent>
                <SectionHeader title="Top 5 Schedulers by Error Volume" description="Schedulers ranked by error count (sample data)." />
                {(() => {
                  // Schedulers: steeply decreasing error counts (top scheduler much higher)
                  const schedNames = ['Ethan Miller','Olivia Parker','Noah Sullivan','Ava Ramirez','Liam Bennett']
                  const schedulers = schedNames.map((name, i) => ({ label: name, value: Math.round(1200 / Math.pow(1.8, i)) }))
                  // shared color for error groups
                  const errorGroupColor = getColorForLabel('errors', theme)
                  return <SimpleBarChart items={schedulers} height={160} color={errorGroupColor} />
                })()}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card variant="outlined" elevation={0} sx={{ boxShadow: 'none' }}>
              <CardContent>
                <SectionHeader title="Top 5 Managers by Error Volume" description="Managers ranked by error count (sample data)." />
                {(() => {
                  // Managers: more uniform counts with small jitter
                  const mgrNames = ['Ava Collins','Liam Foster','Noah Reyes','Sophia Martin','Olivia Chen']
                  const rng = seededRandom('mgr-errors')
                  const mgrs = mgrNames.map((name, i) => ({ label: name, value: Math.round(420 + Math.round(rng() * 160) - i * 6) }))
                  const errorGroupColor = getColorForLabel('errors', theme)
                  return <SimpleBarChart items={mgrs} height={160} color={errorGroupColor} />
                })()}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card variant="outlined" elevation={0} sx={{ boxShadow: 'none' }}>
              <CardContent>
                <SectionHeader title="Apps by Error Volume" description="Applications ranked by error count (sample data)." />
                {(() => {
                  // Apps: cluster of medium values with one large outlier
                  const appsList = ['CAP-1','CAP-2','CAP-3','EM','X-326','X-333']
                  const apps = appsList.map((a, i) => {
                    if (a === 'EM') return { label: a, value: 1400 } // outlier
                    return { label: a, value: 220 + i * 40 + (i % 2 === 0 ? 40 : -20) }
                  })
                  return <SimpleBarChart items={apps} height={160} />
                })()}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
  </div>
  )
}

