import React from 'react'
import { Box, Drawer, Toolbar, List, ListItemButton, ListItemIcon, ListItemText, AppBar, Toolbar as MuToolbar, Typography, Divider, Collapse, IconButton, Badge } from '@mui/material'
import Subheader from './Subheader'
import { DRAWER_WIDTH } from '../constants/layout'
import MenuIcon from '@mui/icons-material/Menu'
import DashboardIcon from '@mui/icons-material/Dashboard'
import SettingsIcon from '@mui/icons-material/Settings'
import FactCheckIcon from '@mui/icons-material/FactCheck'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import NotificationsIcon from '@mui/icons-material/Notifications'
import InfoIcon from '@mui/icons-material/Info'
import FeedbackIcon from '@mui/icons-material/Feedback'
import EmailIcon from '@mui/icons-material/Email'
import { useLocation, Link as RouterLink } from 'react-router-dom'
import DateRangeSelector from './DateRangeSelector'

// use shared DRAWER_WIDTH constant

export default function Layout({ children }: { children: React.ReactNode }) {
  const [adminOpen, setAdminOpen] = React.useState(false)
  const location = useLocation()
  const appBarRef = React.useRef<HTMLElement | null>(null)
  const subheaderRef = React.useRef<HTMLDivElement | null>(null)
  const [drawerOffset, setDrawerOffset] = React.useState<number | null>(null)
  const [appBarHeight, setAppBarHeight] = React.useState<number | null>(null)
  const [subheaderHeight, setSubheaderHeight] = React.useState<number | null>(null)

  // deterministic pseudo-random generator (same behavior as Dashboard) to mark exporting state
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

  React.useEffect(() => {
    const measure = () => {
      try {
        const appH = Math.round(appBarRef.current?.getBoundingClientRect().height ?? 0)
        // fallback to appBar height for subheader when not mounted so offset is consistent
        const subH = Math.round((subheaderRef.current?.getBoundingClientRect().height ?? appH) || 40)
        const total = Math.round(appH + subH)
        setAppBarHeight(appH || null)
        setSubheaderHeight(subH || null)
        setDrawerOffset(total || 0)
      } catch (e) {
        // ignore
      }
    }
    // measure after paint and on resize
    measure()
    const id = window.setTimeout(measure, 50)
    window.addEventListener('resize', measure)
    return () => {
      window.clearTimeout(id)
      window.removeEventListener('resize', measure)
    }
  }, [])

  const offsetPx = `${drawerOffset ?? 64}px`

  const appList = [
    { key: 'evms', label: 'EVMS', desc: 'Earned Value Management System' },
    { key: 'evfc', label: 'EVFC', desc: 'Earned Value Final Closeout' },
    { key: 'evcsa', label: 'EVCSA', desc: 'Earned Value Cost Schedule Analysis' },
    { key: 'evbf', label: 'EVBF', desc: 'Earned Value Data Backfeed' },
    { key: 'evutil', label: 'EVUTIL', desc: 'Utilities' },
    { key: 'ava', label: 'AVA', desc: 'PM30 Audit Review' }
  ]

  return (
    <Box sx={{ display: 'flex', height: '100vh', '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } } }}>
      <AppBar position="fixed" color="primary" elevation={0} ref={(el) => (appBarRef.current = el as HTMLElement)}>
        <MuToolbar variant="dense" sx={{ minHeight: 64 }}>
          <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 1 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>EV-OMNI</Typography>
          <IconButton color="inherit"><Badge badgeContent={3} color="error"><NotificationsIcon /></Badge></IconButton>
          <IconButton color="inherit"><AccountCircleIcon /></IconButton>
        </MuToolbar>
      </AppBar>

      {/* Subheader exposes its DOM node via ref so Layout can measure it for Drawer offset */}
      {/* Force subheader height to 57px (matches design) by passing explicit height while using
      the measured appBarHeight for the topOffset so the subheader is positioned below the AppBar. */}
      <Subheader ref={subheaderRef} topOffset={appBarHeight ?? undefined} height={52}>{(() => {
        // Map pathname to a short title to show in the subheader
        const p = location.pathname || '/'
        if (p === '/' || p === '') return 'Dashboard'
        if (p.startsWith('/evms')) return 'EVMS'
        if (p.startsWith('/evfc')) return 'EVFC'
        if (p.startsWith('/evcsa')) return 'EVCSA'
        if (p.startsWith('/evbf')) return 'EVBF'
        if (p.startsWith('/evutil')) return 'EVUTIL'
        if (p.startsWith('/ava')) return 'AVA'
        if (p.startsWith('/about')) return 'About'
        if (p.startsWith('/feedback')) return 'Feedback'
        if (p.startsWith('/admin')) return 'Admin'
        return 'Dashboard'
      })()}</Subheader>

      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: DRAWER_WIDTH,
            top: offsetPx,
            pt: 0,
            left: 0,
            height: `calc(100% - ${offsetPx})`,
            boxSizing: 'border-box',
            borderRight: '1px solid rgba(0,0,0,0.06)'
          }
        }}
      >
        {/* remove any toolbar spacer so nav items align to the very top of the drawer */}

        {/* Top nav group */}
        <List sx={{ pl: 1, pr: 0, mt: 0 }}>
          <ListItemButton component={RouterLink} to="/" selected={location.pathname === '/'}>
            <ListItemIcon sx={{ minWidth: 36 }}><DashboardIcon sx={{ fontSize: 22 }} /></ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </List>

        <Divider />

        {/* App links */}
        <Box>
          <List sx={{ pl: 1, pr: 0, mt: 0 }}>
            {appList.map(a => {
              const rng = seededRandom(`${a.label}-export`)
              const exporting = rng() > 0.72
              return (
                <React.Fragment key={a.key}>
                  <ListItemButton component={RouterLink} to={`/${a.key}`} selected={location.pathname.startsWith(`/${a.key}`)}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {exporting
                        ? <SettingsIcon sx={{ color: (t: any) => t.palette.warning.main, animation: 'spin 1.2s linear infinite', fontSize: 30 }} />
                        : <FactCheckIcon sx={{ fontSize: 30, color: (t: any) => t.palette.primary.main }} />}
                    </ListItemIcon>
                    <ListItemText primary={a.label} secondary={a.desc} secondaryTypographyProps={{ variant: 'caption', fontSize: '0.72rem' }} />
                  </ListItemButton>
                  <Divider />
                </React.Fragment>
              )
            })}
          </List>
        </Box>

        {/* bottom area: admin, about, feedback */}
        <Box sx={{ mt: 'auto', mb: 1 }}>
          <Divider sx={{ my: 1 }} />
          <List sx={{ pl: 1, pr: 0, mt: 0 }}>
            <ListItemButton onClick={() => setAdminOpen(s => !s)}>
              <ListItemIcon sx={{ minWidth: 36 }}><SettingsIcon sx={{ fontSize: 22 }} /></ListItemIcon>
              <ListItemText primary="Admin" />
              {adminOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>

            <Collapse in={adminOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton sx={{ pl: 4 }} component={RouterLink} to="/admin/users"><ListItemText primary="User Admin" /></ListItemButton>
                <ListItemButton sx={{ pl: 4 }} component={RouterLink} to="/admin/roles"><ListItemText primary="Role Admin" /></ListItemButton>
                <ListItemButton sx={{ pl: 4 }} component={RouterLink} to="/admin/permissions"><ListItemText primary="Permission Admin" /></ListItemButton>
                <ListItemButton sx={{ pl: 4 }} component={RouterLink} to="/admin/apps"><ListItemText primary="App Admin" /></ListItemButton>
                <ListItemButton sx={{ pl: 4 }} component={RouterLink} to="/admin/email-distribution-groups"><ListItemText primary="Email Distribution Groups" /></ListItemButton>
              </List>
            </Collapse>

            <ListItemButton component={RouterLink} to="/about" selected={location.pathname.startsWith('/about')}>
              <ListItemIcon sx={{ minWidth: 36 }}><InfoIcon sx={{ fontSize: 20 }} /></ListItemIcon>
              <ListItemText primary="About" />
            </ListItemButton>
            <ListItemButton component={RouterLink} to="/feedback" selected={location.pathname.startsWith('/feedback')}>
              <ListItemIcon sx={{ minWidth: 36 }}><FeedbackIcon sx={{ fontSize: 20 }} /></ListItemIcon>
              <ListItemText primary="Feedback" />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          position: 'absolute',
          top: offsetPx,
          left: `${DRAWER_WIDTH}px`,
          right: 0,
          bottom: 0,
          overflow: 'auto',
          px: 4,
          py: 3,
          backgroundColor: (t: any) => t.palette.background.default
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ flex: 1 }} />
          {location.pathname === '/' && (
            <Box sx={{ ml: 2 }}>
              <DateRangeSelector />
            </Box>
          )}
        </Box>
        {children}
      </Box>
    </Box>
  )
}
