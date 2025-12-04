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
import AddIcon from '@mui/icons-material/Add';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import { DataGrid, GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { dataService } from '../../services/dataService';

// Interfaces
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



// Validation schema
const validationSchema = Yup.object({
  name: Yup.string()
    .required('Group name is required')
    .matches(/^[a-zA-Z0-9_\- ]+$/, 'Only alphanumeric characters, underscores, hyphens, and spaces allowed'),
  key: Yup.string()
    .required('Key is required')
    .matches(/^[a-z0-9-]+$/, 'Key must be lowercase with hyphens only'),
  project: Yup.string().required('Project is required'),
  description: Yup.string().required('Description is required'),
  status: Yup.string().required('Status is required')
});

const EmailDistributionGroups: React.FC = () => {
  const [groups, setGroups] = useState<DistributionGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>([]);
  const [memberFilter, setMemberFilter] = useState<'Members' | 'All'>('All');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [newMemberDialogOpen, setNewMemberDialogOpen] = useState(false);
  const [allMembers, setAllMembers] = useState<DistributionGroupMember[]>([]);
  const [projectMembers, setProjectMembers] = useState<any[]>([]);

  const selectedGroup = groups.find(g => g.id === selectedGroupId);

  // Load distribution groups and members on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Fetch distribution groups
        const distributionGroups = await dataService.getDistributionGroups();
        
        // Fetch all members
        const members = await dataService.getMembers();
        setAllMembers(members);
        
        // Fetch project members mapping
        const projMembers = await dataService.getProjectMembers();
        setProjectMembers(projMembers);
        
        // Build groups with members included from the group.members array
        const groupsWithMembers: DistributionGroup[] = distributionGroups.map((group: any) => {
          const groupMemberIds = group.members || [];
          const groupMembers = members.filter((member: any) => groupMemberIds.includes(member.id));
          
          return {
            id: String(group.id),
            name: group.name,
            key: group.key,
            project: group.project,
            description: group.description,
            status: group.status,
            members: groupMembers.map((m: any) => ({
              id: m.id,
              lastName: m.lastName,
              firstName: m.firstName,
              memberRole: m.memberRole,
              email: m.email
            }))
          };
        });
        
        setGroups(groupsWithMembers);
        
        // Set first group as selected by default
        if (groupsWithMembers.length > 0) {
          setSelectedGroupId(groupsWithMembers[0].id);
        }
      } catch (error) {
        console.error('Error loading distribution groups:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Formik form
  const formik = useFormik({
    initialValues: {
      name: '',
      key: '',
      project: '',
      description: '',
      status: 'Inactive' as 'Active' | 'Inactive'
    },
    validationSchema,
    onSubmit: async (values) => {
      if (selectedGroupId) {
        // Update existing group
        const updatedGroups = groups.map(g => 
          g.id === selectedGroupId 
            ? {
                ...g,
                name: values.name,
                key: values.key,
                project: values.project,
                description: values.description,
                status: values.status
              }
            : g
        );
        setGroups(updatedGroups);
        
        // Save to database.json
        try {
          const response = await fetch('/evomni-playground/src/database/database.json');
          const db = await response.json();
          
          const groupIndex = db.distributionGroups.findIndex((g: any) => g.id === Number(selectedGroupId));
          if (groupIndex !== -1) {
            db.distributionGroups[groupIndex].name = values.name;
            db.distributionGroups[groupIndex].key = values.key;
            db.distributionGroups[groupIndex].project = values.project;
            db.distributionGroups[groupIndex].description = values.description;
            db.distributionGroups[groupIndex].status = values.status;
            
            const saveResponse = await fetch('/api/save-database', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(db)
            });
            
            const saveResult = await saveResponse.json();
            if (saveResult.success) {
              console.log('Distribution group saved successfully');
            } else {
              console.error('Save failed:', saveResult.error);
            }
          }
        } catch (error) {
          console.error('Error updating database:', error);
        }
      } else {
        // Create new group
        const newGroup: DistributionGroup = {
          id: `${Date.now()}`,
          name: values.name,
          key: values.key,
          project: values.project,
          description: values.description,
          status: values.status,
          members: []
        };
        setGroups([...groups, newGroup]);
        setSelectedGroupId(newGroup.id);
        
        // Save to database.json
        try {
          const response = await fetch('/evomni-playground/src/database/database.json');
          const db = await response.json();
          
          db.distributionGroups.push({
            id: Number(newGroup.id),
            name: newGroup.name,
            key: newGroup.key,
            project: newGroup.project,
            description: newGroup.description,
            status: newGroup.status,
            members: [],
            memberCount: 0
          });
          
          const saveResponse = await fetch('/api/save-database', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(db)
          });
          
          const saveResult = await saveResponse.json();
          if (saveResult.success) {
            console.log('New distribution group created successfully');
          } else {
            console.error('Save failed:', saveResult.error);
          }
        } catch (error) {
          console.error('Error creating group in database:', error);
        }
      }
    }
  });

  // New member formik
  const newMemberFormik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      memberRole: 'Scheduler' as 'Manager' | 'Project Lead' | 'Scheduler',
      memberSource: 'custom' as 'p6' | 'custom'
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required('First name is required'),
      lastName: Yup.string().required('Last name is required'),
      email: Yup.string().email('Invalid email').required('Email is required'),
      memberRole: Yup.string().required('Role is required')
    }),
    onSubmit: async (values) => {
      try {
        const response = await fetch('/evomni-playground/src/database/database.json');
        const db = await response.json();
        
        // Generate new member ID
        const maxId = Math.max(...db.members.map((m: any) => parseInt(m.id.replace('m', ''))));
        const newMemberId = `m${maxId + 1}`;
        
        const newMember = {
          id: newMemberId,
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          memberRole: values.memberRole,
          memberSource: values.memberSource,
          percentChange: 0
        };
        
        db.members.push(newMember);
        
        const saveResponse = await fetch('/api/save-database', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(db)
        });
        
        const saveResult = await saveResponse.json();
        if (saveResult.success) {
          console.log('New member created successfully');
          setAllMembers([...allMembers, newMember as DistributionGroupMember]);
          setNewMemberDialogOpen(false);
          newMemberFormik.resetForm();
        } else {
          console.error('Save failed:', saveResult.error);
        }
      } catch (error) {
        console.error('Error creating member:', error);
      }
    }
  });

  // Initialize form when selected group changes
  useEffect(() => {
    if (selectedGroup) {
      formik.setValues({
        name: selectedGroup.name,
        key: selectedGroup.key,
        project: selectedGroup.project || '',
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
    
    // Prefix with project if selected
    const project = formik.values.project;
    const finalKey = project ? `${project.toLowerCase()}-${generatedKey}` : generatedKey;
    formik.setFieldValue('key', finalKey);
  };

  // Handle project change and update key
  const handleProjectChange = (e: any) => {
    const project = e.target.value;
    formik.setFieldValue('project', project);
    
    // Regenerate key with new project prefix
    const name = formik.values.name;
    const generatedKey = name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    
    const finalKey = project ? `${project.toLowerCase()}-${generatedKey}` : generatedKey;
    formik.setFieldValue('key', finalKey);
  };

  // Handle member selection changes
  const handleMemberSelectionChange = async (newSelection: GridRowSelectionModel) => {
    setSelectedRows(newSelection);
    
    // Update the group's members based on selection
    if (selectedGroupId && selectedGroup) {
      // Get the full member objects for the selected IDs from potentialMembers
      const selectedMemberIds = newSelection as string[];
      const selectedMembers = allMembers.filter(member => selectedMemberIds.includes(member.id));
      
      // Update local state
      const updatedGroups = groups.map(g => 
        g.id === selectedGroupId 
          ? { ...g, members: selectedMembers }
          : g
      );
      setGroups(updatedGroups);
      
      // Save to database.json
      try {
        console.log('Fetching database.json...');
        const response = await fetch('/evomni-playground/src/database/database.json');
        const db = await response.json();
        
        console.log('Updating group:', selectedGroupId, 'with members:', selectedMemberIds);
        
        // Update the distribution group in the database
        const groupIndex = db.distributionGroups.findIndex((g: any) => g.id === Number(selectedGroupId));
        if (groupIndex !== -1) {
          db.distributionGroups[groupIndex].members = selectedMemberIds;
          db.distributionGroups[groupIndex].memberCount = selectedMemberIds.length;
          
          console.log('Saving to /api/save-database...');
          // Save back to file via API
          const saveResponse = await fetch('/api/save-database', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(db)
          });
          
          const saveResult = await saveResponse.json();
          console.log('Save result:', saveResult);
          
          if (saveResult.success) {
            console.log('Distribution group members saved successfully');
          } else {
            console.error('Save failed:', saveResult.error);
          }
        } else {
          console.error('Group not found in database');
        }
      } catch (error) {
        console.error('Error updating database:', error);
      }
    }
  };

  const handleNewGroup = () => {
    setSelectedGroupId(null);
    formik.resetForm({
      values: {
        name: '',
        key: '',
        project: '',
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
        project: selectedGroup.project,
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
      valueGetter: (params) => `${params.row.lastName}, ${params.row.firstName}`,
      renderCell: (params) => {
        const firstName = params.row.firstName;
        const lastName = params.row.lastName;
        const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`;
        
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar 
              sx={{ 
                width: 24, 
                height: 24, 
                fontSize: '0.65rem',
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
      field: 'memberRole',
      headerName: 'Member Role',
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
        
        return <Chip label={type} color={color} size="small" sx={{ height: 20, fontSize: '0.7rem', '& .MuiChip-label': { px: 1 } }} />;
      }
    },
    {
      field: 'memberSource',
      headerName: 'Member Type',
      flex: 0.7,
      renderCell: (params) => {
        const source = params.value as string;
        const label = source === 'p6' ? 'P6' : 'Custom';
        const color = source === 'p6' ? 'default' : 'secondary';
        
        return <Chip label={label} color={color} size="small" sx={{ height: 20, fontSize: '0.7rem', '& .MuiChip-label': { px: 1 } }} />;
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

  // Get all potential members for the selected group's project
  const potentialMembers = selectedGroup && selectedGroup.project
    ? allMembers.filter(member => {
        // Check if this member is mapped to this project
        return projectMembers.some(pm => 
          pm.project === selectedGroup.project && pm.memberId === member.id
        );
      })
    : [];

  // Get members to display based on filter
  const displayedMembers = memberFilter === 'Members' 
    ? potentialMembers.filter(member => selectedRows.includes(member.id))
    : potentialMembers;

  // Show loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 165px)', gap: 2, pr: 3, mt: -2 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link underline="hover" color="inherit" href="/">
            Home
          </Link>
          <Link underline="hover" color="inherit" href="/admin">
            Admin
          </Link>
          <Typography color="text.primary">Email Distribution Groups</Typography>
        </Breadcrumbs>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
          <Typography variant="body1" color="text.secondary">Loading distribution groups...</Typography>
        </Box>
      </Box>
    );
  }

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
              <Button variant="contained" size="small" onClick={handleNewGroup} startIcon={<AddIcon />}>
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
                  sx={{ alignItems: 'flex-start' }}
                >
                  <ListItemIcon sx={{ mt: '4px' }}>
                    <GroupIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span>{group.name}</span>
                        <Chip 
                          label={group.status} 
                          color={group.status === 'Active' ? 'success' : 'error'} 
                          size="small"
                          sx={{ 
                            ml: 1,
                            mt: '4px',
                            height: 18,
                            fontSize: '0.65rem',
                            '& .MuiChip-label': {
                              px: 0.75
                            }
                          }}
                        />
                      </Box>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {group.project && `${group.project} - `}
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
                      {/* Project */}
                      <Grid item xs={12}>
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
                          overflow: 'auto !important',
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
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden'
              }}
            >
              <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
              <Box sx={{ height: 600, width: '100%' }}>
                <DataGrid
                  rows={displayedMembers}
                  columns={columns}
                  checkboxSelection
                  disableRowSelectionOnClick
                  density="compact"
                  rowSelectionModel={selectedRows}
                  onRowSelectionModelChange={handleMemberSelectionChange}
                  initialState={{
                    sorting: {
                      sortModel: [
                        { field: 'memberRole', sort: 'asc' }
                      ]
                    },
                    pagination: {
                      paginationModel: { pageSize: 25 }
                    }
                  }}
                  pageSizeOptions={[25, 50, 100]}
                  sx={{
                    border: 'none',
                    '& .MuiDataGrid-cell': {
                      borderColor: 'divider',
                      fontSize: '0.75rem'
                    },
                    '& .MuiDataGrid-columnHeaders': {
                      borderColor: 'divider',
                      fontSize: '0.75rem'
                    },
                    '& .MuiDataGrid-footerContainer': {
                      borderTop: '1px solid',
                      borderColor: 'divider',
                      minHeight: '28px',
                      height: '28px'
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

      {/* New Member Dialog */}
      <Dialog
        open={newMemberDialogOpen}
        onClose={() => setNewMemberDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Member</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={newMemberFormik.handleSubmit} sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="First Name"
                  name="firstName"
                  value={newMemberFormik.values.firstName}
                  onChange={newMemberFormik.handleChange}
                  error={newMemberFormik.touched.firstName && Boolean(newMemberFormik.errors.firstName)}
                  helperText={newMemberFormik.touched.firstName && newMemberFormik.errors.firstName}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Last Name"
                  name="lastName"
                  value={newMemberFormik.values.lastName}
                  onChange={newMemberFormik.handleChange}
                  error={newMemberFormik.touched.lastName && Boolean(newMemberFormik.errors.lastName)}
                  helperText={newMemberFormik.touched.lastName && newMemberFormik.errors.lastName}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Email"
                  name="email"
                  type="email"
                  value={newMemberFormik.values.email}
                  onChange={newMemberFormik.handleChange}
                  error={newMemberFormik.touched.email && Boolean(newMemberFormik.errors.email)}
                  helperText={newMemberFormik.touched.email && newMemberFormik.errors.email}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth size="small">
                  <InputLabel>Role</InputLabel>
                  <Select
                    name="memberRole"
                    value={newMemberFormik.values.memberRole}
                    onChange={newMemberFormik.handleChange}
                    label="Role"
                  >
                    <MenuItem value="Manager">Manager</MenuItem>
                    <MenuItem value="Project Lead">Project Lead</MenuItem>
                    <MenuItem value="Scheduler">Scheduler</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewMemberDialogOpen(false)}>Cancel</Button>
          <Button onClick={() => newMemberFormik.handleSubmit()} variant="contained" color="primary">
            Create Member
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmailDistributionGroups;
