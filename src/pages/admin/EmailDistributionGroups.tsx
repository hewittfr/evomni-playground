import React, { useState, useEffect } from 'react';
import {
  Box,
  Breadcrumbs,
  Link,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Avatar,
  Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { dataService } from '../../services/dataService';
import DistributionGroupList from '../../components/DistributionGroupList';
import DistributionGroupDetail from '../../components/DistributionGroupDetail';

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
  projectLead?: string;
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
  projectLead: Yup.string(),
  description: Yup.string().required('Description is required'),
  status: Yup.string().required('Status is required')
});

const EmailDistributionGroups: React.FC = () => {
  const [groups, setGroups] = useState<DistributionGroup[]>([]);
  const [loading, setLoading] = useState(true);
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
        console.log('📥 Loaded distribution groups from localStorage:', distributionGroups);
        
        // Fetch all members
        const members = await dataService.getMembers();
        setAllMembers(members);
        
        // Fetch project members mapping
        const projMembers = await dataService.getProjectMembers();
        setProjectMembers(projMembers);
        
        // Build groups with members included from the group.members array
        const groupsWithMembers: DistributionGroup[] = distributionGroups.map((group: any) => {
          const groupMemberIds = group.members || [];
          // Ensure all member IDs are strings for consistency
          const normalizedMemberIds = groupMemberIds.map((id: any) => String(id));
          const groupMembers = members.filter((member: any) => normalizedMemberIds.includes(String(member.id)));
          
          console.log(`📋 Group "${group.name}" has member IDs:`, normalizedMemberIds, 'matched members:', groupMembers.length);
          
          return {
            id: String(group.id),
            name: group.name,
            key: group.key,
            project: group.project,
            projectLead: group.projectLead,
            description: group.description,
            status: group.status,
            members: groupMembers.map((m: any) => ({
              id: m.id,
              lastName: m.lastName,
              firstName: m.firstName,
              memberRole: m.memberRole,
              memberSource: m.memberSource,
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
      projectLead: '',
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
                projectLead: values.projectLead,
                description: values.description,
                status: values.status
              }
            : g
        );
        setGroups(updatedGroups);
        
        // Save to localStorage
        try {
          const allGroups = await dataService.getDistributionGroups();
          const groupIndex = allGroups.findIndex((g: any) => g.id === Number(selectedGroupId));
          
          if (groupIndex !== -1) {
            allGroups[groupIndex].name = values.name;
            allGroups[groupIndex].key = values.key;
            allGroups[groupIndex].project = values.project;
            allGroups[groupIndex].projectLead = values.projectLead;
            allGroups[groupIndex].description = values.description;
            allGroups[groupIndex].status = values.status;
            
            await dataService.updateDistributionGroups(allGroups);
            console.log('✅ Distribution group saved to localStorage');
            
            // Reload the groups from localStorage
            const updatedDistributionGroups = await dataService.getDistributionGroups();
            const members = await dataService.getMembers();
            const projMembers = await dataService.getProjectMembers();
            
            const groupsWithMembers: DistributionGroup[] = updatedDistributionGroups.map((group: any) => {
              const groupMemberIds = group.members || [];
              const groupMembers = members.filter((member: any) => groupMemberIds.includes(member.id));
              
              return {
                id: String(group.id),
                name: group.name,
                key: group.key,
                project: group.project,
                projectLead: group.projectLead,
                description: group.description,
                status: group.status,
                members: groupMembers.map((m: any) => ({
                  id: m.id,
                  lastName: m.lastName,
                  firstName: m.firstName,
                  memberRole: m.memberRole,
                  memberSource: m.memberSource,
                  email: m.email
                }))
              };
            });
            
            setGroups(groupsWithMembers);
            setAllMembers(members);
            setProjectMembers(projMembers);
          }
        } catch (error) {
          console.error('Error updating localStorage:', error);
        }
      } else {
        // Create new group
        const newGroup: DistributionGroup = {
          id: `${Date.now()}`,
          name: values.name,
          key: values.key,
          project: values.project,
          projectLead: values.projectLead,
          description: values.description,
          status: values.status,
          members: []
        };
        setGroups([...groups, newGroup]);
        setSelectedGroupId(newGroup.id);
        
        // Save to localStorage
        try {
          const allGroups = await dataService.getDistributionGroups();
          
          allGroups.push({
            id: Number(newGroup.id),
            name: newGroup.name,
            key: newGroup.key,
            project: newGroup.project,
            projectLead: newGroup.projectLead,
            description: newGroup.description,
            status: newGroup.status,
            members: [],
            memberCount: 0
          });
          
          await dataService.updateDistributionGroups(allGroups);
          console.log('✅ New distribution group created in localStorage');
        } catch (error) {
          console.error('Error creating group in localStorage:', error);
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
      firstName: Yup.string()
        .required('First name is required')
        .matches(/^[a-zA-Z0-9'\-.\s]+$/, "Only alphanumeric characters, apostrophes, hyphens, periods, and spaces allowed"),
      lastName: Yup.string()
        .required('Last name is required')
        .matches(/^[a-zA-Z0-9'\-.\s]+$/, "Only alphanumeric characters, apostrophes, hyphens, periods, and spaces allowed"),
      email: Yup.string()
        .email('Invalid email')
        .required('Email is required'),
      memberRole: Yup.string()
        .required('Role is required')
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
        
        const allMembers = await dataService.getMembers();
        allMembers.push(newMember);
        await dataService.updateMembers(allMembers);
        
        // If there's a selected group, add the new member to it
        if (selectedGroupId && selectedGroup) {
          const allGroups = await dataService.getDistributionGroups();
          const groupIndex = allGroups.findIndex((g: any) => g.id === Number(selectedGroupId));
          if (groupIndex !== -1) {
            if (!allGroups[groupIndex].members) {
              allGroups[groupIndex].members = [];
            }
            allGroups[groupIndex].members.push(newMemberId);
            allGroups[groupIndex].memberCount = allGroups[groupIndex].members.length;
          }
          await dataService.updateDistributionGroups(allGroups);
        }
        
        console.log('✅ New member created in localStorage');
        
        // Update allMembers state
        const newMemberWithType = newMember as DistributionGroupMember;
        setAllMembers([...allMembers, newMemberWithType]);
        
        // Update projectMembers state if a group with a project is selected
        if (selectedGroupId && selectedGroup && selectedGroup.project) {
          const maxProjectMemberId = projectMembers.length > 0 
            ? Math.max(...projectMembers.map((pm: any) => {
                const id = pm.id;
                return typeof id === 'string' ? parseInt(id.replace('pm', '')) : 0;
              }))
            : 0;
          const newProjectMemberId = `pm${maxProjectMemberId + 1}`;
          
          setProjectMembers([...projectMembers, {
            id: newProjectMemberId,
            project: selectedGroup.project,
            memberId: newMemberId
          }]);
        }
        
        // Update local group state to include the new member
        if (selectedGroupId && selectedGroup) {
          const updatedGroups = groups.map(g => 
            g.id === selectedGroupId 
              ? { ...g, members: [...g.members, newMemberWithType] }
              : g
          );
          setGroups(updatedGroups);
          setSelectedRows([...selectedRows, newMemberId]);
        }
        
        setNewMemberDialogOpen(false);
        newMemberFormik.resetForm();
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
        projectLead: selectedGroup.projectLead || '',
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
        console.log('Updating group:', selectedGroupId, 'with members:', selectedMemberIds);
        
        // Update the distribution group in localStorage
        const allGroups = await dataService.getDistributionGroups();
        const groupIndex = allGroups.findIndex((g: any) => g.id === Number(selectedGroupId));
        if (groupIndex !== -1) {
          // Ensure member IDs are stored as strings for consistency
          allGroups[groupIndex].members = selectedMemberIds.map(id => String(id));
          allGroups[groupIndex].memberCount = selectedMemberIds.length;
          
          await dataService.updateDistributionGroups(allGroups);
          console.log('✅ Distribution group members saved to localStorage');
        } else {
          console.error('Group not found in database');
        }
      } catch (error) {
        console.error('Error updating localStorage:', error);
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
        projectLead: '',
        description: '',
        status: 'Inactive'
      }
    });
  };

  const handleCopy = () => {
    setCopyDialogOpen(true);
  };

  const confirmCopy = async () => {
    if (selectedGroup) {
      // Create a copy of the group with all members
      const newGroup: DistributionGroup = {
        id: `${Date.now()}`,
        name: `Copy of ${selectedGroup.name}`,
        key: `copy-of-${selectedGroup.key}`,
        project: selectedGroup.project,
        projectLead: selectedGroup.projectLead,
        description: selectedGroup.description,
        status: selectedGroup.status,
        members: [...selectedGroup.members]
      };
      setGroups([...groups, newGroup]);
      setSelectedGroupId(newGroup.id);
      
      // Save to localStorage
      try {
        const allGroups = await dataService.getDistributionGroups();
        
        allGroups.push({
          id: Number(newGroup.id),
          name: newGroup.name,
          key: newGroup.key,
          project: newGroup.project,
          projectLead: newGroup.projectLead,
          description: newGroup.description,
          status: newGroup.status,
          members: newGroup.members.map(m => m.id),
          memberCount: newGroup.members.length
        });
        
        await dataService.updateDistributionGroups(allGroups);
        console.log('✅ Distribution group copied to localStorage');
      } catch (error) {
        console.error('Error copying group in localStorage:', error);
      }
    }
    setCopyDialogOpen(false);
  };

  const cancelCopy = () => {
    setCopyDialogOpen(false);
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedGroupId) {
      // Delete from localStorage first
      try {
        const allGroups = await dataService.getDistributionGroups();
        const updatedGroups = allGroups.filter((g: any) => g.id !== Number(selectedGroupId));
        
        await dataService.updateDistributionGroups(updatedGroups);
        console.log('✅ Distribution group deleted from localStorage');
        
        // Reload data to update UI
        const refreshedGroups = await dataService.getDistributionGroups();
        const members = await dataService.getMembers();
        const projMembers = await dataService.getProjectMembers();
        
        const groupsWithMembers: DistributionGroup[] = refreshedGroups.map((group: any) => {
          const groupMemberIds = group.members || [];
          const groupMembers = members.filter((member: any) => groupMemberIds.includes(member.id));
          
          return {
            id: String(group.id),
            name: group.name,
            key: group.key,
            project: group.project,
            projectLead: group.projectLead,
            description: group.description,
            status: group.status,
            members: groupMembers.map((m: any) => ({
              id: m.id,
              lastName: m.lastName,
              firstName: m.firstName,
              memberRole: m.memberRole,
              memberSource: m.memberSource,
              email: m.email
            }))
          };
        });
        
        setGroups(groupsWithMembers);
        setAllMembers(members);
        setProjectMembers(projMembers);
        
        // Select first available group or null
        const newSelectedId = groupsWithMembers.length > 0 ? groupsWithMembers[0].id : null;
        setSelectedGroupId(newSelectedId);
      } catch (error) {
        console.error('Error deleting group from localStorage:', error);
      }
    }
    setDeleteDialogOpen(false);
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
  };

  const handleSave = () => {
    formik.handleSubmit();
  };

  const handleEditMember = (member: any) => {
    // TODO: Open edit dialog with member data
    console.log('Edit member:', member);
    alert(`Edit member functionality coming soon for ${member.firstName} ${member.lastName}`);
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to delete this custom member?')) {
      return;
    }

    try {
      // Remove member from all groups
      const allGroups = await dataService.getDistributionGroups();
      const updatedGroups = allGroups.map((g: any) => ({
        ...g,
        members: (g.members || []).filter((id: any) => String(id) !== String(memberId)),
        memberCount: (g.members || []).filter((id: any) => String(id) !== String(memberId)).length
      }));
      await dataService.updateDistributionGroups(updatedGroups);

      // Remove member from members array
      const allMembers = await dataService.getMembers();
      const updatedMembers = allMembers.filter((m: any) => String(m.id) !== String(memberId));
      await dataService.updateMembers(updatedMembers);

      console.log('✅ Custom member deleted');

      // Reload data
      const refreshedGroups = await dataService.getDistributionGroups();
      const refreshedMembers = await dataService.getMembers();
      const projMembers = await dataService.getProjectMembers();

      const groupsWithMembers: DistributionGroup[] = refreshedGroups.map((group: any) => {
        const groupMemberIds = group.members || [];
        const normalizedMemberIds = groupMemberIds.map((id: any) => String(id));
        const groupMembers = refreshedMembers.filter((member: any) => normalizedMemberIds.includes(String(member.id)));

        return {
          id: String(group.id),
          name: group.name,
          key: group.key,
          project: group.project,
          projectLead: group.projectLead,
          description: group.description,
          status: group.status,
          members: groupMembers.map((m: any) => ({
            id: m.id,
            lastName: m.lastName,
            firstName: m.firstName,
            memberRole: m.memberRole,
            memberSource: m.memberSource,
            email: m.email
          }))
        };
      });

      setGroups(groupsWithMembers);
      setAllMembers(refreshedMembers);
      setProjectMembers(projMembers);
    } catch (error) {
      console.error('Error deleting member:', error);
      alert('Failed to delete member. Please try again.');
    }
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
      field: 'supervisor',
      headerName: 'Supervisor',
      flex: 1,
      valueGetter: (params) => {
        const member = params.row;
        const memberSource = member.memberRole === 'Manager' ? 'custom' : member.memberSource;
        
        // Custom members don't have supervisors
        if (memberSource === 'custom') {
          return '-';
        }
        
        // Only Schedulers have supervisors (Project Leads)
        if (member.memberRole === 'Scheduler' && selectedGroup?.project) {
          // Use project leads for this specific project
          if (projectLeadsForProject.length > 0) {
            // Get all schedulers to distribute project leads evenly
            const schedulers = potentialMembers.filter(m => m.memberRole === 'Scheduler');
            const schedulerIndex = schedulers.findIndex(s => s.id === member.id);
            
            if (schedulerIndex !== -1) {
              // Distribute project leads across schedulers
              const projectLeadIndex = schedulerIndex % projectLeadsForProject.length;
              const supervisor = projectLeadsForProject[projectLeadIndex];
              return `${supervisor.lastName}, ${supervisor.firstName}`;
            }
          }
        }
        
        return '-';
      }
    },
    {
      field: 'memberSource',
      headerName: 'Member Type',
      flex: 0.7,
      renderCell: (params) => {
        const row = params.row;
        // Force Managers to show as Custom
        const source = row.memberRole === 'Manager' ? 'custom' : params.value as string;
        const label = source === 'p6' ? 'P6' : 'Custom';
        const color = source === 'p6' ? 'default' : 'secondary';
        
        return <Chip label={label} color={color} size="small" sx={{ height: 20, fontSize: '0.7rem', '& .MuiChip-label': { px: 1 } }} />;
      }
    },
    {
      field: 'email',
      headerName: 'Email Address',
      flex: 1
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      renderCell: (params) => {
        const row = params.row;
        const isCustom = row.memberRole === 'Manager' || row.memberSource === 'custom';
        
        if (!isCustom) return null;
        
        return (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton
              size="small"
              onClick={() => handleEditMember(row)}
              title="Edit member"
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDeleteMember(row.id)}
              title="Delete member"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        );
      }
    }
  ];

  // Get all potential members for the selected group's project
  const potentialMembers = selectedGroup && selectedGroup.project
    ? allMembers.filter(member => {
        // Check if this member is mapped to this project
        // Only show Schedulers and Managers
        return projectMembers.some(pm => 
          pm.project === selectedGroup.project && pm.memberId === member.id
        ) && (member.memberRole === 'Scheduler' || member.memberRole === 'Manager');
      })
    : [];

  // Get all project leads for the selected project (for supervisor assignment)
  const projectLeadsForProject = selectedGroup && selectedGroup.project
    ? allMembers.filter(member => 
        member.memberRole === 'Project Lead' &&
        projectMembers.some(pm => 
          pm.project === selectedGroup.project && pm.memberId === member.id
        )
      )
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
        <DistributionGroupList
          groups={groups}
          selectedGroupId={selectedGroupId}
          onSelectGroup={setSelectedGroupId}
          onNewGroup={handleNewGroup}
        />

        {/* Right Panel - Details */}
        <DistributionGroupDetail
          selectedGroup={selectedGroup}
          selectedGroupId={selectedGroupId}
          formik={formik}
          handleNameChange={handleNameChange}
          handleProjectChange={handleProjectChange}
          handleNewGroup={handleNewGroup}
          handleCopy={handleCopy}
          handleSave={handleSave}
          handleDelete={handleDelete}
          displayedMembers={displayedMembers}
          allMembers={allMembers}
          columns={columns}
          selectedRows={selectedRows}
          handleMemberSelectionChange={handleMemberSelectionChange}
          memberFilter={memberFilter}
          setMemberFilter={setMemberFilter}
          setNewMemberDialogOpen={setNewMemberDialogOpen}
        />
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
        <DialogTitle
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            py: 0.5
          }}
        >
          Add New Member
          <IconButton
            onClick={() => setNewMemberDialogOpen(false)}
            sx={{ color: 'white' }}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={newMemberFormik.handleSubmit} sx={{ pt: 4 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="First Name"
                  name="firstName"
                  required
                  value={newMemberFormik.values.firstName}
                  onChange={newMemberFormik.handleChange}
                  onBlur={newMemberFormik.handleBlur}
                  error={newMemberFormik.touched.firstName && Boolean(newMemberFormik.errors.firstName)}
                  helperText={newMemberFormik.touched.firstName && newMemberFormik.errors.firstName}
                  sx={{
                    '& .MuiInputBase-input': { fontSize: '0.75rem' },
                    '& .MuiInputLabel-root': { fontSize: '0.75rem' },
                    '& .MuiFormHelperText-root': { fontSize: '0.65rem' }
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Last Name"
                  name="lastName"
                  required
                  value={newMemberFormik.values.lastName}
                  onChange={newMemberFormik.handleChange}
                  onBlur={newMemberFormik.handleBlur}
                  error={newMemberFormik.touched.lastName && Boolean(newMemberFormik.errors.lastName)}
                  helperText={newMemberFormik.touched.lastName && newMemberFormik.errors.lastName}
                  sx={{
                    '& .MuiInputBase-input': { fontSize: '0.75rem' },
                    '& .MuiInputLabel-root': { fontSize: '0.75rem' },
                    '& .MuiFormHelperText-root': { fontSize: '0.65rem' }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Email"
                  name="email"
                  type="email"
                  required
                  value={newMemberFormik.values.email}
                  onChange={newMemberFormik.handleChange}
                  onBlur={newMemberFormik.handleBlur}
                  error={newMemberFormik.touched.email && Boolean(newMemberFormik.errors.email)}
                  helperText={newMemberFormik.touched.email && newMemberFormik.errors.email}
                  sx={{
                    '& .MuiInputBase-input': { fontSize: '0.75rem' },
                    '& .MuiInputLabel-root': { fontSize: '0.75rem' },
                    '& .MuiFormHelperText-root': { fontSize: '0.65rem' }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth size="small" required>
                  <InputLabel sx={{ fontSize: '0.75rem' }}>Role</InputLabel>
                  <Select
                    name="memberRole"
                    value={newMemberFormik.values.memberRole}
                    onChange={newMemberFormik.handleChange}
                    onBlur={newMemberFormik.handleBlur}
                    label="Role"
                    error={newMemberFormik.touched.memberRole && Boolean(newMemberFormik.errors.memberRole)}
                    sx={{ fontSize: '0.75rem' }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          '& .MuiMenuItem-root': { fontSize: '0.75rem' }
                        }
                      }
                    }}
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
        <DialogActions sx={{ px: 3, pb: 2 }}>
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
