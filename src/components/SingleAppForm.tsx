import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button,
  Grid,
  Alert,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Link,
  Chip,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { 
  Add as AddIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as ContentCopyIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckCircleIcon,
  Tab as TabIcon
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { App, DataCheck, Settings, Tab } from '../types/adminTypes';

interface SingleAppFormProps {
  app: App;
  onSave: (app: App) => void;
  allApps?: App[];
}

// Validation schema
const singleAppValidationSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  key: Yup.string()
    .required('Key is required')
    .matches(/^[a-z0-9-]+$/, 'Key must be lowercase letters, numbers, and hyphens only'),
  description: Yup.string().required('Description is required'),
  status: Yup.string().oneOf(['Active', 'Inactive']).required('Status is required'),
});

// DataGrid column definitions
const dataChecksColumns = (handleEditDataCheck: (dataCheck: DataCheck) => void, handleMoveDataCheck: (dataCheckId: string, direction: 'up' | 'down') => void): GridColDef[] => [
  { 
    field: 'name', 
    headerName: 'Name', 
    width: 200,
    renderCell: (params) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CheckCircleIcon sx={{ fontSize: '1.1rem', color: 'success.main' }} />
        <Link
          component="button"
          variant="body2"
          onClick={() => handleEditDataCheck(params.row)}
          sx={{ textAlign: 'left', fontSize: '0.8rem' }}
        >
          {params.value}
        </Link>
      </Box>
    )
  },
  { field: 'description', headerName: 'Description', width: 450 },
  { field: 'key', headerName: 'Key', width: 150 },
  { field: 'sqlSelect', headerName: 'SQL Select', width: 300, flex: 1 },
  { 
    field: 'sortOrder', 
    headerName: 'Sort Order', 
    width: 120,
    sortable: false,
    renderCell: (params) => {
      const dataCheckIndex = params.api.getSortedRowIds().indexOf(params.row.id);
      const isFirst = dataCheckIndex === 0;
      const isLast = dataCheckIndex === params.api.getSortedRowIds().length - 1;
      
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" sx={{ fontSize: '0.875rem', minWidth: '20px', fontWeight: 500 }}>
            {params.value}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleMoveDataCheck(params.row.id, 'up');
              }}
              disabled={isFirst}
              sx={{ 
                p: 0.5,
                border: '1px solid',
                borderColor: isFirst ? 'action.disabled' : 'divider',
                borderRadius: 1,
                '&:hover': {
                  backgroundColor: isFirst ? 'transparent' : 'action.hover',
                  borderColor: isFirst ? 'action.disabled' : 'primary.main',
                }
              }}
            >
              <ArrowUpwardIcon sx={{ fontSize: '1rem', color: isFirst ? 'action.disabled' : 'inherit' }} />
            </IconButton>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleMoveDataCheck(params.row.id, 'down');
              }}
              disabled={isLast}
              sx={{ 
                p: 0.5,
                border: '1px solid',
                borderColor: isLast ? 'action.disabled' : 'divider',
                borderRadius: 1,
                '&:hover': {
                  backgroundColor: isLast ? 'transparent' : 'action.hover',
                  borderColor: isLast ? 'action.disabled' : 'primary.main',
                }
              }}
            >
              <ArrowDownwardIcon sx={{ fontSize: '1rem', color: isLast ? 'action.disabled' : 'inherit' }} />
            </IconButton>
          </Box>
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
        onClick={(e) => {
          e.stopPropagation();
          params.row.handleMenuOpen(e, params.row);
        }}
        sx={{ color: 'text.secondary' }}
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>
    )
  }
];

const settingsColumns = (handleEditSetting: (setting: Settings) => void): GridColDef[] => [
  { 
    field: 'name', 
    headerName: 'Name', 
    width: 200,
    renderCell: (params) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <SettingsIcon sx={{ fontSize: '1.1rem', color: 'primary.main' }} />
        <Link
          component="button"
          variant="body2"
          onClick={() => handleEditSetting(params.row)}
          sx={{ textAlign: 'left', fontSize: '0.8rem' }}
        >
          {params.value}
        </Link>
      </Box>
    )
  },
  { field: 'description', headerName: 'Description', width: 450 },
  { field: 'key', headerName: 'Key', width: 150 },
  { field: 'value', headerName: 'Value', width: 150, flex: 1 },
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
        onClick={(e) => {
          e.stopPropagation();
          params.row.handleMenuOpen(e, params.row);
        }}
        sx={{ color: 'text.secondary' }}
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>
    )
  }
];

