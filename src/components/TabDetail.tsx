import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, Grid, TextField, Chip, ToggleButtonGroup, ToggleButton, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, Link, Select, MenuItem } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { ArrowUpward, ArrowDownward, Edit, Delete } from '@mui/icons-material';
import { Tab, Settings, ExportPreset, ExportZone, CPP, Slot } from '../types/adminTypes';

interface TabDetailProps {
  tab: Tab;
}

export default function TabDetail({ tab }: TabDetailProps) {
  const [tabSettings, setTabSettings] = useState(tab.settings || []);
  const [exportPresets, setExportPresets] = useState(tab.exportPresets || []);
  const [cppInputs, setCppInputs] = useState([
    { id: 'cpp-0', name: 'CPP-0', options: ['Cobra-0', 'Cobra-1', 'Cobra-2', 'Base-0', 'Base-1', 'Stat-0', 'Stat-1'], selectedOption: 'Cobra-0', hidden: false },
    { id: 'cpp-1', name: 'CPP-1', options: ['Cobra-0', 'Cobra-1', 'Cobra-2', 'Base-0', 'Base-1', 'Stat-0', 'Stat-1'], selectedOption: 'Cobra-1', hidden: false },
    { id: 'cpp-2', name: 'CPP-2', options: ['Cobra-0', 'Cobra-1', 'Cobra-2', 'Base-0', 'Base-1', 'Stat-0', 'Stat-1'], selectedOption: 'Base-0', hidden: true },
    { id: 'cpp-3', name: 'CPP-3', options: ['Cobra-0', 'Cobra-1', 'Cobra-2', 'Base-0', 'Base-1', 'Stat-0', 'Stat-1'], selectedOption: 'Base-1', hidden: false },
    { id: 'cpp-4', name: 'CPP-4', options: ['Cobra-0', 'Cobra-1', 'Cobra-2', 'Base-0', 'Base-1', 'Stat-0', 'Stat-1'], selectedOption: 'Stat-0', hidden: true },
    { id: 'cpp-5', name: 'CPP-5', options: ['Cobra-0', 'Cobra-1', 'Cobra-2', 'Base-0', 'Base-1', 'Stat-0', 'Stat-1'], selectedOption: 'Stat-1', hidden: false }
  ]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editDialogType, setEditDialogType] = useState<'setting' | 'preset' | 'zone' | 'cpp' | 'cluster' | null>(null);
  const [editItem, setEditItem] = useState<any>(null);

  const handleToggleSettingStatus = (settingId: string) => {
    setTabSettings(prev => prev.map(s => 
      s.id === settingId 
        ? { ...s, status: s.status === 'Active' ? 'Inactive' : 'Active' }
        : s
    ));
  };

  const handleTogglePresetStatus = (presetId: string) => {
    setExportPresets(prev => prev.map(p => 
      p.id === presetId 
        ? { ...p, status: p.status === 'Active' ? 'Inactive' : 'Active' }
        : p
    ));
  };

  const handleCppOptionChange = (cppId: string, newOption: string) => {
    setCppInputs(prev => prev.map(cpp => 
      cpp.id === cppId 
        ? { ...cpp, selectedOption: newOption }
        : cpp
    ));
  };

  const handleToggleCppHidden = (cppId: string) => {
    setCppInputs(prev => prev.map(cpp => 
      cpp.id === cppId 
        ? { ...cpp, hidden: !cpp.hidden }
        : cpp
    ));
  };

  const handleMoveSortOrder = (presetId: string, direction: 'up' | 'down') => {
    setExportPresets(prev => {
      const sorted = [...prev].sort((a, b) => a.sortOrder - b.sortOrder);
      const currentIndex = sorted.findIndex(p => p.id === presetId);
      
      if (currentIndex === -1) return prev;
      if (direction === 'up' && currentIndex === 0) return prev;
      if (direction === 'down' && currentIndex === sorted.length - 1) return prev;

      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      const currentItem = sorted[currentIndex];
      const targetItem = sorted[targetIndex];

      // Swap sort orders
      const newPresets = prev.map(p => {
        if (p.id === currentItem.id) return { ...p, sortOrder: targetItem.sortOrder };
        if (p.id === targetItem.id) return { ...p, sortOrder: currentItem.sortOrder };
        return p;
      });

      return newPresets;
    });
  };

  const handleEdit = (item: any, type: 'setting' | 'preset' | 'zone' | 'cpp' | 'cluster') => {
    setEditItem(item);
    setEditDialogType(type);
    setEditDialogOpen(true);
  };

  const handleDelete = (itemId: string, type: 'setting' | 'preset' | 'zone' | 'cpp' | 'cluster') => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      if (type === 'setting') {
        setTabSettings(prev => prev.filter(s => s.id !== itemId));
      } else if (type === 'preset') {
        setExportPresets(prev => prev.filter(p => p.id !== itemId));
      }
      // Add handlers for other types as needed
    }
  };

  const handleCloseDialog = () => {
    setEditDialogOpen(false);
    setEditItem(null);
    setEditDialogType(null);
  };

  const tabSettingsColumns: GridColDef[] = [
  { 
    field: 'name', 
    headerName: 'Name', 
    width: 220,
    renderCell: (params) => (
      <Link
        component="button"
        onClick={(e) => {
          e.stopPropagation();
          handleEdit(params.row, 'setting');
        }}
        sx={{ 
          cursor: 'pointer',
          textDecoration: 'none',
          '&:hover': { textDecoration: 'underline' }
        }}
      >
        {params.value}
      </Link>
    )
  },
  { field: 'description', headerName: 'Description', width: 450 },
  { field: 'key', headerName: 'Key', width: 180 },
  { field: 'value', headerName: 'Value', flex: 1 },
  { 
    field: 'status', 
    headerName: 'Status', 
    width: 150,
    sortable: false,
    renderCell: (params) => (
      <ToggleButtonGroup
        value={params.value}
        exclusive
        onChange={(e, newValue) => {
          if (newValue !== null) {
            e.stopPropagation();
            handleToggleSettingStatus(params.row.id);
          }
        }}
        size="small"
        sx={{ height: '24px' }}
      >
        <ToggleButton 
          value="Active" 
          sx={{ 
            px: 1, 
            fontSize: '0.7rem',
            textTransform: 'none',
            border: '1px solid',
            borderColor: 'divider',
            '&.Mui-selected': {
              backgroundColor: 'success.main',
              color: 'white',
              borderColor: 'success.main',
              '&:hover': {
                backgroundColor: 'success.dark',
              }
            }
          }}
        >
          Active
        </ToggleButton>
        <ToggleButton 
          value="Inactive" 
          sx={{ 
            px: 1, 
            fontSize: '0.7rem',
            textTransform: 'none',
            border: '1px solid',
            borderColor: 'divider',
            '&.Mui-selected': {
              backgroundColor: 'action.disabledBackground',
              color: 'text.secondary',
              borderColor: 'divider',
              '&:hover': {
                backgroundColor: 'action.hover',
              }
            }
          }}
        >
          Inactive
        </ToggleButton>
      </ToggleButtonGroup>
    )
  },
  {
    field: 'actions',
    headerName: 'Actions',
    width: 110,
    sortable: false,
    renderCell: (params) => (
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            handleEdit(params.row, 'setting');
          }}
          sx={{ 
            padding: '4px',
            color: 'primary.main',
            '&:hover': {
              backgroundColor: 'primary.light',
              color: 'primary.dark'
            }
          }}
        >
          <Edit sx={{ fontSize: '18px' }} />
        </IconButton>
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(params.row.id, 'setting');
          }}
          sx={{ 
            padding: '4px',
            color: 'error.main',
            '&:hover': {
              backgroundColor: 'error.light',
              color: 'error.dark'
            }
          }}
        >
          <Delete sx={{ fontSize: '18px' }} />
        </IconButton>
      </Box>
    )
  }
];

  const exportPresetsColumns: GridColDef[] = [
    { 
      field: 'name', 
      headerName: 'Name', 
      width: 220,
      renderCell: (params) => (
        <Link
          component="button"
          onClick={(e) => {
            e.stopPropagation();
            handleEdit(params.row, 'preset');
          }}
          sx={{ 
            cursor: 'pointer',
            textDecoration: 'none',
            '&:hover': { textDecoration: 'underline' }
          }}
        >
          {params.value}
        </Link>
      )
    },
    { field: 'description', headerName: 'Description', width: 450 },
    { field: 'key', headerName: 'Key', width: 150 },
    { field: 'presetSettings', headerName: 'Preset Settings', flex: 1 },
    { 
      field: 'sortOrder', 
      headerName: 'Sort Order', 
      width: 160,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconButton 
            size="small" 
            onClick={(e) => {
              e.stopPropagation();
              handleMoveSortOrder(params.row.id, 'up');
            }}
            sx={{ 
              padding: '2px',
              '&:hover': { backgroundColor: 'action.hover' }
            }}
          >
            <ArrowUpward sx={{ fontSize: '16px' }} />
          </IconButton>
          <Box 
            sx={{ 
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '4px',
              px: 0.5,
              py: 0.25,
              minWidth: '24px',
              textAlign: 'center',
              fontSize: '0.875rem',
              fontWeight: 500
            }}
          >
            {params.value}
          </Box>
          <IconButton 
            size="small" 
            onClick={(e) => {
              e.stopPropagation();
              handleMoveSortOrder(params.row.id, 'down');
            }}
            sx={{ 
              padding: '2px',
              '&:hover': { backgroundColor: 'action.hover' }
            }}
          >
            <ArrowDownward sx={{ fontSize: '16px' }} />
          </IconButton>
        </Box>
      )
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <ToggleButtonGroup
          value={params.value}
          exclusive
          onChange={(e, newValue) => {
            if (newValue !== null) {
              e.stopPropagation();
              handleTogglePresetStatus(params.row.id);
            }
          }}
          size="small"
          sx={{ height: '24px' }}
        >
          <ToggleButton 
            value="Active" 
            sx={{ 
              px: 1, 
              fontSize: '0.7rem',
              textTransform: 'none',
              border: '1px solid',
              borderColor: 'divider',
              '&.Mui-selected': {
                backgroundColor: 'success.main',
                color: 'white',
                borderColor: 'success.main',
                '&:hover': {
                  backgroundColor: 'success.dark',
                }
              }
            }}
          >
            Active
          </ToggleButton>
          <ToggleButton 
            value="Inactive" 
            sx={{ 
              px: 1, 
              fontSize: '0.7rem',
              textTransform: 'none',
              border: '1px solid',
              borderColor: 'divider',
              '&.Mui-selected': {
                backgroundColor: 'action.disabledBackground',
                color: 'text.secondary',
                borderColor: 'divider',
                '&:hover': {
                  backgroundColor: 'action.hover',
                }
              }
            }}
          >
            Inactive
          </ToggleButton>
        </ToggleButtonGroup>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 110,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(params.row, 'preset');
            }}
            sx={{ 
              padding: '4px',
              color: 'primary.main',
              '&:hover': {
                backgroundColor: 'primary.light',
                color: 'primary.dark'
              }
            }}
          >
            <Edit sx={{ fontSize: '18px' }} />
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(params.row.id, 'preset');
            }}
            sx={{ 
              padding: '4px',
              color: 'error.main',
              '&:hover': {
                backgroundColor: 'error.light',
                color: 'error.dark'
              }
            }}
          >
            <Delete sx={{ fontSize: '18px' }} />
          </IconButton>
        </Box>
      )
    }
  ];

  const exportZonesColumns: GridColDef[] = [
    { 
      field: 'name', 
      headerName: 'Name', 
      width: 220,
      renderCell: (params) => (
        <Link
          component="button"
          onClick={(e) => {
            e.stopPropagation();
            handleEdit(params.row, 'zone');
          }}
          sx={{ 
            cursor: 'pointer',
            textDecoration: 'none',
            '&:hover': { textDecoration: 'underline' }
          }}
        >
          {params.value}
        </Link>
      )
    },
    { field: 'description', headerName: 'Description', width: 350 },
    { field: 'key', headerName: 'Key', width: 180 },
    { 
      field: 'paths', 
      headerName: 'Paths', 
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', py: 0.875, gap: 0.25 }}>
          <Typography variant="body2" sx={{ fontSize: '0.75rem', lineHeight: 1.3 }}>
            <strong>Debug:</strong> {params.row.debugPath}
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '0.75rem', lineHeight: 1.3 }}>
            <strong>Release:</strong> {params.row.releasePath}
          </Typography>
        </Box>
      )
    },
    { 
      field: 'sortOrder', 
      headerName: 'Sort Order', 
      width: 160,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconButton 
            size="small" 
            onClick={(e) => {
              e.stopPropagation();
              // Add handler for export zones if needed
            }}
            sx={{ 
              padding: '2px',
              '&:hover': { backgroundColor: 'action.hover' }
            }}
          >
            <ArrowUpward sx={{ fontSize: '16px' }} />
          </IconButton>
          <Box 
            sx={{ 
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '4px',
              px: 0.5,
              py: 0.25,
              minWidth: '24px',
              textAlign: 'center',
              fontSize: '0.875rem',
              fontWeight: 500
            }}
          >
            {params.value}
          </Box>
          <IconButton 
            size="small" 
            onClick={(e) => {
              e.stopPropagation();
              // Add handler for export zones if needed
            }}
            sx={{ 
              padding: '2px',
              '&:hover': { backgroundColor: 'action.hover' }
            }}
          >
            <ArrowDownward sx={{ fontSize: '16px' }} />
          </IconButton>
        </Box>
      )
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <ToggleButtonGroup
          value={params.value}
          exclusive
          size="small"
          sx={{ height: '24px' }}
        >
          <ToggleButton 
            value="Active" 
            sx={{ 
              px: 1, 
              fontSize: '0.7rem',
              textTransform: 'none',
              border: '1px solid',
              borderColor: 'divider',
              '&.Mui-selected': {
                backgroundColor: 'success.main',
                color: 'white',
                borderColor: 'success.main',
                '&:hover': {
                  backgroundColor: 'success.dark',
                }
              }
            }}
          >
            Active
          </ToggleButton>
          <ToggleButton 
            value="Inactive" 
            sx={{ 
              px: 1, 
              fontSize: '0.7rem',
              textTransform: 'none',
              border: '1px solid',
              borderColor: 'divider',
              '&.Mui-selected': {
                backgroundColor: 'action.disabledBackground',
                color: 'text.secondary',
                borderColor: 'divider',
                '&:hover': {
                  backgroundColor: 'action.hover',
                }
              }
            }}
          >
            Inactive
          </ToggleButton>
        </ToggleButtonGroup>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 110,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(params.row, 'zone');
            }}
            sx={{ 
              padding: '4px',
              color: 'primary.main',
              '&:hover': {
                backgroundColor: 'primary.light',
                color: 'primary.dark'
              }
            }}
          >
            <Edit sx={{ fontSize: '18px' }} />
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(params.row.id, 'zone');
            }}
            sx={{ 
              padding: '4px',
              color: 'error.main',
              '&:hover': {
                backgroundColor: 'error.light',
                color: 'error.dark'
              }
            }}
          >
            <Delete sx={{ fontSize: '18px' }} />
          </IconButton>
        </Box>
      )
    }
  ];

  const cppColumns: GridColDef[] = [
    { 
      field: 'name', 
      headerName: 'Name', 
      width: 150,
      renderCell: (params) => (
        <Link
          component="button"
          onClick={(e) => {
            e.stopPropagation();
            handleEdit(params.row, 'cpp');
          }}
          sx={{ 
            cursor: 'pointer',
            textDecoration: 'none',
            '&:hover': { textDecoration: 'underline' }
          }}
        >
          {params.value}
        </Link>
      )
    },
    { 
      field: 'selectedOption', 
      headerName: 'Options', 
      flex: 1,
      renderCell: (params) => (
        <Select
          value={params.value}
          onChange={(e) => {
            e.stopPropagation();
            handleCppOptionChange(params.row.id, e.target.value);
          }}
          size="small"
          sx={{ 
            minWidth: 120,
            fontSize: '0.875rem',
            '& .MuiSelect-select': {
              py: 0.5
            }
          }}
        >
          {params.row.options?.map((option: string) => (
            <MenuItem key={option} value={option} sx={{ fontSize: '0.875rem' }}>
              {option}
            </MenuItem>
          ))}
        </Select>
      )
    },
    { 
      field: 'hidden', 
      headerName: 'Hidden', 
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <ToggleButtonGroup
          value={params.value ? 'true' : 'false'}
          exclusive
          onChange={(e, newValue) => {
            if (newValue !== null) {
              e.stopPropagation();
              handleToggleCppHidden(params.row.id);
            }
          }}
          size="small"
          sx={{ height: '24px' }}
        >
          <ToggleButton 
            value="true" 
            sx={{ 
              px: 1, 
              fontSize: '0.7rem',
              textTransform: 'none',
              border: '1px solid',
              borderColor: 'divider',
              '&.Mui-selected': {
                backgroundColor: 'warning.main',
                color: 'white',
                borderColor: 'warning.main',
                '&:hover': {
                  backgroundColor: 'warning.dark',
                }
              }
            }}
          >
            True
          </ToggleButton>
          <ToggleButton 
            value="false" 
            sx={{ 
              px: 1, 
              fontSize: '0.7rem',
              textTransform: 'none',
              border: '1px solid',
              borderColor: 'divider',
              '&.Mui-selected': {
                backgroundColor: 'success.main',
                color: 'white',
                borderColor: 'success.main',
                '&:hover': {
                  backgroundColor: 'success.dark',
                }
              }
            }}
          >
            False
          </ToggleButton>
        </ToggleButtonGroup>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 110,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(params.row, 'cpp');
            }}
            sx={{ 
              padding: '4px',
              color: 'primary.main',
              '&:hover': {
                backgroundColor: 'primary.light',
                color: 'primary.dark'
              }
            }}
          >
            <Edit sx={{ fontSize: '18px' }} />
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(params.row.id, 'cpp');
            }}
            sx={{ 
              padding: '4px',
              color: 'error.main',
              '&:hover': {
                backgroundColor: 'error.light',
                color: 'error.dark'
              }
            }}
          >
            <Delete sx={{ fontSize: '18px' }} />
          </IconButton>
        </Box>
      )
    }
  ];

  const auditClustersColumns: GridColDef[] = [
    { 
      field: 'name', 
      headerName: 'Name', 
      width: 220,
      renderCell: (params) => (
        <Link
          component="button"
          onClick={(e) => {
            e.stopPropagation();
            handleEdit(params.row, 'cluster');
          }}
          sx={{ 
            cursor: 'pointer',
            textDecoration: 'none',
            '&:hover': { textDecoration: 'underline' }
          }}
        >
          {params.value}
        </Link>
      )
    },
    { field: 'description', headerName: 'Description', flex: 1 },
    { 
      field: 'settings', 
      headerName: 'Settings', 
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
          {params.value?.length || 0}
        </Typography>
      )
    },
    { 
      field: 'exportZones', 
      headerName: 'Export Zones', 
      width: 140,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
          {params.value?.length || 0}
        </Typography>
      )
    },
    { 
      field: 'dataChecks', 
      headerName: 'Audit Checks', 
      width: 140,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
          {params.value?.length || 0}
        </Typography>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 110,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(params.row, 'cluster');
            }}
            sx={{ 
              padding: '4px',
              color: 'primary.main',
              '&:hover': {
                backgroundColor: 'primary.light',
                color: 'primary.dark'
              }
            }}
          >
            <Edit sx={{ fontSize: '18px' }} />
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(params.row.id, 'cluster');
            }}
            sx={{ 
              padding: '4px',
              color: 'error.main',
              '&:hover': {
                backgroundColor: 'error.light',
                color: 'error.dark'
              }
            }}
          >
            <Delete sx={{ fontSize: '18px' }} />
          </IconButton>
        </Box>
      )
    }
  ];

  return (
    <Box>
      {/* Tab Information */}
      <Card elevation={0} sx={{ mb: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Tab Information</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Name"
                value={tab.name}
                disabled
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Key"
                value={tab.key}
                disabled
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Status"
                value={tab.status}
                disabled
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Sort Order"
                value={tab.sortOrder}
                disabled
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                multiline
                rows={2}
                label="Description"
                value={tab.description || ''}
                disabled
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tab Settings */}
      <Card elevation={0} sx={{ mb: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Tab Settings ({tabSettings.length})</Typography>
          <DataGrid
            rows={tabSettings}
            columns={tabSettingsColumns}
            autoHeight
            density="compact"
            disableRowSelectionOnClick
            hideFooter
            sx={{
              '& .MuiDataGrid-cell': {
                fontSize: '0.875rem'
              }
            }}
          />
        </CardContent>
      </Card>

      {/* Export Presets */}
      <Card elevation={0} sx={{ mb: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Export Presets ({exportPresets.length})</Typography>
          <DataGrid
            rows={exportPresets}
            columns={exportPresetsColumns}
            autoHeight
            density="compact"
            disableRowSelectionOnClick
            hideFooter
            sx={{
              '& .MuiDataGrid-cell': {
                fontSize: '0.875rem'
              }
            }}
          />
        </CardContent>
      </Card>

      {/* Export Zones */}
      <Card elevation={0} sx={{ mb: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Export Zones ({tab.exportZones?.length || 0})</Typography>
          <DataGrid
            rows={tab.exportZones || []}
            columns={exportZonesColumns}
            autoHeight
            disableRowSelectionOnClick
            hideFooter
            getRowHeight={() => 52}
            sx={{
              '& .MuiDataGrid-cell': {
                fontSize: '0.875rem'
              }
            }}
          />
        </CardContent>
      </Card>

      {/* CPPs */}
      <Card elevation={0} sx={{ mb: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>CPP Inputs ({cppInputs.length})</Typography>
          <DataGrid
            rows={cppInputs}
            columns={cppColumns}
            autoHeight
            density="compact"
            disableRowSelectionOnClick
            hideFooter
            sx={{
              '& .MuiDataGrid-cell': {
                fontSize: '0.875rem'
              }
            }}
          />
        </CardContent>
      </Card>

      {/* Audit Clusters */}
      <Card elevation={0} sx={{ mb: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Audit Clusters ({tab.slots?.length || 0})</Typography>
          <DataGrid
            rows={tab.slots || []}
            columns={auditClustersColumns}
            autoHeight
            density="compact"
            disableRowSelectionOnClick
            hideFooter
            sx={{
              '& .MuiDataGrid-cell': {
                fontSize: '0.875rem'
              }
            }}
          />
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Edit {editDialogType === 'setting' ? 'Setting' : 
                editDialogType === 'preset' ? 'Export Preset' : 
                editDialogType === 'zone' ? 'Export Zone' : 
                editDialogType === 'cpp' ? 'CPP Input' : 
                'Audit Cluster'}
        </DialogTitle>
        <DialogContent>
          {editItem && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Name"
                  value={editItem.name || ''}
                  disabled
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  multiline
                  rows={3}
                  label="Description"
                  value={editItem.description || ''}
                  disabled
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Edit functionality will be implemented here
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleCloseDialog} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
