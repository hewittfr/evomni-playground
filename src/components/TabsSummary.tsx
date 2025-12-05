import React from 'react';
import { Card, CardContent, Typography, Box, Chip, Link, ToggleButton, ToggleButtonGroup, IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { Tab as TabIcon, MoreVert as MoreVertIcon, Edit as EditIcon, ContentCopy as ContentCopyIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

interface TabsSummaryProps {
  data: any;
}

export default function TabsSummary({ data }: TabsSummaryProps) {
  const tabs = data.tabs || [];
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedTab, setSelectedTab] = React.useState<any>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, row: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedTab(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTab(null);
  };

  const handleEdit = () => {
    console.log('Edit tab:', selectedTab);
    handleMenuClose();
  };

  const handleCopy = () => {
    console.log('Copy tab:', selectedTab);
    handleMenuClose();
  };

  const handleDelete = () => {
    console.log('Delete tab:', selectedTab);
    handleMenuClose();
  };
  
  const columns: GridColDef[] = [
    { 
      field: 'name', 
      headerName: 'Name', 
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TabIcon sx={{ fontSize: '1.1rem', color: 'primary.main' }} />
          <Link
            component="button"
            variant="body2"
            onClick={() => {/* TODO: Navigate to tab detail */}}
            sx={{ textAlign: 'left', fontSize: '0.875rem' }}
          >
            {params.value}
          </Link>
        </Box>
      )
    },
    { 
      field: 'description', 
      headerName: 'Description', 
      flex: 1,
      minWidth: 300
    },
    { 
      field: 'key', 
      headerName: 'Key', 
      width: 150
    },
    { 
      field: 'attributes', 
      headerName: 'Attributes', 
      width: 500,
      sortable: false,
      renderCell: (params) => {
        const row = params.row;
        const tabSettingsCount = Array.isArray(row.tabSettings) ? row.tabSettings.length : 0;
        const exportPresetCount = Array.isArray(row.exportPresets) ? row.exportPresets.length : 0;
        const exportZoneCount = Array.isArray(row.exportZones) ? row.exportZones.length : 0;
        
        // Count audit groups (slots) and audit columns (dataChecks within slots)
        const auditGroupCount = Array.isArray(row.slots) ? row.slots.length : 0;
        const auditColumnCount = Array.isArray(row.slots) 
          ? row.slots.reduce((sum: number, slot: any) => sum + (Array.isArray(slot.dataChecks) ? slot.dataChecks.length : 0), 0)
          : 0;
        
        return (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', py: 0.5 }}>
            <Chip
              label={`Tab Settings: ${tabSettingsCount}`}
              size="small"
              clickable
              onClick={() => {/* TODO: Navigate to tab settings section */}}
              color={tabSettingsCount === 0 ? "default" : "error"}
              sx={{ fontSize: '0.7rem', height: '22px' }}
            />
            <Chip
              label={`Export Presets: ${exportPresetCount}`}
              size="small"
              clickable
              onClick={() => {/* TODO: Navigate to export presets section */}}
              color={exportPresetCount === 0 ? "default" : "warning"}
              sx={{ fontSize: '0.7rem', height: '22px' }}
            />
            <Chip
              label={`Export Zones: ${exportZoneCount}`}
              size="small"
              clickable
              onClick={() => {/* TODO: Navigate to export zones section */}}
              color={exportZoneCount === 0 ? "default" : "secondary"}
              sx={{ fontSize: '0.7rem', height: '22px' }}
            />
            <Chip
              label={`Audit Groups: ${auditGroupCount}`}
              size="small"
              clickable
              onClick={() => {/* TODO: Navigate to audit groups section */}}
              color={auditGroupCount === 0 ? "default" : "info"}
              sx={{ fontSize: '0.7rem', height: '22px' }}
            />
            <Chip
              label={`Audit Columns: ${auditColumnCount}`}
              size="small"
              clickable
              onClick={() => {/* TODO: Navigate to audit columns section */}}
              color={auditColumnCount === 0 ? "default" : "success"}
              sx={{ fontSize: '0.7rem', height: '22px' }}
            />
          </Box>
        );
      }
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 150,
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
      width: 80,
      sortable: false,
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={(e) => handleMenuOpen(e, params.row)}
          sx={{ color: 'text.secondary' }}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      )
    }
  ];
  
  return (
    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Projects ({tabs.length})
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Application project configuration
        </Typography>
        <Box sx={{ width: '100%' }}>
          <DataGrid
            rows={tabs}
            columns={columns}
            autoHeight
            getRowHeight={() => 'auto'}
            density="compact"
            disableRowSelectionOnClick
            pageSizeOptions={[10, 25, 50]}
            sx={{
              fontSize: '0.875rem',
              '& .MuiDataGrid-columnHeaders': {
                fontSize: '0.875rem',
              },
              '& .MuiDataGrid-cell': {
                py: 1,
                alignItems: 'flex-start'
              }
            }}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10 },
              },
            }}
          />
        </Box>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleEdit}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleCopy}>
            <ListItemIcon>
              <ContentCopyIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Copy</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleDelete}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        </Menu>
      </CardContent>
    </Card>
  );
}