const tabsColumns = (handleMoveTab: (tabId: string, direction: 'up' | 'down') => void, handleEditTab: (tab: Tab) => void): GridColDef[] => [
  { 
    field: 'name', 
    headerName: 'Name', 
    width: 200,
    renderCell: (params) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TabIcon sx={{ fontSize: '1.1rem', color: 'info.main' }} />
        <Link
          component="button"
          variant="body2"
          onClick={() => handleEditTab(params.row)}
          sx={{ textAlign: 'left', fontSize: '0.8rem' }}
        >
          {params.value}
        </Link>
      </Box>
    )
  },
  { field: 'description', headerName: 'Description', width: 450 },
  { field: 'key', headerName: 'Key', width: 150 },
  { 
    field: 'counts', 
    headerName: 'Attributes', 
    width: 450,
    flex: 2,
    sortable: false,
    renderCell: (params) => {
      const row = params.row;
      const settingsCount = Array.isArray(row.settings) ? row.settings.length : 0;
      const slotsCount = Array.isArray(row.slots) ? row.slots.length : 0;
      const cppsCount = Array.isArray(row.cpps) ? row.cpps.length : 0;
      const exportZonesCount = Array.isArray(row.exportZones) ? row.exportZones.length : 0;
      const presetsCount = Array.isArray(row.exportPresets) ? row.exportPresets.length : 0;
      
      return (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', py: 0.5 }}>
          <Chip
            label={`Tab Settings: ${settingsCount}`}
            size="small"
            color={settingsCount === 0 ? "default" : "error"}
            sx={{ fontSize: '0.7rem', height: '22px' }}
          />
          <Chip
            label={`Audit Groups: ${slotsCount}`}
            size="small"
            color={slotsCount === 0 ? "default" : "info"}
            sx={{ fontSize: '0.7rem', height: '22px' }}
          />
          <Chip
            label={`Audit Columns: ${cppsCount}`}
            size="small"
            color={cppsCount === 0 ? "default" : "success"}
            sx={{ fontSize: '0.7rem', height: '22px' }}
          />
          <Chip
            label={`Export Zones: ${exportZonesCount}`}
            size="small"
            color={exportZonesCount === 0 ? "default" : "secondary"}
            sx={{ fontSize: '0.7rem', height: '22px' }}
          />
          <Chip
            label={`Export Presets: ${presetsCount}`}
            size="small"
            color={presetsCount === 0 ? "default" : "warning"}
            sx={{ fontSize: '0.7rem', height: '22px' }}
          />
        </Box>
      );
    }
  },
  { 
    field: 'sortOrder', 
    headerName: 'Sort Order', 
    width: 120,
    sortable: false,
    renderCell: (params) => {
      const tabIndex = params.api.getSortedRowIds().indexOf(params.row.id);
      const isFirst = tabIndex === 0;
      const isLast = tabIndex === params.api.getSortedRowIds().length - 1;
      
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" sx={{ fontSize: '0.875rem', minWidth: '20px', fontWeight: 500 }}>
            {params.value}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleMoveTab(params.row.id, 'up');
              }}
              disabled={isFirst}
              sx={{ 
                p: 0.5,
                border: '1px solid',
                borderColor: isFirst ? 'action.disabled' : 'divider',
                borderRadius: 1,
                '&:hover': {
                  backgroundColor: isFirst ? 'transparent' : 'action.hover',
                  borderColor: isFirst ? 'action.disabled' : 'primary.main',
                }
              }}
            >
              <ArrowUpwardIcon sx={{ fontSize: '1rem', color: isFirst ? 'action.disabled' : 'inherit' }} />
            </IconButton>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleMoveTab(params.row.id, 'down');
              }}
              disabled={isLast}
              sx={{ 
                p: 0.5,
                border: '1px solid',
                borderColor: isLast ? 'action.disabled' : 'divider',
                borderRadius: 1,
                '&:hover': {
                  backgroundColor: isLast ? 'transparent' : 'action.hover',
                  borderColor: isLast ? 'action.disabled' : 'primary.main',
                }
              }}
            >
              <ArrowDownwardIcon sx={{ fontSize: '1rem', color: isLast ? 'action.disabled' : 'inherit' }} />
            </IconButton>
          </Box>
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
        onClick={(e) => {
          e.stopPropagation();
          params.row.handleMenuOpen(e, params.row);
        }}
        sx={{ color: 'text.secondary' }}
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>
    )
  }
];

