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
import { DataCheck } from '../types/adminTypes';

interface DataChecksListProps {
  dataChecks: DataCheck[];
  onSave?: (dataChecks: DataCheck[]) => void;
  readOnly?: boolean;
  showNewDialog?: boolean;
  onCloseNewDialog?: () => void;
}

const dataCheckValidationSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  key: Yup.string().required('Key is required'),
  status: Yup.string().oneOf(['Active', 'Inactive']).required('Status is required'),
  sortOrder: Yup.number().required('Sort Order is required').min(1, 'Sort Order must be at least 1'),
  description: Yup.string(),
  sqlSelect: Yup.string()
});

const dataChecksColumns = (
  handleEditDataCheck: (dataCheck: DataCheck) => void, 
  handleMoveDataCheck: (dataCheckId: string, direction: 'up' | 'down') => void,
  handleDeleteDataCheck: (dataCheck: DataCheck) => void,
  handleToggleStatus: (dataCheck: DataCheck) => void,
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
        onClick={() => handleEditDataCheck(params.row)}
        sx={{ textAlign: 'left', fontSize: '0.875rem' }}
      >
        {params.value}
      </Link>
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
    renderCell: (params: any) => {
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

export default function DataChecksList({ dataChecks, onSave, readOnly = false, showNewDialog = false, onCloseNewDialog }: DataChecksListProps) {
  const [localDataChecks, setLocalDataChecks] = useState<DataCheck[]>(dataChecks);
  const [editingDataCheckOpen, setEditingDataCheckOpen] = useState(false);
  const [editingDataCheck, setEditingDataCheck] = useState<DataCheck | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [dataCheckToDelete, setDataCheckToDelete] = useState<DataCheck | null>(null);
  const [newDataCheckOpen, setNewDataCheckOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedDataCheck, setSelectedDataCheck] = useState<DataCheck | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, dataCheck: DataCheck) => {
    setAnchorEl(event.currentTarget);
    setSelectedDataCheck(dataCheck);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedDataCheck(null);
  };

  const handleMenuEdit = () => {
    if (selectedDataCheck) {
      handleEditDataCheck(selectedDataCheck);
    }
    handleMenuClose();
  };

  const handleMenuCopy = () => {
    if (selectedDataCheck) {
      console.log('Copy data check:', selectedDataCheck);
      // TODO: Implement copy functionality
    }
    handleMenuClose();
  };

  const handleMenuDelete = () => {
    if (selectedDataCheck) {
      handleDeleteDataCheck(selectedDataCheck);
    }
    handleMenuClose();
  };

  React.useEffect(() => {
    setLocalDataChecks(dataChecks);
  }, [dataChecks]);

  React.useEffect(() => {
    setNewDataCheckOpen(showNewDialog);
  }, [showNewDialog]);

  const handleEditDataCheck = (dataCheck: DataCheck) => {
    setEditingDataCheck(dataCheck);
    setEditingDataCheckOpen(true);
  };

  const handleSaveDataCheck = (values: DataCheck) => {
    const updatedDataChecks = localDataChecks.map(dc => 
      dc.id === values.id ? values : dc
    );
    setLocalDataChecks(updatedDataChecks);
    if (onSave) {
      onSave(updatedDataChecks);
    }
    setEditingDataCheckOpen(false);
    setEditingDataCheck(null);
  };

  const handleMoveDataCheck = (dataCheckId: string, direction: 'up' | 'down') => {
    const sortedDataChecks = [...localDataChecks].sort((a, b) => a.sortOrder - b.sortOrder);
    const currentIndex = sortedDataChecks.findIndex(dc => dc.id === dataCheckId);
    
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex < 0 || newIndex >= sortedDataChecks.length) return;
    
    // Swap positions
    [sortedDataChecks[currentIndex], sortedDataChecks[newIndex]] = 
    [sortedDataChecks[newIndex], sortedDataChecks[currentIndex]];
    
    // Recalculate sortOrder based on new positions
    const updatedDataChecks = sortedDataChecks.map((dc, index) => ({
      ...dc,
      sortOrder: index + 1
    }));
    
    setLocalDataChecks(updatedDataChecks);
    if (onSave) {
      onSave(updatedDataChecks);
    }
  };

  const handleDeleteDataCheck = (dataCheck: DataCheck) => {
    setDataCheckToDelete(dataCheck);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (dataCheckToDelete) {
      const updatedDataChecks = localDataChecks.filter(dc => dc.id !== dataCheckToDelete.id);
      setLocalDataChecks(updatedDataChecks);
      if (onSave) {
        onSave(updatedDataChecks);
      }
    }
    setDeleteConfirmOpen(false);
    setDataCheckToDelete(null);
  };

  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
    setDataCheckToDelete(null);
  };

  const handleCreateDataCheck = (values: Omit<DataCheck, 'id'>) => {
    const newDataCheck: DataCheck = {
      ...values,
      id: `dc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    const updatedDataChecks = [...localDataChecks, newDataCheck];
    setLocalDataChecks(updatedDataChecks);
    if (onSave) {
      onSave(updatedDataChecks);
    }
    setNewDataCheckOpen(false);
    if (onCloseNewDialog) {
      onCloseNewDialog();
    }
  };

  const handleCloseNewDialog = () => {
    setNewDataCheckOpen(false);
    if (onCloseNewDialog) {
      onCloseNewDialog();
    }
  };

  const handleToggleStatus = (dataCheck: DataCheck) => {
    const updatedDataChecks = localDataChecks.map(dc => 
      dc.id === dataCheck.id 
        ? { ...dc, status: dc.status === 'Active' ? 'Inactive' : 'Active' } as DataCheck
        : dc
    );
    setLocalDataChecks(updatedDataChecks);
    if (onSave) {
      onSave(updatedDataChecks);
    }
  };

  const sortedDataChecks = [...localDataChecks].sort((a, b) => a.sortOrder - b.sortOrder);
  const rowsWithMenuHandler = sortedDataChecks.map(dc => ({
    ...dc,
    handleMenuOpen
  }));

  return (
    <Box>
      <DataGrid
        rows={rowsWithMenuHandler}
        columns={dataChecksColumns(handleEditDataCheck, handleMoveDataCheck, handleDeleteDataCheck, handleToggleStatus, readOnly)}
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

      {/* Edit DataCheck Dialog */}
      <Dialog 
        open={editingDataCheckOpen} 
        onClose={() => setEditingDataCheckOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Audit Check</DialogTitle>
        {editingDataCheck && (
          <Formik
            initialValues={editingDataCheck}
            validationSchema={dataCheckValidationSchema}
            onSubmit={handleSaveDataCheck}
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
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        name="sortOrder"
                        label="Sort Order"
                        value={values.sortOrder}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.sortOrder && Boolean(errors.sortOrder)}
                        helperText={touched.sortOrder && errors.sortOrder}
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
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        size="small"
                        multiline
                        rows={3}
                        name="sqlSelect"
                        label="SQL Select"
                        value={values.sqlSelect}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        sx={{ fontFamily: 'monospace' }}
                      />
                    </Grid>
                  </Grid>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setEditingDataCheckOpen(false)}>Cancel</Button>
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
            Are you sure you want to delete this audit check?
          </Typography>
          {dataCheckToDelete && (
            <Box sx={{ 
              p: 2, 
              bgcolor: 'action.hover', 
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider'
            }}>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                {dataCheckToDelete.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {dataCheckToDelete.description || 'No description'}
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

      {/* New DataCheck Dialog */}
      <Dialog 
        open={newDataCheckOpen} 
        onClose={handleCloseNewDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Audit Check</DialogTitle>
        <Formik
          initialValues={{
            name: '',
            key: '',
            status: 'Active' as 'Active' | 'Inactive',
            sortOrder: localDataChecks.length + 1,
            description: '',
            sqlSelect: '',
            rules: [],
            isShared: false
          }}
          validationSchema={dataCheckValidationSchema}
          onSubmit={(values) => handleCreateDataCheck(values)}
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
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      name="sortOrder"
                      label="Sort Order"
                      value={values.sortOrder}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.sortOrder && Boolean(errors.sortOrder)}
                      helperText={touched.sortOrder && errors.sortOrder}
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
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      multiline
                      rows={3}
                      name="sqlSelect"
                      label="SQL Select"
                      value={values.sqlSelect}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      sx={{ fontFamily: 'monospace' }}
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
