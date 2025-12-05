import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, IconButton, ToggleButtonGroup, ToggleButton, Link, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Edit as EditIcon, Delete as DeleteIcon, FileCopy as CopyIcon, MoreVert as MoreVertIcon, ContentCopy as ContentCopyIcon } from '@mui/icons-material';

interface AppsSummaryProps {
  data: any;
}

export default function AppsSummary({ data }: AppsSummaryProps) {
  const apps = data.apps || [];
  const [localApps, setLocalApps] = useState(apps);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedApp, setSelectedApp] = useState<any>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, app: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedApp(app);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedApp(null);
  };

  const handleMenuEdit = () => {
    if (selectedApp) {
      handleEdit(selectedApp.id);
    }
    handleMenuClose();
  };

  const handleMenuCopy = () => {
    if (selectedApp) {
      handleCopy(selectedApp.id);
    }
    handleMenuClose();
  };

  const handleMenuDelete = () => {
    if (selectedApp) {
      handleDelete(selectedApp.id);
    }
    handleMenuClose();
  };

  const handleToggleStatus = (appId: string) => {
    setLocalApps((prev: any[]) => prev.map(app => 
      app.id === appId 
        ? { ...app, status: app.status === 'Active' ? 'Inactive' : 'Active' }
        : app
    ));
  };

  const handleEdit = (appId: string) => {
    console.log('Edit app:', appId);
    // This will be handled by parent component
  };

  const handleCopy = (appId: string) => {
    console.log('Copy app:', appId);
    // This will be handled by parent component
  };

  const handleDelete = (appId: string) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      console.log('Delete app:', appId);
      // This will be handled by parent component
    }
  };

  const columns: GridColDef[] = [
    { 
      field: 'name', 
      headerName: 'Name', 
      width: 150,
      renderCell: (params) => (
        <Link
          component="button"
          variant="body2"
          onClick={() => handleEdit(params.row.id)}
          sx={{ textAlign: 'left', fontSize: '0.875rem', fontWeight: 500 }}
        >
          {params.value}
        </Link>
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
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontSize: '0.875rem', fontFamily: 'monospace' }}>
          {params.value}
        </Typography>
      )
    },
    { 
      field: 'info', 
      headerName: 'Info', 
      width: 250,
      sortable: false,
      renderCell: (params) => {
        const auditCheckCount = params.row.dataChecks?.length || 0;
        const tabCount = params.row.tabs?.length || 0;
        const settingsCount = params.row.settings?.length || 0;
        
        return (
          <Box sx={{ display: 'flex', gap: 1.5, fontSize: '0.75rem' }}>
            <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
              <strong>Checks:</strong> {auditCheckCount}
            </Typography>
            <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
              <strong>Tabs:</strong> {tabCount}
            </Typography>
            <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
              <strong>Settings:</strong> {settingsCount}
            </Typography>
          </Box>
        );
      }
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
              handleToggleStatus(params.row.id);
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
      width: 80,
      sortable: false,
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            handleMenuOpen(e, params.row);
          }}
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
          App Modules
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Manage application modules and their configurations ({localApps.length} modules)
        </Typography>
        <DataGrid
          rows={localApps}
          columns={columns}
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
        
        {/* Actions Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleMenuEdit}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleMenuCopy}>
            <ListItemIcon>
              <ContentCopyIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Copy</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleMenuDelete}>
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