export default function SingleAppForm({ app, onSave, allApps = [] }: SingleAppFormProps) {
  const [editingSettingOpen, setEditingSettingOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<Settings | null>(null);
  const [editingDataCheckOpen, setEditingDataCheckOpen] = useState(false);
  const [editingDataCheck, setEditingDataCheck] = useState<DataCheck | null>(null);
  const [editingTabOpen, setEditingTabOpen] = useState(false);
  const [editingTab, setEditingTab] = useState<Tab | null>(null);
  
  // Menu state for all three DataGrids
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [menuType, setMenuType] = useState<'dataCheck' | 'setting' | 'tab' | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, item: any, type: 'dataCheck' | 'setting' | 'tab') => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
    setMenuType(type);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
    setMenuType(null);
  };

  const handleMenuEdit = () => {
    if (selectedItem && menuType === 'dataCheck') {
      handleEditDataCheck(selectedItem);
    } else if (selectedItem && menuType === 'setting') {
      handleEditSetting(selectedItem);
    } else if (selectedItem && menuType === 'tab') {
      handleEditTab(selectedItem);
    }
    handleMenuClose();
  };

  const handleMenuCopy = () => {
    if (selectedItem) {
      console.log('Copy', menuType, ':', selectedItem);
      // TODO: Implement copy functionality
    }
    handleMenuClose();
  };

  const handleMenuDelete = () => {
    if (selectedItem) {
      console.log('Delete', menuType, ':', selectedItem);
      // TODO: Implement delete functionality
    }
    handleMenuClose();
  };

  const handleMoveDataCheck = (dataCheckId: string, direction: 'up' | 'down') => {
    const currentIndex = app.dataChecks.findIndex(dc => dc.id === dataCheckId);
    if (currentIndex === -1) return;

    const newDataChecks = [...app.dataChecks];
    if (direction === 'up' && currentIndex > 0) {
      [newDataChecks[currentIndex - 1], newDataChecks[currentIndex]] = [newDataChecks[currentIndex], newDataChecks[currentIndex - 1]];
    } else if (direction === 'down' && currentIndex < newDataChecks.length - 1) {
      [newDataChecks[currentIndex], newDataChecks[currentIndex + 1]] = [newDataChecks[currentIndex + 1], newDataChecks[currentIndex]];
    } else {
      return; // No change needed
    }

    // Update sortOrder based on new positions
    newDataChecks.forEach((dataCheck, index) => {
      dataCheck.sortOrder = index + 1;
    });

    onSave({ ...app, dataChecks: newDataChecks });
  };

  const handleMoveTab = (tabId: string, direction: 'up' | 'down') => {
    const currentIndex = app.tabs.findIndex(t => t.id === tabId);
    if (currentIndex === -1) return;

    const newTabs = [...app.tabs];
    if (direction === 'up' && currentIndex > 0) {
      [newTabs[currentIndex - 1], newTabs[currentIndex]] = [newTabs[currentIndex], newTabs[currentIndex - 1]];
    } else if (direction === 'down' && currentIndex < newTabs.length - 1) {
      [newTabs[currentIndex], newTabs[currentIndex + 1]] = [newTabs[currentIndex + 1], newTabs[currentIndex]];
    } else {
      return; // No change needed
    }

    // Update sortOrder based on new positions
    newTabs.forEach((tab, index) => {
      tab.sortOrder = index + 1;
    });

    onSave({ ...app, tabs: newTabs });
  };

  const handleEditTab = (tab: Tab) => {
    setEditingTab(tab);
    setEditingTabOpen(true);
  };

  const handleCloseTab = () => {
    setEditingTabOpen(false);
    setEditingTab(null);
  };

  const handleSaveTab = (updatedTab: Tab) => {
    // Update the tab in the app's tabs array
    const updatedTabs = app.tabs.map(t => 
      t.id === updatedTab.id ? updatedTab : t
    );
    onSave({ ...app, tabs: updatedTabs });
    handleCloseTab();
  };

  const handleEditSetting = (setting: Settings) => {
    setEditingSetting(setting);
    setEditingSettingOpen(true);
  };

  const handleCloseSetting = () => {
    setEditingSettingOpen(false);
    setEditingSetting(null);
  };

  const handleSaveSetting = (updatedSetting: Settings) => {
    // Update the setting in the app's settings array
    const updatedSettings = app.settings.map(s => 
      s.id === updatedSetting.id ? updatedSetting : s
    );
    onSave({ ...app, settings: updatedSettings });
    handleCloseSetting();
  };

  const handleEditDataCheck = (dataCheck: DataCheck) => {
    setEditingDataCheck(dataCheck);
    setEditingDataCheckOpen(true);
  };

  const handleCloseDataCheck = () => {
    setEditingDataCheckOpen(false);
    setEditingDataCheck(null);
  };

  const handleSaveDataCheck = (updatedDataCheck: DataCheck) => {
    // Update the data check in the app's dataChecks array
    const updatedDataChecks = app.dataChecks.map(dc => 
      dc.id === updatedDataCheck.id ? updatedDataCheck : dc
    );
    onSave({ ...app, dataChecks: updatedDataChecks });
    handleCloseDataCheck();
  };

  const handleSubmit = (values: App) => {
    onSave(values);
  };

  // Check if key is unique (excluding current app)
  const validateUniqueKey = (value: string) => {
    if (!value) return undefined;
    const isDuplicate = allApps.some(a => a.id !== app.id && a.key === value);
    return isDuplicate ? 'Key must be unique' : undefined;
  };

  return (
    <>
    <Box sx={{ mt: 3 }}>
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'grey.300', borderRadius: 1 }}>
        <CardHeader 
          title="App Information" 
          sx={{ 
            '& .MuiCardHeader-title': { 
              fontSize: '1rem',
              fontWeight: 500 
            },
            pb: 2,
            px: 2
          }} 
        />
        <CardContent sx={{ pt: 0, px: 2 }}>
          <Formik
          initialValues={app}
          validationSchema={singleAppValidationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, errors, touched, isSubmitting, setFieldValue }) => (
            <Form id="single-app-form">
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Field name="name">
                    {({ field, meta }: any) => (
                      <TextField
                        {...field}
                        fullWidth
                        size="small"
                        label="Application Name"
                        placeholder="Enter application name"
                        error={meta.touched && !!meta.error}
                        helperText={meta.touched && meta.error}
                        sx={{ 
                          '& .MuiInputBase-root': { fontSize: '0.875rem' },
                          '& .MuiInputLabel-root': { fontSize: '0.875rem' },
                          '& .MuiFormHelperText-root': { fontSize: '0.8rem' }
                        }}
                      />
                    )}
                  </Field>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Field name="key" validate={validateUniqueKey}>
                    {({ field, meta }: any) => (
                      <TextField
                        {...field}
                        fullWidth
                        size="small"
                        label="Application Key"
                        placeholder="evms, evcsa, evfc"
                        error={meta.touched && !!meta.error}
                        helperText={
                          meta.touched && meta.error 
                            ? meta.error 
                            : 'Lowercase letters, numbers, and hyphens only. Must be unique.'
                        }
                        sx={{ 
                          '& .MuiInputBase-root': { fontSize: '0.875rem' },
                          '& .MuiInputLabel-root': { fontSize: '0.875rem' },
                          '& .MuiFormHelperText-root': { fontSize: '0.7rem' }
                        }}
                        onChange={(e) => {
                          const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                          setFieldValue('key', value);
                        }}
                      />
                    )}
                  </Field>
                </Grid>

                <Grid item xs={12}>
                  <Field name="description">
                    {({ field, meta }: any) => (
                      <TextField
                        {...field}
                        fullWidth
                        size="small"
                        label="Description"
                        multiline
                        rows={2}
                        placeholder="Describe the purpose and functionality of this application"
                        error={meta.touched && !!meta.error}
                        helperText={meta.touched && meta.error}
                        sx={{ 
                          '& .MuiInputBase-root': { fontSize: '0.875rem' },
                          '& .MuiInputLabel-root': { fontSize: '0.875rem' },
                          '& .MuiFormHelperText-root': { fontSize: '0.8rem' }
                        }}
                        required
                      />
                    )}
                  </Field>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={values.status === 'Active'}
                        onChange={(e) => 
                          setFieldValue('status', e.target.checked ? 'Active' : 'Inactive')
                        }
                        color="primary"
                        size="small"
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>Status</Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ fontSize: '0.875rem' }}
                          color={values.status === 'Active' ? 'success.main' : 'error.main'}
                        >
                          ({values.status})
                        </Typography>
                      </Box>
                    }
                  />
                </Grid>

                {Object.keys(errors).length > 0 && (
                  <Grid item xs={12}>
                    <Alert severity="error" sx={{ py: 0.5 }}>
                      Please fix the validation errors above before saving.
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </Form>
          )}
        </Formik>
        </CardContent>
      </Card>
    </Box>

    {/* Settings Card */}
    <Box sx={{ mt: 3 }}>
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'grey.300', borderRadius: 1 }}>
        <CardHeader 
          title="Settings" 
          action={
            <Button 
              size="small" 
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => {/* TODO: Handle new setting */}}
            >
              New
            </Button>
          }
          sx={{ 
            '& .MuiCardHeader-title': { 
              fontSize: '1rem',
              fontWeight: 500 
            },
            '& .MuiCardHeader-action': {
              alignSelf: 'center',
              mt: 0,
              mr: 0
            },
            pb: 1,
            px: 2
          }} 
        />
        <CardContent sx={{ pt: 0, px: 2 }}>
          <DataGrid
            rows={(app.settings || []).map(s => ({
              ...s,
              handleMenuOpen: (e: React.MouseEvent<HTMLElement>, item: any) => handleMenuOpen(e, item, 'setting')
            }))}
            columns={settingsColumns(handleEditSetting)}
            autoHeight
            density="compact"
            disableRowSelectionOnClick
            pageSizeOptions={[5, 10]}
            sx={{
              fontSize: '0.8rem',
              '& .MuiDataGrid-columnHeaders': {
                fontSize: '0.8rem',
              },
            }}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 5 },
              },
            }}
          />
        </CardContent>
      </Card>
    </Box>

    {/* DataChecks Card */}
    <Box sx={{ mt: 3 }}>
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'grey.300', borderRadius: 1 }}>
        <CardHeader 
          title="Data Checks" 
          action={
            <Button 
              size="small" 
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => {/* TODO: Handle new data check */}}
            >
              New
            </Button>
          }
          sx={{ 
            '& .MuiCardHeader-title': { 
              fontSize: '1rem',
              fontWeight: 500 
            },
            '& .MuiCardHeader-action': {
              alignSelf: 'center',
              mt: 0,
              mr: 0
            },
            pb: 1,
            px: 2
          }} 
        />
        <CardContent sx={{ pt: 0, px: 2 }}>
          <DataGrid
            rows={[...(app.dataChecks || [])].sort((a, b) => a.sortOrder - b.sortOrder).map(dc => ({
              ...dc,
              handleMenuOpen: (e: React.MouseEvent<HTMLElement>, item: any) => handleMenuOpen(e, item, 'dataCheck')
            }))}
            columns={dataChecksColumns(handleEditDataCheck, handleMoveDataCheck)}
            autoHeight
            density="compact"
            disableRowSelectionOnClick
            pageSizeOptions={[5, 10]}
            sx={{
              fontSize: '0.8rem',
              '& .MuiDataGrid-columnHeaders': {
                fontSize: '0.8rem',
              },
            }}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 5 },
              },
            }}
          />
        </CardContent>
      </Card>
    </Box>

    {/* Tabs Card */}
    <Box sx={{ mt: 3 }}>
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'grey.300', borderRadius: 1 }}>
        <CardHeader 
          title="Tabs" 
          action={
            <Button 
              size="small" 
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => {/* TODO: Handle new tab */}}
            >
              New
            </Button>
          }
          sx={{ 
            '& .MuiCardHeader-title': { 
              fontSize: '1rem',
              fontWeight: 500 
            },
            '& .MuiCardHeader-action': {
              alignSelf: 'center',
              mt: 0,
              mr: 0
            },
            pb: 1,
            px: 2
          }} 
        />
        <CardContent sx={{ pt: 0, px: 2 }}>
          <DataGrid
            rows={[...(app.tabs || [])].sort((a, b) => a.sortOrder - b.sortOrder).map(t => ({
              ...t,
              handleMenuOpen: (e: React.MouseEvent<HTMLElement>, item: any) => handleMenuOpen(e, item, 'tab')
            }))}
            columns={tabsColumns(handleMoveTab, handleEditTab)}
            autoHeight
            getRowHeight={() => 'auto'}
            disableRowSelectionOnClick
            pageSizeOptions={[5, 10]}
            sx={{
              fontSize: '0.8rem',
              '& .MuiDataGrid-columnHeaders': {
                fontSize: '0.8rem',
              },
              '& .MuiDataGrid-cell': {
                py: 1,
                alignItems: 'flex-start',
              },
            }}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 5 },
              },
            }}
          />
        </CardContent>
      </Card>
    </Box>

    {/* Settings Edit Dialog */}
    <Dialog 
      open={editingSettingOpen} 
      onClose={handleCloseSetting}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Edit Setting</DialogTitle>
      <DialogContent>
        {editingSetting && (
          <Formik
            initialValues={editingSetting}
            validationSchema={Yup.object().shape({
              key: Yup.string().required('Key is required'),
              name: Yup.string().required('Name is required').max(50, 'Name must be 50 characters or less'),
              description: Yup.string().max(512, 'Description must be 512 characters or less'),
              value: Yup.string().required('Value is required').max(255, 'Value must be 255 characters or less'),
              type: Yup.string().oneOf(['string', 'number', 'boolean', 'json']).required('Type is required'),
              status: Yup.string().oneOf(['Active', 'Inactive']).required('Status is required'),
            })}
            onSubmit={handleSaveSetting}
          >
            {({ values, errors, touched, setFieldValue }) => (
              <Form>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12}>
                    <Field name="name">
                      {({ field, meta }: any) => (
                        <TextField
                          {...field}
                          fullWidth
                          size="small"
                          label="Name"
                          error={meta.touched && !!meta.error}
                          helperText={meta.touched && meta.error}
                          sx={{ 
                            '& .MuiInputBase-root': { fontSize: '0.875rem' },
                            '& .MuiInputLabel-root': { fontSize: '0.875rem' },
                            '& .MuiFormHelperText-root': { fontSize: '0.8rem' }
                          }}
                        />
                      )}
                    </Field>
                  </Grid>

                  <Grid item xs={12}>
                    <Field name="key">
                      {({ field, meta }: any) => (
                        <TextField
                          {...field}
                          fullWidth
                          size="small"
                          label="Key"
                          error={meta.touched && !!meta.error}
                          helperText={meta.touched && meta.error}
                          sx={{ 
                            '& .MuiInputBase-root': { fontSize: '0.875rem' },
                            '& .MuiInputLabel-root': { fontSize: '0.875rem' },
                            '& .MuiFormHelperText-root': { fontSize: '0.8rem' }
                          }}
                        />
                      )}
                    </Field>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Field name="type">
                      {({ field, meta }: any) => (
                        <TextField
                          {...field}
                          fullWidth
                          size="small"
                          label="Type"
                          select
                          SelectProps={{ native: true }}
                          error={meta.touched && !!meta.error}
                          helperText={meta.touched && meta.error}
                          sx={{ 
                            '& .MuiInputBase-root': { fontSize: '0.875rem' },
                            '& .MuiInputLabel-root': { fontSize: '0.875rem' },
                            '& .MuiFormHelperText-root': { fontSize: '0.8rem' }
                          }}
                        >
                          <option value="string">String</option>
                          <option value="number">Number</option>
                          <option value="boolean">Boolean</option>
                          <option value="json">JSON</option>
                        </TextField>
                      )}
                    </Field>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Field name="status">
                      {({ field, meta }: any) => (
                        <TextField
                          {...field}
                          fullWidth
                          size="small"
                          label="Status"
                          select
                          SelectProps={{ native: true }}
                          error={meta.touched && !!meta.error}
                          helperText={meta.touched && meta.error}
                          sx={{ 
                            '& .MuiInputBase-root': { fontSize: '0.875rem' },
                            '& .MuiInputLabel-root': { fontSize: '0.875rem' },
                            '& .MuiFormHelperText-root': { fontSize: '0.8rem' }
                          }}
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </TextField>
                      )}
                    </Field>
                  </Grid>

                  <Grid item xs={12}>
                    <Field name="value">
                      {({ field, meta }: any) => (
                        <TextField
                          {...field}
                          fullWidth
                          size="small"
                          label="Value"
                          error={meta.touched && !!meta.error}
                          helperText={meta.touched && meta.error}
                          sx={{ 
                            '& .MuiInputBase-root': { fontSize: '0.875rem' },
                            '& .MuiInputLabel-root': { fontSize: '0.875rem' },
                            '& .MuiFormHelperText-root': { fontSize: '0.8rem' }
                          }}
                        />
                      )}
                    </Field>
                  </Grid>

                  <Grid item xs={12}>
                    <Field name="description">
                      {({ field, meta }: any) => (
                        <TextField
                          {...field}
                          fullWidth
                          size="small"
                          label="Description"
                          multiline
                          rows={3}
                          error={meta.touched && !!meta.error}
                          helperText={meta.touched && meta.error}
                          sx={{ 
                            '& .MuiInputBase-root': { fontSize: '0.875rem' },
                            '& .MuiInputLabel-root': { fontSize: '0.875rem' },
                            '& .MuiFormHelperText-root': { fontSize: '0.8rem' }
                          }}
                        />
                      )}
                    </Field>
                  </Grid>
                </Grid>
                <DialogActions sx={{ mt: 2, px: 0 }}>
                  <Button onClick={handleCloseSetting} size="small">Cancel</Button>
                  <Button type="submit" variant="contained" size="small">Save</Button>
                </DialogActions>
              </Form>
            )}
          </Formik>
        )}
      </DialogContent>
    </Dialog>

    {/* DataCheck Edit Dialog */}
    <Dialog 
      open={editingDataCheckOpen} 
      onClose={handleCloseDataCheck}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Edit Data Check</DialogTitle>
      <DialogContent>
        {editingDataCheck && (
          <Formik
            initialValues={editingDataCheck}
            validationSchema={Yup.object().shape({
              name: Yup.string().required('Name is required').max(50, 'Name must be 50 characters or less'),
              key: Yup.string().required('Key is required'),
              description: Yup.string().max(512, 'Description must be 512 characters or less'),
              sqlSelect: Yup.string().required('SQL Select is required').max(2000, 'SQL must be 2000 characters or less'),
              sortOrder: Yup.number().required('Sort Order is required').min(1, 'Sort Order must be at least 1'),
              status: Yup.string().oneOf(['Active', 'Inactive']).required('Status is required'),
            })}
            onSubmit={handleSaveDataCheck}
          >
            {({ values, errors, touched, setFieldValue }) => (
              <Form>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12}>
                    <Field name="name">
                      {({ field, meta }: any) => (
                        <TextField
                          {...field}
                          fullWidth
                          size="small"
                          label="Name"
                          error={meta.touched && !!meta.error}
                          helperText={meta.touched && meta.error}
                          sx={{ 
                            '& .MuiInputBase-root': { fontSize: '0.875rem' },
                            '& .MuiInputLabel-root': { fontSize: '0.875rem' },
                            '& .MuiFormHelperText-root': { fontSize: '0.8rem' }
                          }}
                        />
                      )}
                    </Field>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Field name="key">
                      {({ field, meta }: any) => (
                        <TextField
                          {...field}
                          fullWidth
                          size="small"
                          label="Key"
                          error={meta.touched && !!meta.error}
                          helperText={meta.touched && meta.error}
                          sx={{ 
                            '& .MuiInputBase-root': { fontSize: '0.875rem' },
                            '& .MuiInputLabel-root': { fontSize: '0.875rem' },
                            '& .MuiFormHelperText-root': { fontSize: '0.8rem' }
                          }}
                        />
                      )}
                    </Field>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Field name="status">
                      {({ field, meta }: any) => (
                        <TextField
                          {...field}
                          fullWidth
                          size="small"
                          label="Status"
                          select
                          SelectProps={{ native: true }}
                          error={meta.touched && !!meta.error}
                          helperText={meta.touched && meta.error}
                          sx={{ 
                            '& .MuiInputBase-root': { fontSize: '0.875rem' },
                            '& .MuiInputLabel-root': { fontSize: '0.875rem' },
                            '& .MuiFormHelperText-root': { fontSize: '0.8rem' }
                          }}
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </TextField>
                      )}
                    </Field>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Field name="sortOrder">
                      {({ field, meta }: any) => (
                        <TextField
                          {...field}
                          fullWidth
                          size="small"
                          label="Sort Order"
                          type="number"
                          error={meta.touched && !!meta.error}
                          helperText={meta.touched && meta.error}
                          sx={{ 
                            '& .MuiInputBase-root': { fontSize: '0.875rem' },
                            '& .MuiInputLabel-root': { fontSize: '0.875rem' },
                            '& .MuiFormHelperText-root': { fontSize: '0.8rem' }
                          }}
                        />
                      )}
                    </Field>
                  </Grid>

                  <Grid item xs={12}>
                    <Field name="description">
                      {({ field, meta }: any) => (
                        <TextField
                          {...field}
                          fullWidth
                          size="small"
                          label="Description"
                          multiline
                          rows={2}
                          error={meta.touched && !!meta.error}
                          helperText={meta.touched && meta.error}
                          sx={{ 
                            '& .MuiInputBase-root': { fontSize: '0.875rem' },
                            '& .MuiInputLabel-root': { fontSize: '0.875rem' },
                            '& .MuiFormHelperText-root': { fontSize: '0.8rem' }
                          }}
                        />
                      )}
                    </Field>
                  </Grid>

                  <Grid item xs={12}>
                    <Field name="sqlSelect">
                      {({ field, meta }: any) => (
                        <TextField
                          {...field}
                          fullWidth
                          size="small"
                          label="SQL Select"
                          multiline
                          rows={4}
                          error={meta.touched && !!meta.error}
                          helperText={meta.touched && meta.error}
                          sx={{ 
                            '& .MuiInputBase-root': { fontSize: '0.875rem', fontFamily: 'monospace' },
                            '& .MuiInputLabel-root': { fontSize: '0.875rem' },
                            '& .MuiFormHelperText-root': { fontSize: '0.8rem' }
                          }}
                        />
                      )}
                    </Field>
                  </Grid>
                </Grid>
                <DialogActions sx={{ mt: 2, px: 0 }}>
                  <Button onClick={handleCloseDataCheck} size="small">Cancel</Button>
                  <Button type="submit" variant="contained" size="small">Save</Button>
                </DialogActions>
              </Form>
            )}
          </Formik>
        )}
      </DialogContent>
    </Dialog>

    {/* Tab Edit Dialog */}
    <Dialog 
      open={editingTabOpen} 
      onClose={handleCloseTab}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Edit Tab</DialogTitle>
      <DialogContent>
        {editingTab && (
          <Formik
            initialValues={editingTab}
            validationSchema={Yup.object().shape({
              name: Yup.string().required('Name is required').max(50, 'Name must be 50 characters or less'),
              key: Yup.string().required('Key is required').matches(/^[a-z0-9-]+$/, 'Key must be lowercase letters, numbers, and hyphens only'),
              description: Yup.string().max(512, 'Description must be 512 characters or less'),
              sortOrder: Yup.number().required('Sort Order is required').min(1, 'Sort Order must be at least 1'),
              status: Yup.string().oneOf(['Active', 'Inactive']).required('Status is required'),
            })}
            onSubmit={handleSaveTab}
          >
            {({ values, errors, touched, setFieldValue }) => (
              <Form>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12}>
                    <Field name="name">
                      {({ field, meta }: any) => (
                        <TextField
                          {...field}
                          fullWidth
                          size="small"
                          label="Name"
                          error={meta.touched && !!meta.error}
                          helperText={meta.touched && meta.error}
                          sx={{ 
                            '& .MuiInputBase-root': { fontSize: '0.875rem' },
                            '& .MuiInputLabel-root': { fontSize: '0.875rem' },
                            '& .MuiFormHelperText-root': { fontSize: '0.8rem' }
                          }}
                        />
                      )}
                    </Field>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Field name="key">
                      {({ field, meta }: any) => (
                        <TextField
                          {...field}
                          fullWidth
                          size="small"
                          label="Key"
                          error={meta.touched && !!meta.error}
                          helperText={meta.touched && meta.error}
                          sx={{ 
                            '& .MuiInputBase-root': { fontSize: '0.875rem' },
                            '& .MuiInputLabel-root': { fontSize: '0.875rem' },
                            '& .MuiFormHelperText-root': { fontSize: '0.8rem' }
                          }}
                        />
                      )}
                    </Field>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Field name="sortOrder">
                      {({ field, meta }: any) => (
                        <TextField
                          {...field}
                          fullWidth
                          size="small"
                          label="Sort Order"
                          type="number"
                          error={meta.touched && !!meta.error}
                          helperText={meta.touched && meta.error}
                          sx={{ 
                            '& .MuiInputBase-root': { fontSize: '0.875rem' },
                            '& .MuiInputLabel-root': { fontSize: '0.875rem' },
                            '& .MuiFormHelperText-root': { fontSize: '0.8rem' }
                          }}
                        />
                      )}
                    </Field>
                  </Grid>

                  <Grid item xs={12}>
                    <Field name="description">
                      {({ field, meta }: any) => (
                        <TextField
                          {...field}
                          fullWidth
                          size="small"
                          label="Description"
                          multiline
                          rows={2}
                          error={meta.touched && !!meta.error}
                          helperText={meta.touched && meta.error}
                          sx={{ 
                            '& .MuiInputBase-root': { fontSize: '0.875rem' },
                            '& .MuiInputLabel-root': { fontSize: '0.875rem' },
                            '& .MuiFormHelperText-root': { fontSize: '0.8rem' }
                          }}
                        />
                      )}
                    </Field>
                  </Grid>

                  <Grid item xs={12}>
                    <Field name="status">
                      {({ field, meta }: any) => (
                        <TextField
                          {...field}
                          fullWidth
                          size="small"
                          label="Status"
                          select
                          SelectProps={{ native: true }}
                          error={meta.touched && !!meta.error}
                          helperText={meta.touched && meta.error}
                          sx={{ 
                            '& .MuiInputBase-root': { fontSize: '0.875rem' },
                            '& .MuiInputLabel-root': { fontSize: '0.875rem' },
                            '& .MuiFormHelperText-root': { fontSize: '0.8rem' }
                          }}
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </TextField>
                      )}
                    </Field>
                  </Grid>
                </Grid>
                <DialogActions sx={{ mt: 2, px: 0 }}>
                  <Button onClick={handleCloseTab} size="small">Cancel</Button>
                  <Button type="submit" variant="contained" size="small">Save</Button>
                </DialogActions>
              </Form>
            )}
          </Formik>
        )}
      </DialogContent>
    </Dialog>

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
    </>
  );
}