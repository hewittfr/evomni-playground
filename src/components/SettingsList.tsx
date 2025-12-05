import React, { useState } from 'react';
import { 
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Link,
  Chip,
  IconButton,
  Typography,
  FormControlLabel,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { 
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  ContentCopy as ContentCopyIcon
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Settings } from '../types/adminTypes';

interface SettingsListProps {
  settings: Settings[];
  onSave?: (settings: Settings[]) => void;
  readOnly?: boolean;
  showNewDialog?: boolean;
  onCloseNewDialog?: () => void;
}

const settingValidationSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  key: Yup.string().required('Key is required'),
  type: Yup.string().oneOf(['string', 'number', 'boolean', 'json']).required('Type is required'),
  status: Yup.string().oneOf(['Active', 'Inactive']).required('Status is required'),
  description: Yup.string(),
  value: Yup.mixed().required('Value is required')
});

const settingsColumns = (
  handleEditSetting: (setting: Settings) => void, 
  handleDeleteSetting: (setting: Settings) => void,
  handleToggleStatus: (setting: Settings) => void,
  readOnly: boolean
): GridColDef[] => [
  { 
    field: 'name', 
    headerName: 'Name', 
    width: 200,
    renderCell: (params) => (
      <Link
        component="button"
        variant="body2"
        onClick={() => handleEditSetting(params.row)}
        sx={{ textAlign: 'left', fontSize: '0.875rem' }}
      >
        {params.value}
      </Link>
    )
  },
  { field: 'description', headerName: 'Description', width: 450 },
  { field: 'key', headerName: 'Key', width: 150 },
  { field: 'value', headerName: 'Value', width: 200, flex: 1 },
  { 
    field: 'status', 
    headerName: 'Status', 
    width: 150,
    sortable: false,
    renderCell: (params) => {
      const isActive = params.value === 'Active';
      return (
        <ToggleButtonGroup
          value={params.value}
          exclusive
          onChange={(e, newValue) => {
            if (newValue !== null) {
              e.stopPropagation();
              handleToggleStatus(params.row);
            }
          }}
          size="small"
          sx={{
            height: '24px',
          }}
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
      );
    }
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

export default function SettingsList({ settings, onSave, readOnly = false, showNewDialog = false, onCloseNewDialog }: SettingsListProps) {
  const [localSettings, setLocalSettings] = useState<Settings[]>(settings);
  const [editingSettingOpen, setEditingSettingOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<Settings | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [settingToDelete, setSettingToDelete] = useState<Settings | null>(null);
  const [newSettingOpen, setNewSettingOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedSetting, setSelectedSetting] = useState<Settings | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, setting: Settings) => {
    setAnchorEl(event.currentTarget);
    setSelectedSetting(setting);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedSetting(null);
  };

  const handleMenuEdit = () => {
    if (selectedSetting) {
      handleEditSetting(selectedSetting);
    }
    handleMenuClose();
  };

  const handleMenuCopy = () => {
    if (selectedSetting) {
      console.log('Copy setting:', selectedSetting);
      // TODO: Implement copy functionality
    }
    handleMenuClose();
  };

  const handleMenuDelete = () => {
    if (selectedSetting) {
      handleDeleteSetting(selectedSetting);
    }
    handleMenuClose();
  };

  React.useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  React.useEffect(() => {
    setNewSettingOpen(showNewDialog);
  }, [showNewDialog]);

  const handleEditSetting = (setting: Settings) => {
    setEditingSetting(setting);
    setEditingSettingOpen(true);
  };

  const handleSaveSetting = (values: Settings) => {
    const updatedSettings = localSettings.map(s => 
      s.id === values.id ? values : s
    );
    setLocalSettings(updatedSettings);
    if (onSave) {
      onSave(updatedSettings);
    }
    setEditingSettingOpen(false);
    setEditingSetting(null);
  };

  const handleDeleteSetting = (setting: Settings) => {
    setSettingToDelete(setting);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (settingToDelete) {
      const updatedSettings = localSettings.filter(s => s.id !== settingToDelete.id);
      setLocalSettings(updatedSettings);
      if (onSave) {
        onSave(updatedSettings);
      }
    }
    setDeleteConfirmOpen(false);
    setSettingToDelete(null);
  };

  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
    setSettingToDelete(null);
  };

  const handleCreateSetting = (values: Omit<Settings, 'id'>) => {
    const newSetting: Settings = {
      ...values,
      id: `setting-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    const updatedSettings = [...localSettings, newSetting];
    setLocalSettings(updatedSettings);
    if (onSave) {
      onSave(updatedSettings);
    }
    setNewSettingOpen(false);
    if (onCloseNewDialog) {
      onCloseNewDialog();
    }
  };

  const handleCloseNewDialog = () => {
    setNewSettingOpen(false);
    if (onCloseNewDialog) {
      onCloseNewDialog();
    }
  };

  const handleToggleStatus = (setting: Settings) => {
    const updatedSettings = localSettings.map(s => 
      s.id === setting.id 
        ? { ...s, status: s.status === 'Active' ? 'Inactive' : 'Active' } as Settings
        : s
    );
    setLocalSettings(updatedSettings);
    if (onSave) {
      onSave(updatedSettings);
    }
  };

  const rowsWithMenuHandler = localSettings.map(s => ({
    ...s,
    handleMenuOpen
  }));

  return (
    <Box>
      <DataGrid
        rows={rowsWithMenuHandler}
        columns={settingsColumns(handleEditSetting, handleDeleteSetting, handleToggleStatus, readOnly)}
        autoHeight
        disableRowSelectionOnClick
        hideFooter
        density="compact"
        sx={{
          '& .MuiDataGrid-cell': {
            fontSize: '0.875rem'
          }
        }}
      />

      {/* Edit Setting Dialog */}
      <Dialog 
        open={editingSettingOpen} 
        onClose={() => setEditingSettingOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Setting</DialogTitle>
        {editingSetting && (
          <Formik
            initialValues={editingSetting}
            validationSchema={settingValidationSchema}
            onSubmit={handleSaveSetting}
          >
            {({ values, errors, touched, handleChange, handleBlur }) => (
              <Form>
                <DialogContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        size="small"
                        name="name"
                        label="Name"
                        value={values.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.name && Boolean(errors.name)}
                        helperText={touched.name && errors.name}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        size="small"
                        name="key"
                        label="Key"
                        value={values.key}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.key && Boolean(errors.key)}
                        helperText={touched.key && errors.key}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        size="small"
                        select
                        name="type"
                        label="Type"
                        value={values.type}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.type && Boolean(errors.type)}
                        helperText={touched.type && errors.type}
                        SelectProps={{ native: true }}
                      >
                        <option value="string">String</option>
                        <option value="number">Number</option>
                        <option value="boolean">Boolean</option>
                        <option value="json">JSON</option>
                      </TextField>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        size="small"
                        select
                        name="status"
                        label="Status"
                        value={values.status}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.status && Boolean(errors.status)}
                        helperText={touched.status && errors.status}
                        SelectProps={{ native: true }}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </TextField>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        size="small"
                        name="value"
                        label="Value"
                        value={values.value}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.value && Boolean(errors.value)}
                        helperText={touched.value && errors.value}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        size="small"
                        multiline
                        rows={2}
                        name="description"
                        label="Description"
                        value={values.description}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                    </Grid>
                  </Grid>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setEditingSettingOpen(false)}>Cancel</Button>
                  <Button type="submit" variant="contained">Save</Button>
                </DialogActions>
              </Form>
            )}
          </Formik>
        )}
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteConfirmOpen} 
        onClose={cancelDelete}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to delete this setting?
          </Typography>
          {settingToDelete && (
            <Box sx={{ 
              p: 2, 
              bgcolor: 'action.hover', 
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider'
            }}>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                {settingToDelete.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {settingToDelete.description || 'No description'}
              </Typography>
            </Box>
          )}
          <Typography variant="body2" color="error" sx={{ mt: 2, fontWeight: 500 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={cancelDelete} variant="outlined">
            Cancel
          </Button>
          <Button onClick={confirmDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* New Setting Dialog */}
      <Dialog 
        open={newSettingOpen} 
        onClose={handleCloseNewDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Setting</DialogTitle>
        <Formik
          initialValues={{
            name: '',
            key: '',
            type: 'string' as 'string' | 'number' | 'boolean' | 'json',
            status: 'Active' as 'Active' | 'Inactive',
            value: '',
            description: ''
          }}
          validationSchema={settingValidationSchema}
          onSubmit={(values) => handleCreateSetting(values)}
        >
          {({ values, errors, touched, handleChange, handleBlur }) => (
            <Form>
              <DialogContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      size="small"
                      name="name"
                      label="Name"
                      value={values.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.name && Boolean(errors.name)}
                      helperText={touched.name && errors.name}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      size="small"
                      name="key"
                      label="Key"
                      value={values.key}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.key && Boolean(errors.key)}
                      helperText={touched.key && errors.key}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      size="small"
                      select
                      name="type"
                      label="Type"
                      value={values.type}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.type && Boolean(errors.type)}
                      helperText={touched.type && errors.type}
                      SelectProps={{ native: true }}
                    >
                      <option value="string">String</option>
                      <option value="number">Number</option>
                      <option value="boolean">Boolean</option>
                      <option value="json">JSON</option>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      size="small"
                      select
                      name="status"
                      label="Status"
                      value={values.status}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.status && Boolean(errors.status)}
                      helperText={touched.status && errors.status}
                      SelectProps={{ native: true }}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </TextField>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      name="value"
                      label="Value"
                      value={values.value}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.value && Boolean(errors.value)}
                      helperText={touched.value && errors.value}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      multiline
                      rows={2}
                      name="description"
                      label="Description"
                      value={values.description}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseNewDialog}>Cancel</Button>
                <Button type="submit" variant="contained">Create</Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
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
    </Box>
  );
}
