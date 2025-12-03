import React from 'react'
import {
  Box,
  Typography,
  TextField,
  List,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Divider,
  Button,
  Stack,
  Switch,
  FormControlLabel,
  Paper
} from '@mui/material'
import { green, red } from '@mui/material/colors'

type User = {
  id: string
  firstName: string
  lastName: string
  email: string
  active: boolean
  lastLogin?: string
  phone?: string
  ext?: string
  title?: string
  manager?: string
}

const sampleUsers: User[] = [
  { id: '1', firstName: 'Mia', lastName: 'Garcia', email: 'mia.garcia@example.com', active: true, lastLogin: '2025-10-20T10:15:00Z', phone: '555-201-1001', ext: '231', title: 'Analyst', manager: 'K. Smith' },
  { id: '2', firstName: 'Ava', lastName: 'Lee', email: 'ava.lee@example.com', active: true, lastLogin: '2025-10-21T14:02:00Z', phone: '555-201-1002', ext: '232', title: 'Project Manager', manager: 'L. Nguyen' },
  { id: '3', firstName: 'Kai', lastName: 'Smith', email: 'kai.smith@example.com', active: false, lastLogin: '2025-10-15T08:45:00Z', phone: '555-201-1003', ext: '233', title: 'Developer', manager: 'M. Garcia' },
  { id: '4', firstName: 'Liam', lastName: 'Nguyen', email: 'liam.nguyen@example.com', active: true, lastLogin: '2025-10-22T09:30:00Z', phone: '555-201-1004', ext: '234', title: 'Director', manager: 'A. Lee' },
  { id: '5', firstName: 'Noa', lastName: 'Patel', email: 'noa.patel@example.com', active: false, lastLogin: '2025-09-28T17:10:00Z', phone: '555-201-1005', ext: '235', title: 'QA', manager: 'E. Chen' }
]

function initialsOf(u: User){
  const a = u.firstName?.[0] ?? ''
  const b = u.lastName?.[0] ?? ''
  return (a + b).toUpperCase()
}

function formatDate(s?: string){
  if (!s) return '—'
  try{ return new Date(s).toLocaleString() } catch { return s }
}

