import React from 'react'
import { Box, Typography, Paper, CircularProgress, Alert } from '@mui/material'
import { AdminData, TreeNode, NodeType } from '../../types/adminTypes'
import { adminDataService } from '../../services/adminDataService'
import AdminTreeView from '../../components/AdminTreeView'
import DetailPanel from '../../components/DetailPanel'
import '../../components/admin.css'

export default function Apps(){
  const [data, setData] = React.useState<AdminData | null>(null)
  const [selectedNode, setSelectedNode] = React.useState<TreeNode | null>(null)
  const [expandedNodes, setExpandedNodes] = React.useState<string[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const adminData = await adminDataService.getAdminData()
      setData(adminData)
      
      // Auto-expand the top-level nodes
      const initialExpanded: string[] = ['apps']
      if (adminData.globalExportZones.length > 0) {
        initialExpanded.push('exportZones')
      }
      setExpandedNodes(initialExpanded)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleNodeSelect = (node: TreeNode) => {
    setSelectedNode(node)
  }

  // Helper to convert NodeType to API type (singular form)
  const toApiType = (nodeType: NodeType): 'app' | 'dataCheck' | 'setting' | 'tab' | 'exportZone' | 'exportPreset' | 'eventJob' => {
    const mapping: Record<string, string> = {
      'dataChecks': 'dataCheck',
      'settings': 'setting',
      'tabs': 'tab',
      'exportZones': 'exportZone',
      'exportPresets': 'exportPreset',
      'eventJobs': 'eventJob'
    }
    return (mapping[nodeType] || nodeType) as any
  }

  const handleUpdate = async (nodeType: NodeType, itemId: string, updates: any) => {
    try {
      await adminDataService.updateItem(toApiType(nodeType), itemId, updates)
      // In a real app, you would reload data or update the local state
      console.log('Update successful')
    } catch (err) {
      console.error('Update failed:', err)
    }
  }

  const handleDelete = async (nodeType: NodeType, itemId: string) => {
    try {
      await adminDataService.deleteItem(toApiType(nodeType), itemId)
      // In a real app, you would reload data or update the local state
      console.log('Delete successful')
      setSelectedNode(null)
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  const handleCopy = async (nodeType: NodeType, itemId: string) => {
    try {
      const apiType = toApiType(nodeType) as 'app' | 'dataCheck' | 'setting' | 'tab' | 'exportZone' | 'exportPreset'
      const newId = await adminDataService.copyItem(apiType, itemId)
      console.log('Copy successful, new ID:', newId)
      // In a real app, you would reload data to show the new item
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    )
  }

  if (!data) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">No data available</Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ height: 'calc(100vh - 200px)', display: 'flex' }}>
      {/* Left Panel - Tree View */}
      <Paper 
        sx={{ 
          width: 320, 
          height: '100%',
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <AdminTreeView
          data={data}
          selectedNodeId={selectedNode?.id || null}
          onNodeSelect={handleNodeSelect}
          expandedNodes={expandedNodes}
          onExpandedNodesChange={setExpandedNodes}
        />
      </Paper>

      {/* Right Panel - Detail View */}
      <Paper 
        sx={{ 
          flex: 1, 
          ml: 2,
          height: '100%',
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <DetailPanel
          selectedNode={selectedNode}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onCopy={handleCopy}
        />
      </Paper>
    </Box>
  )
}
