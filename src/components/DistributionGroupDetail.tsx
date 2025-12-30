import React from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import { DataGrid, GridColDef, GridRowSelectionModel, GridSortModel } from '@mui/x-data-grid';
import { FormikProps } from 'formik';
import { Chip } from '@mui/material';

const SORT_MODEL_STORAGE_KEY = 'evomni_member_grid_sort';

interface DistributionGroupMember {
  id: string;
  lastName: string;
  firstName: string;
  memberRole: 'Manager' | 'Project Lead' | 'Scheduler';
  memberSource: 'p6' | 'custom';
  email: string;
}

interface DistributionGroup {
  id: string;
  name: string;
  key: string;
  project?: string;
  description?: string;
  status: 'Active' | 'Inactive';
  members: DistributionGroupMember[];
}

interface FormValues {
  name: string;
  key: string;
  project: string;
  projectLead: string;
  description: string;
  status: 'Active' | 'Inactive';
}

interface DistributionGroupDetailProps {
  selectedGroup: DistributionGroup | undefined;
  selectedGroupId: string | null;
  formik: FormikProps<FormValues>;
  handleNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleProjectChange: (e: any) => void;
  handleProjectLeadChange: (e: any) => void;
  handleNewGroup: () => void;
  handleCopy: () => void;
  handleSave: () => void;
  handleDelete: () => void;
  displayedMembers: DistributionGroupMember[];
  allMembers: DistributionGroupMember[];
  columns: GridColDef[];
  selectedRows: GridRowSelectionModel;
  handleMemberSelectionChange: (newSelection: GridRowSelectionModel) => void;
  memberFilter: 'Members' | 'All';
  setMemberFilter: (filter: 'Members' | 'All') => void;
  setNewMemberDialogOpen: (open: boolean) => void;
}

