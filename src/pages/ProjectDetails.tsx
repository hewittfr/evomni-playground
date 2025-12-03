import React, { useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '../store/hooks'
import { fetchDashboard } from '../store/dashboardSlice'
import { Card, CardContent, Typography, Box, Button, Breadcrumbs } from '@mui/material'

export default function ProjectDetails(){
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { data, loading } = useAppSelector(s => s.dashboard as any)

  useEffect(() => {
    if (!data) dispatch(fetchDashboard({}))
  }, [data, dispatch])

  const project = (data?.projects || []).find((p: any) => String(p.id) === String(id))

  if (loading) return <Typography>Loading...</Typography>

  if (!project) return (
    <div>
      <Breadcrumbs aria-label="breadcrumb">
        <Button color="inherit" onClick={() => navigate(-1)}>Back</Button>
        <Typography color="text.primary">Project</Typography>
      </Breadcrumbs>
      <Typography variant="h6">Project not found</Typography>
      <Button component={Link as any} to="/">Back to dashboard</Button>
    </div>
  )

  return (
    <Card>
      <CardContent>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
          <Button color="inherit" onClick={() => navigate(-1)}>Back</Button>
          <Typography color="text.primary">{project.name}</Typography>
        </Breadcrumbs>

        <Typography variant="h5">{project.name}</Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2">Status: {project.status}</Typography>
          <Typography variant="subtitle2">Progress: {project.progress}%</Typography>
          {project.budgetTotal != null && (
            <Typography variant="subtitle2">Budget: {project.budgetTotal}</Typography>
          )}
        </Box>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2">Full project data (debug)</Typography>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(project, null, 2)}</pre>
        </Box>
      </CardContent>
    </Card>
  )
}