export default function Users(){
  const [users, setUsers] = React.useState<User[]>(sampleUsers)
  const [search, setSearch] = React.useState('')
  const [selectedId, setSelectedId] = React.useState<string | null>(users[0]?.id ?? null)

  const selected = users.find(u => u.id === selectedId) || null
  const [form, setForm] = React.useState<User | null>(selected ? { ...selected } : null)

  // Update form when selection changes
  React.useEffect(()=>{
    if (selected) setForm({ ...selected })
    else setForm(null)
  }, [selectedId])

  const onChangeField = (key: keyof User, value: any)=>{
    setForm(f => f ? { ...f, [key]: value } as User : f)
  }

  const isDirty = React.useMemo(()=>{
    if (!form || !selected) return false
    // shallow compare relevant fields
    return (
      form.firstName !== selected.firstName ||
      form.lastName !== selected.lastName ||
      form.email !== selected.email ||
      form.active !== selected.active ||
      form.phone !== selected.phone ||
      form.ext !== selected.ext ||
      form.title !== selected.title ||
      form.manager !== selected.manager
    )
  }, [form, selected])

  const filtered = React.useMemo(()=>{
    const q = search.trim().toLowerCase()
    if (!q) return users
    return users.filter(u =>
      u.firstName.toLowerCase().includes(q) ||
      u.lastName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    )
  }, [search, users])

  const handleSave = ()=>{
    if (!form) return
    setUsers(list => list.map(u => u.id === form.id ? { ...u, ...form } : u))
  }

  const handleAdd = ()=>{
    const id = (Math.max(0, ...users.map(u => Number(u.id) || 0)) + 1).toString()
    const newUser: User = { id, firstName: '', lastName: '', email: '', active: true, lastLogin: undefined, phone: '', ext: '', title: '', manager: '' }
    setUsers(list => [newUser, ...list])
    setSelectedId(id)
    setForm({ ...newUser })
  }

  const handleDelete = ()=>{
    if (!selected) return
    setUsers(list => list.filter(u => u.id !== selected.id))
    setSelectedId(prev => {
      const idx = users.findIndex(u => u.id === selected.id)
      const next = users[idx + 1] || users[idx - 1] || null
      return next ? next.id : null
    })
  }

  // smaller field typography for compact form
  const fieldSx = {
    '& .MuiInputBase-input': { fontSize: '0.85rem', py: 0.75 },
    '& .MuiInputLabel-root': { fontSize: '0.85rem' }
  } as const

  return (
    <Box sx={{ display: 'flex', height: '100%', gap: 2, p: 2 }}>
      {/* Master list */}
      <Paper elevation={0} variant="outlined" sx={{ width: 360, minWidth: 300, maxWidth: 420, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ p: 1.5 }}>
          <TextField
            fullWidth
            size="small"
            label="Search users"
            placeholder="Type to filter by name or email"
            value={search}
            onChange={(e)=> setSearch(e.target.value)}
          />
        </Box>
        <Divider />
        <List dense sx={{ overflowY: 'auto' }}>
          {filtered.map(u => {
            const selected = u.id === selectedId
            return (
              <ListItemButton key={u.id} selected={selected} onClick={()=> setSelectedId(u.id)} sx={{ py: 1 }}>
                <ListItemAvatar>
                  <Avatar variant="square" sx={{ bgcolor: u.active ? green[500] : red[500], width: 36, height: 36, borderRadius: 1.25, fontSize: 14 }}>
                    {initialsOf(u)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={`${u.lastName}, ${u.firstName}`}
                  secondary={`Last login: ${formatDate(u.lastLogin)}`}
                />
              </ListItemButton>
            )
          })}
          {filtered.length === 0 && (
            <Box sx={{ p: 2, color: 'text.secondary' }}>No users</Box>
          )}
        </List>
      </Paper>

      {/* Detail panel */}
      <Paper elevation={0} variant="outlined" sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">User Details</Typography>
          <Stack direction="row" spacing={1}>
            <Button size="small" variant="outlined" color="primary" onClick={handleAdd}>Add</Button>
            <Button size="small" variant="outlined" color="error" disabled={!selected} onClick={handleDelete}>Delete</Button>
            <Button size="small" variant="contained" color="primary" disabled={!isDirty} onClick={handleSave}>Save</Button>
          </Stack>
        </Box>

        {form ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(240px, 1fr))', gap: 2, alignItems: 'center', width: '100%' }}>
            <TextField size="small" fullWidth label="First name" value={form.firstName} onChange={e=> onChangeField('firstName', e.target.value)} sx={fieldSx} />
            <TextField size="small" fullWidth label="Last name" value={form.lastName} onChange={e=> onChangeField('lastName', e.target.value)} sx={fieldSx} />
            <TextField size="small" fullWidth label="Email" type="email" value={form.email} onChange={e=> onChangeField('email', e.target.value)} sx={{ ...fieldSx, gridColumn: '1 / span 2' }} />
            <TextField size="small" fullWidth label="Phone" value={form.phone ?? ''} onChange={e=> onChangeField('phone', e.target.value)} sx={fieldSx} />
            <TextField size="small" fullWidth label="Ext" value={form.ext ?? ''} onChange={e=> onChangeField('ext', e.target.value)} sx={fieldSx} />
            <TextField size="small" fullWidth label="Title" value={form.title ?? ''} onChange={e=> onChangeField('title', e.target.value)} sx={fieldSx} />
            <TextField size="small" fullWidth label="Manager" value={form.manager ?? ''} onChange={e=> onChangeField('manager', e.target.value)} sx={fieldSx} />
            <FormControlLabel control={<Switch size="small" checked={!!form.active} onChange={e=> onChangeField('active', e.target.checked)} />} label="Active" />
          </Box>
        ) : (
          <Box sx={{ color: 'text.secondary', mt: 2 }}>Select a user to view details.</Box>
        )}
      </Paper>
    </Box>
  )
}