const DistributionGroupDetail: React.FC<DistributionGroupDetailProps> = ({
  selectedGroup,
  selectedGroupId,
  formik,
  handleNameChange,
  handleProjectChange,
  handleProjectLeadChange,
  handleNewGroup,
  handleCopy,
  handleSave,
  handleDelete,
  allMembers,
  displayedMembers,
  columns,
  selectedRows,
  handleMemberSelectionChange,
  memberFilter,
  setMemberFilter,
  setNewMemberDialogOpen
}) => {
  // Load saved sort model from localStorage
  const getSavedSortModel = (): GridSortModel => {
    try {
      const saved = localStorage.getItem(SORT_MODEL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading sort model:', error);
    }
    // Default sort
    return [{ field: 'memberRole', sort: 'asc' }];
  };

  const [sortModel, setSortModel] = React.useState<GridSortModel>(getSavedSortModel());

  // Save sort model to localStorage whenever it changes
  const handleSortModelChange = (newSortModel: GridSortModel) => {
    setSortModel(newSortModel);
    try {
      localStorage.setItem(SORT_MODEL_STORAGE_KEY, JSON.stringify(newSortModel));
      console.log('💾 Saved sort model:', newSortModel);
    } catch (error) {
      console.error('Error saving sort model:', error);
    }
  };

  if (!selectedGroup && selectedGroupId !== null) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Select a group to view details
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      flexGrow: 1, 
      display: 'flex', 
      flexDirection: 'column', 
      gap: 2,
      minHeight: 0
    }}>
      {/* Header with buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <Typography variant="h6">
          {selectedGroupId ? `Edit Group: ${selectedGroup?.name}` : 'New Group'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" size="small" onClick={handleNewGroup} startIcon={<AddIcon />}>
            New
          </Button>
          <Button variant="outlined" size="small" onClick={handleCopy} disabled={!selectedGroupId} startIcon={<ContentCopyIcon />}>
            Copy
          </Button>
          <Button variant="outlined" size="small" onClick={handleSave} startIcon={<SaveIcon />}>
            Save
          </Button>
          <Button variant="outlined" size="small" color="error" onClick={handleDelete} disabled={!selectedGroupId} startIcon={<DeleteIcon />}>
            Delete
          </Button>
        </Box>
      </Box>

      {/* Form */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          border: '1px solid',
          borderColor: 'divider',
          flexShrink: 0,
          '& .MuiInputBase-root': {
            fontSize: '0.875rem'
          },
          '& .MuiInputLabel-root': {
            fontSize: '0.875rem'
          },
          '& .MuiFormHelperText-root': {
            fontSize: '0.75rem'
          }
        }}
      >
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Distribution Group Info
        </Typography>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={2}>
            {/* Row 1: Project and Project Lead */}
            <Grid item xs={6}>
              <FormControl
                size="small"
                fullWidth
                error={formik.touched.project && Boolean(formik.errors.project)}
                sx={{
                  '& .MuiInputLabel-root': {
                    fontSize: '0.75rem'
                  },
                  '& .MuiSelect-select': {
                    fontSize: '0.75rem'
                  }
                }}
              >
                <InputLabel id="project-label">Project *</InputLabel>
                <Select
                  labelId="project-label"
                  label="Project *"
                  name="project"
                  value={formik.values.project}
                  onChange={handleProjectChange}
                  onBlur={formik.handleBlur}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        '& .MuiMenuItem-root': {
                          fontSize: '0.75rem'
                        }
                      }
                    }
                  }}
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  <MenuItem value="EM">EM</MenuItem>
                  <MenuItem value="CAP-1">CAP-1</MenuItem>
                  <MenuItem value="CAP-2">CAP-2</MenuItem>
                  <MenuItem value="CAP-3">CAP-3</MenuItem>
                  <MenuItem value="X-326">X-326</MenuItem>
                  <MenuItem value="X-333">X-333</MenuItem>
                </Select>
                {formik.touched.project && formik.errors.project && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75, fontSize: '0.65rem' }}>
                    {formik.errors.project}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={6}>
              <FormControl
                size="small"
                fullWidth
                error={formik.touched.projectLead && Boolean(formik.errors.projectLead)}
                sx={{
                  '& .MuiInputLabel-root': {
                    fontSize: '0.75rem'
                  },
                  '& .MuiSelect-select': {
                    fontSize: '0.75rem'
                  }
                }}
              >
                <InputLabel id="project-lead-label">Project Lead *</InputLabel>
                <Select
                  labelId="project-lead-label"
                  label="Project Lead *"
                  name="projectLead"
                  value={formik.values.projectLead}
                  onChange={handleProjectLeadChange}
                  onBlur={formik.handleBlur}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        '& .MuiMenuItem-root': {
                          fontSize: '0.75rem'
                        }
                      }
                    }
                  }}
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  {allMembers
                    .filter(member => member.memberRole === 'Project Lead')
                    .map(member => (
                      <MenuItem key={member.id} value={member.id}>
                        {member.lastName}, {member.firstName}
                      </MenuItem>
                    ))}
                </Select>
                {formik.touched.projectLead && formik.errors.projectLead && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75, fontSize: '0.65rem' }}>
                    {formik.errors.projectLead}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* Row 2: Group Name and Key */}
            <Grid item xs={6}>
              <TextField
                size="small"
                fullWidth
                label="Group Name"
                name="name"
                required
                value={formik.values.name}
                onChange={handleNameChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                sx={{
                  '& .MuiInputBase-input': {
                    fontSize: '0.75rem'
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '0.75rem'
                  },
                  '& .MuiFormHelperText-root': {
                    fontSize: '0.65rem'
                  }
                }}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                size="small"
                fullWidth
                label="Key"
                name="key"
                value={formik.values.key}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.key && Boolean(formik.errors.key)}
                helperText={formik.touched.key && formik.errors.key}
                disabled
                sx={{
                  '& .MuiInputBase-input': {
                    fontSize: '0.75rem'
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '0.75rem'
                  },
                  '& .MuiFormHelperText-root': {
                    fontSize: '0.65rem'
                  },
                  '& .MuiInputBase-input.Mui-disabled': {
                    WebkitTextFillColor: 'rgba(0, 0, 0, 0.6)'
                  }
                }}
              />
            </Grid>

            {/* Row 3: Description */}
            <Grid item xs={12}>
              <TextField
                size="small"
                fullWidth
                label="Description"
                name="description"
                required
                multiline
                rows={3}
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
                sx={{
                  '& .MuiInputBase-input': {
                    fontSize: '0.75rem'
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '0.75rem'
                  },
                  '& .MuiFormHelperText-root': {
                    fontSize: '0.65rem'
                  }
                }}
              />
            </Grid>

            {/* Status - full width row below */}
            <Grid item xs={12}>
              <ToggleButtonGroup
                value={formik.values.status}
                exclusive
                onChange={(e, newStatus) => {
                  if (newStatus !== null) {
                    formik.setFieldValue('status', newStatus);
                  }
                }}
                size="small"
                sx={{
                  '& .MuiToggleButton-root': {
                    fontSize: '0.75rem',
                    padding: '4px 12px'
                  }
                }}
              >
                <ToggleButton 
                  value="Active"
                  sx={{
                    '&.Mui-selected': {
                      backgroundColor: '#4caf50',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: '#45a049'
                      }
                    }
                  }}
                >
                  Active
                </ToggleButton>
                <ToggleButton 
                  value="Inactive"
                  sx={{
                    '&.Mui-selected': {
                      backgroundColor: '#f44336',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: '#da190b'
                      }
                    }
                  }}
                >
                  Inactive
                </ToggleButton>
              </ToggleButtonGroup>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Members DataGrid - Only show when editing existing group */}
      {selectedGroupId && (
        <Paper
          elevation={0}
          sx={{
            flexGrow: 1,
            flexShrink: 1,
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid',
            borderColor: 'divider',
            minHeight: 0
          }}
        >
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
            <Typography variant="subtitle1">Distribution Group Members</Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <ToggleButtonGroup
                value={memberFilter}
                exclusive
                onChange={(e, newFilter) => {
                  if (newFilter !== null) {
                    setMemberFilter(newFilter);
                  }
                }}
                size="small"
                sx={{
                  '& .MuiToggleButton-root': {
                    fontSize: '0.75rem',
                    padding: '2px 8px'
                  }
                }}
              >
                <ToggleButton value="All">All</ToggleButton>
                <ToggleButton value="Members">Members</ToggleButton>
              </ToggleButtonGroup>
              <Button
                variant="contained"
                size="small"
                onClick={() => setNewMemberDialogOpen(true)}
                startIcon={<PersonAddIcon />}
                sx={{ fontSize: '0.75rem', padding: '2px 8px' }}
              >
                New Member
              </Button>
            </Box>
          </Box>
          <Box sx={{ 
            flexGrow: 1,
            minHeight: 0,
            width: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <DataGrid
              rows={displayedMembers}
              columns={columns}
              checkboxSelection
              disableRowSelectionOnClick
              density="compact"
              pagination
              rowSelectionModel={selectedRows}
              onRowSelectionModelChange={handleMemberSelectionChange}
              sortModel={sortModel}
              onSortModelChange={handleSortModelChange}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 20 }
                }
              }}
              pageSizeOptions={[10, 20, 50, 100]}
              sx={{
                border: 'none',
                flex: 1,
                minHeight: 0,
                '& .MuiDataGrid-virtualScroller': {
                  minHeight: '200px'
                },
                '& .MuiDataGrid-footerContainer': {
                  minHeight: '52px',
                  borderTop: '1px solid',
                  borderColor: 'divider'
                },
                '& .MuiDataGrid-cell': {
                  borderColor: 'divider',
                  fontSize: '0.75rem'
                },
                '& .MuiDataGrid-columnHeaders': {
                  borderColor: 'divider',
                  fontSize: '0.75rem'
                }
              }}
            />
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default DistributionGroupDetail;
