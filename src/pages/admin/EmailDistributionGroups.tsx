import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  InputAdornment,
  Grid,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  Breadcrumbs,
  Link,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import GroupIcon from '@mui/icons-material/Group';
import { DataGrid, GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import { useFormik } from 'formik';
import * as Yup from 'yup';

// Interfaces
interface DistributionGroupMember {
  id: string;
  lastName: string;
  firstName: string;
  memberType: 'Manager' | 'Project Lead' | 'Scheduler';
  email: string;
}

interface DistributionGroup {
  id: string;
  name: string;
  key: string;
  application?: string;
  description?: string;
  status: 'Active' | 'Inactive';
  members: DistributionGroupMember[];
}

// Mock data
const mockGroups: DistributionGroup[] = [
  {
    id: '1',
    name: 'Project Managers',
    key: 'project-managers',
    application: 'EM',
    description: 'All project managers',
    status: 'Active',
    members: [
      { id: 'm1', lastName: 'Smith', firstName: 'John', memberType: 'Manager', email: 'john.smith@example.com' },
      { id: 'm2', lastName: 'Johnson', firstName: 'Sarah', memberType: 'Project Lead', email: 'sarah.johnson@example.com' },
      { id: 'm3', lastName: 'Williams', firstName: 'Michael', memberType: 'Scheduler', email: 'michael.williams@example.com' },
      { id: 'm4', lastName: 'Brown', firstName: 'Emily', memberType: 'Scheduler', email: 'emily.brown@example.com' },
      { id: 'm5', lastName: 'Davis', firstName: 'David', memberType: 'Scheduler', email: 'david.davis@example.com' },
      { id: 'm6', lastName: 'Miller', firstName: 'Jennifer', memberType: 'Scheduler', email: 'jennifer.miller@example.com' },
      { id: 'm7', lastName: 'Wilson', firstName: 'Robert', memberType: 'Scheduler', email: 'robert.wilson@example.com' },
      { id: 'm8', lastName: 'Moore', firstName: 'Linda', memberType: 'Scheduler', email: 'linda.moore@example.com' },
      { id: 'm9', lastName: 'Taylor', firstName: 'James', memberType: 'Scheduler', email: 'james.taylor@example.com' },
      { id: 'm10', lastName: 'Anderson', firstName: 'Mary', memberType: 'Scheduler', email: 'mary.anderson@example.com' },
      { id: 'm11', lastName: 'Thomas', firstName: 'Christopher', memberType: 'Scheduler', email: 'christopher.thomas@example.com' },
      { id: 'm12', lastName: 'Jackson', firstName: 'Patricia', memberType: 'Scheduler', email: 'patricia.jackson@example.com' }
    ]
  },
  {
    id: '2',
    name: 'Project Leads',
    key: 'project-leads',
    application: 'CAP-1',
    description: 'Technical project leads',
    status: 'Active',
    members: [
      { id: 'm13', lastName: 'White', firstName: 'Daniel', memberType: 'Manager', email: 'daniel.white@example.com' },
      { id: 'm14', lastName: 'Harris', firstName: 'Jessica', memberType: 'Project Lead', email: 'jessica.harris@example.com' },
      { id: 'm15', lastName: 'Martin', firstName: 'Matthew', memberType: 'Scheduler', email: 'matthew.martin@example.com' },
      { id: 'm16', lastName: 'Thompson', firstName: 'Ashley', memberType: 'Scheduler', email: 'ashley.thompson@example.com' },
      { id: 'm17', lastName: 'Garcia', firstName: 'Joshua', memberType: 'Scheduler', email: 'joshua.garcia@example.com' },
      { id: 'm18', lastName: 'Martinez', firstName: 'Amanda', memberType: 'Scheduler', email: 'amanda.martinez@example.com' },
      { id: 'm19', lastName: 'Robinson', firstName: 'Andrew', memberType: 'Scheduler', email: 'andrew.robinson@example.com' },
      { id: 'm20', lastName: 'Clark', firstName: 'Stephanie', memberType: 'Scheduler', email: 'stephanie.clark@example.com' },
      { id: 'm21', lastName: 'Rodriguez', firstName: 'Kevin', memberType: 'Scheduler', email: 'kevin.rodriguez@example.com' },
      { id: 'm22', lastName: 'Lewis', firstName: 'Nicole', memberType: 'Scheduler', email: 'nicole.lewis@example.com' },
      { id: 'm23', lastName: 'Lee', firstName: 'Brian', memberType: 'Scheduler', email: 'brian.lee@example.com' }
    ]
  },
  {
    id: '3',
    name: 'Schedulers Team',
    key: 'schedulers-team',
    application: 'CAP-2',
    description: 'Project scheduling team',
    status: 'Active',
    members: [
      { id: 'm24', lastName: 'Walker', firstName: 'Ryan', memberType: 'Manager', email: 'ryan.walker@example.com' },
      { id: 'm25', lastName: 'Hall', firstName: 'Michelle', memberType: 'Project Lead', email: 'michelle.hall@example.com' },
      { id: 'm26', lastName: 'Allen', firstName: 'Brandon', memberType: 'Scheduler', email: 'brandon.allen@example.com' },
      { id: 'm27', lastName: 'Young', firstName: 'Kimberly', memberType: 'Scheduler', email: 'kimberly.young@example.com' },
      { id: 'm28', lastName: 'Hernandez', firstName: 'Tyler', memberType: 'Scheduler', email: 'tyler.hernandez@example.com' },
      { id: 'm29', lastName: 'King', firstName: 'Amy', memberType: 'Scheduler', email: 'amy.king@example.com' },
      { id: 'm30', lastName: 'Wright', firstName: 'Justin', memberType: 'Scheduler', email: 'justin.wright@example.com' },
      { id: 'm31', lastName: 'Lopez', firstName: 'Rebecca', memberType: 'Scheduler', email: 'rebecca.lopez@example.com' },
      { id: 'm32', lastName: 'Hill', firstName: 'Aaron', memberType: 'Scheduler', email: 'aaron.hill@example.com' },
      { id: 'm33', lastName: 'Scott', firstName: 'Laura', memberType: 'Scheduler', email: 'laura.scott@example.com' },
      { id: 'm34', lastName: 'Green', firstName: 'Samuel', memberType: 'Scheduler', email: 'samuel.green@example.com' }
    ]
  },
  {
    id: '4',
    name: 'Executive Team',
    key: 'executive-team',
    application: 'X-326',
    description: 'Executive management',
    status: 'Inactive',
    members: [
      { id: 'm35', lastName: 'Adams', firstName: 'Jonathan', memberType: 'Manager', email: 'jonathan.adams@example.com' },
      { id: 'm36', lastName: 'Baker', firstName: 'Rachel', memberType: 'Project Lead', email: 'rachel.baker@example.com' },
      { id: 'm37', lastName: 'Gonzalez', firstName: 'Nathan', memberType: 'Scheduler', email: 'nathan.gonzalez@example.com' },
      { id: 'm38', lastName: 'Nelson', firstName: 'Megan', memberType: 'Scheduler', email: 'megan.nelson@example.com' },
      { id: 'm39', lastName: 'Carter', firstName: 'Eric', memberType: 'Scheduler', email: 'eric.carter@example.com' },
      { id: 'm40', lastName: 'Mitchell', firstName: 'Katherine', memberType: 'Scheduler', email: 'katherine.mitchell@example.com' },
      { id: 'm41', lastName: 'Perez', firstName: 'Jason', memberType: 'Scheduler', email: 'jason.perez@example.com' },
      { id: 'm42', lastName: 'Roberts', firstName: 'Angela', memberType: 'Scheduler', email: 'angela.roberts@example.com' },
      { id: 'm43', lastName: 'Turner', firstName: 'Adam', memberType: 'Scheduler', email: 'adam.turner@example.com' },
      { id: 'm44', lastName: 'Phillips', firstName: 'Heather', memberType: 'Scheduler', email: 'heather.phillips@example.com' },
      { id: 'm45', lastName: 'Campbell', firstName: 'Jeremy', memberType: 'Scheduler', email: 'jeremy.campbell@example.com' }
    ]
  }
];

// Validation schema
const validationSchema = Yup.object({
  name: Yup.string()
    .required('Group name is required')
    .matches(/^[a-zA-Z0-9_\- ]+$/, 'Only alphanumeric characters, underscores, hyphens, and spaces allowed'),
  key: Yup.string()
    .required('Key is required')
    .matches(/^[a-z0-9-]+$/, 'Key must be lowercase with hyphens only'),
  application: Yup.string().required('Application is required'),
  description: Yup.string().required('Description is required'),
  status: Yup.string().required('Status is required')
});

const EmailDistributionGroups: React.FC = () => {
  const [groups, setGroups] = useState<DistributionGroup[]>(mockGroups);
  const [searchText, setSearchText] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(mockGroups[0]?.id || null);
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>([]);
  const [memberFilter, setMemberFilter] = useState<'Members' | 'All'>('All');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);

  const selectedGroup = groups.find(g => g.id === selectedGroupId);

  // Formik form
  const formik = useFormik({
    initialValues: {
      name: '',
      key: '',
      application: '',
      description: '',
      status: 'Inactive' as 'Active' | 'Inactive'
    },
    validationSchema,
    onSubmit: (values) => {
      if (selectedGroupId) {
        // Update existing group
        setGroups(groups.map(g => 
          g.id === selectedGroupId 
            ? {
                ...g,
                name: values.name,
                key: values.key,
                application: values.application,
                description: values.description,
                status: values.status
              }
            : g
        ));
      } else {
        // Create new group
        const newGroup: DistributionGroup = {
          id: `${Date.now()}`,
          name: values.name,
          key: values.key,
          application: values.application,
          description: values.description,
          status: values.status,
          members: []
        };
        setGroups([...groups, newGroup]);
        setSelectedGroupId(newGroup.id);
      }
    }
  });

  // Initialize form when selected group changes
  useEffect(() => {
    if (selectedGroup) {
      formik.setValues({
        name: selectedGroup.name,
        key: selectedGroup.key,
        application: selectedGroup.application || '',
        description: selectedGroup.description || '',
        status: selectedGroup.status
      });
      // Initialize selected rows with current group members
      setSelectedRows(selectedGroup.members.map(m => m.id));
    }
  }, [selectedGroupId]);

  // Auto-generate key from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    formik.setFieldValue('name', name);
    
    // Auto-generate key: lowercase, replace spaces with hyphens, remove invalid chars
    const generatedKey = name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    
    // Prefix with application if selected
    const application = formik.values.application;
    const finalKey = application ? `${application.toLowerCase()}-${generatedKey}` : generatedKey;
    formik.setFieldValue('key', finalKey);
  };

  // Handle application change and update key
  const handleApplicationChange = (e: any) => {
    const application = e.target.value;
    formik.setFieldValue('application', application);
    
    // Regenerate key with new application prefix
    const name = formik.values.name;
    const generatedKey = name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    
    const finalKey = application ? `${application.toLowerCase()}-${generatedKey}` : generatedKey;
    formik.setFieldValue('key', finalKey);
  };

  // Handle member selection changes
  const handleMemberSelectionChange = (newSelection: GridRowSelectionModel) => {
    setSelectedRows(newSelection);
    
    // Update the group's members based on selection
    if (selectedGroupId) {
      const allMembers = groups.flatMap(g => g.members);
      const currentGroupMembers = selectedGroup?.members || [];
      const selectedMembers = allMembers.filter(member => newSelection.includes(member.id));
      
      // Merge selected members with existing members to avoid removing unchecked ones
      const updatedMembers = [...currentGroupMembers];
      
      selectedMembers.forEach(member => {
        if (!updatedMembers.find(m => m.id === member.id)) {
          updatedMembers.push(member);
        }
      });
      
      setGroups(groups.map(g => 
        g.id === selectedGroupId 
          ? { ...g, members: updatedMembers }
          : g
      ));
    }
  };

  const handleNewGroup = () => {
    setSelectedGroupId(null);
    formik.resetForm({
      values: {
        name: '',
        key: '',
        application: '',
        description: '',
        status: 'Inactive'
      }
    });
  };

  const handleCopy = () => {
    setCopyDialogOpen(true);
  };

  const confirmCopy = () => {
    if (selectedGroup) {
      // Create a copy of the group with all members
      const newGroup: DistributionGroup = {
        id: `${Date.now()}`,
        name: `Copy of ${selectedGroup.name}`,
        key: `copy-of-${selectedGroup.key}`,
        application: selectedGroup.application,
        description: selectedGroup.description,
        status: selectedGroup.status,
        members: [...selectedGroup.members]
      };
      setGroups([...groups, newGroup]);
      setSelectedGroupId(newGroup.id);
    }
    setCopyDialogOpen(false);
  };

  const cancelCopy = () => {
    setCopyDialogOpen(false);
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedGroupId) {
      setGroups(groups.filter(g => g.id !== selectedGroupId));
      setSelectedGroupId(groups[0]?.id || null);
    }
    setDeleteDialogOpen(false);
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
  };

  const handleSave = () => {
    formik.handleSubmit();
  };

  // DataGrid columns
  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Name (Last, First)',
      flex: 1,
      renderCell: (params) => {
        const firstName = params.row.firstName;
        const lastName = params.row.lastName;
        const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`;
        
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar 
              sx={{ 
                width: 28, 
                height: 28, 
                fontSize: '0.75rem',
                borderRadius: 1,
                bgcolor: 'primary.main'
              }}
            >
              {initials}
            </Avatar>
            <span>{`${lastName}, ${firstName}`}</span>
          </Box>
        );
      }
    },
    {
      field: 'memberType',
      headerName: 'Member Type',
      flex: 1,
      renderCell: (params) => {
        const type = params.value as string;
        let color: 'info' | 'success' | 'warning' = 'warning';
        
        if (type === 'Manager') {
          color = 'info';
        } else if (type === 'Project Lead') {
          color = 'success';
        } else if (type === 'Scheduler') {
          color = 'warning';
        }
        
        return <Chip label={type} color={color} size="small" />;
      }
    },
    {
      field: 'email',
      headerName: 'Email Address',
      flex: 1
    }
  ];

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // Get members to display based on filter
  const allMembers = selectedGroup?.members || [];
  const displayedMembers = memberFilter === 'Members' 
    ? allMembers.filter(member => selectedRows.includes(member.id))
    : allMembers;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 165px)', gap: 2, pr: 3, mt: -2 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb">
        <Link underline="hover" color="inherit" href="/">
          Home
        </Link>
        <Link underline="hover" color="inherit" href="/admin">
          Admin
        </Link>
        <Typography color="text.primary">Email Distribution Groups</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', flexGrow: 1, gap: 2, overflow: 'hidden', minHeight: 0 }}>
        {/* Left Panel - List */}
        <Paper
          elevation={0}
          sx={{
            width: 350,
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Distribution Groups</Typography>
              <Button variant="contained" size="small" onClick={handleNewGroup}>
                New
              </Button>
            </Box>
            <TextField
              size="small"
              fullWidth
              placeholder="Search groups..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
          </Box>
          <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
            <List>
              {filteredGroups.map((group) => (
                <ListItem
                  key={group.id}
                  button
                  selected={selectedGroupId === group.id}
                  onClick={() => setSelectedGroupId(group.id)}
                >
                  <ListItemIcon>
                    <GroupIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{group.name}</span>
                        <Chip 
                          label={group.status} 
                          color={group.status === 'Active' ? 'success' : 'error'} 
                          size="small"
                          sx={{ 
                            ml: 1,
                            height: 20,
                            fontSize: '0.7rem',
                            '& .MuiChip-label': {
                              px: 1
                            }
                          }}
                        />
                      </Box>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {group.application && `${group.application} - `}
                        {group.members.length} member{group.members.length !== 1 ? 's' : ''}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </Paper>

        {/* Right Panel - Details */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {selectedGroup || selectedGroupId === null ? (
          <>
            {/* Header with buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                {selectedGroupId ? `Edit Group: ${selectedGroup?.name}` : 'New Group'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="outlined" size="small" onClick={handleNewGroup}>
                  New
                </Button>
                <Button variant="outlined" size="small" onClick={handleCopy} disabled={!selectedGroupId}>
                  Copy
                </Button>
                <Button variant="outlined" size="small" onClick={handleSave}>
                  Save
                </Button>
                <Button variant="outlined" size="small" color="error" onClick={handleDelete} disabled={!selectedGroupId}>
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
                  {/* Left Column */}
                  <Grid item xs={6}>
                    <Grid container spacing={2}>
                      {/* Application */}
                      <Grid item xs={12}>
                        <FormControl 
                          size="small" 
                          fullWidth
                          error={formik.touched.application && Boolean(formik.errors.application)}
                        >
                          <InputLabel id="application-label">Application *</InputLabel>
                          <Select
                            labelId="application-label"
                            label="Application *"
                            name="application"
                            value={formik.values.application}
                            onChange={handleApplicationChange}
                            onBlur={formik.handleBlur}
                          >
                            <MenuItem value=""><em>None</em></MenuItem>
                            <MenuItem value="EM">EM</MenuItem>
                            <MenuItem value="CAP-1">CAP-1</MenuItem>
                            <MenuItem value="CAP-2">CAP-2</MenuItem>
                            <MenuItem value="CAP-3">CAP-3</MenuItem>
                            <MenuItem value="X-326">X-326</MenuItem>
                            <MenuItem value="X-333">X-333</MenuItem>
                          </Select>
                          {formik.touched.application && formik.errors.application && (
                            <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75, fontSize: '0.75rem' }}>
                              {formik.errors.application}
                            </Typography>
                          )}
                        </FormControl>
                      </Grid>

                      {/* Group Name */}
                      <Grid item xs={12}>
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
                        />
                      </Grid>

                      {/* Key */}
                      <Grid item xs={12}>
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
                            '& .MuiInputBase-input.Mui-disabled': {
                              WebkitTextFillColor: 'rgba(0, 0, 0, 0.6)'
                            }
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Grid>

                  {/* Right Column */}
                  <Grid item xs={6} sx={{ display: 'flex' }}>
                    {/* Description */}
                    <TextField
                      size="small"
                      fullWidth
                      label="Description"
                      name="description"
                      required
                      multiline
                      value={formik.values.description}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.description && Boolean(formik.errors.description)}
                      helperText={formik.touched.description && formik.errors.description}
                      sx={{
                        '& .MuiInputBase-root': {
                          height: '100%',
                          alignItems: 'flex-start'
                        },
                        '& .MuiInputBase-input': {
                          height: '100% !important',
                          overflow: 'auto !important'
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
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden'
              }}
            >
              <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1">Distribution Group Members</Typography>
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
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <DataGrid
                  rows={displayedMembers}
                  columns={columns}
                  checkboxSelection
                  disableRowSelectionOnClick
                  density="compact"
                  rowSelectionModel={selectedRows}
                  onRowSelectionModelChange={handleMemberSelectionChange}
                  sx={{
                    border: 'none',
                    '& .MuiDataGrid-cell': {
                      borderColor: 'divider'
                    },
                    '& .MuiDataGrid-columnHeaders': {
                      borderColor: 'divider'
                    }
                  }}
                />
              </Box>
            </Paper>
            )}
          </>
        ) : (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Select a group to view details
            </Typography>
          </Box>
        )}
        </Box>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={cancelDelete}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete the distribution group "{selectedGroup?.name}"? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Copy Confirmation Dialog */}
      <Dialog
        open={copyDialogOpen}
        onClose={cancelCopy}
        aria-labelledby="copy-dialog-title"
        aria-describedby="copy-dialog-description"
      >
        <DialogTitle id="copy-dialog-title">
          Confirm Copy
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="copy-dialog-description">
            Are you sure you want to create a copy of the distribution group "{selectedGroup?.name}"? 
            A new group will be created with the name "Copy of {selectedGroup?.name}" with all the same attributes and members.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelCopy} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmCopy} color="primary" variant="contained" autoFocus>
            Copy
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmailDistributionGroups;
