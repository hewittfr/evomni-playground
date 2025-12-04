import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Tabs,
  Tab,
  Grid,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  List,
  ListItemButton,
  Chip,
  TextField,
  InputAdornment,
  Card,
  CardContent
} from '@mui/material';
import { DataGrid, GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import EmailIcon from '@mui/icons-material/Email';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import dataService from '../services/dataService';

export default function Evms() {
  const [tabValue, setTabValue] = useState(0);
  const [appTabValue, setAppTabValue] = useState(0);
  const [subTabValue, setSubTabValue] = useState(0);
  const [leftGridSelection, setLeftGridSelection] = useState<GridRowSelectionModel>([]);
  const [rightGridSelection, setRightGridSelection] = useState<GridRowSelectionModel>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [selectedDistGroup, setSelectedDistGroup] = useState<number | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<GridRowSelectionModel>([]);
  const [selectedDataChecks, setSelectedDataChecks] = useState<GridRowSelectionModel>([]);
  const [groupSearchText, setGroupSearchText] = useState('');
  const [compiledSelections, setCompiledSelections] = useState<Array<{
    groupId: number;
    groupName: string;
    application: string;
    recipientCount: number;
    dataCheckCount: number;
    selectedMemberIds: (string | number)[];
    selectedDataCheckIds: number[];
  }>>([]);

  // State for loaded data
  const [dataChecks, setDataChecks] = useState<any[]>([]);
  const [distributionGroups, setDistributionGroups] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [projectMembers, setProjectMembers] = useState<any[]>([]);
  const [exportZones, setExportZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data on component mount
  useEffect(() => {
    async function loadData() {
      try {
        const [checksData, groupsData, membersData, projectMembersData, exportZonesData] = await Promise.all([
          dataService.getDataChecks(),
          dataService.getDistributionGroups(),
          dataService.getMembers(),
          dataService.getProjectMembers(),
          dataService.getExportZones()
        ]);
        setDataChecks(checksData);
        setDistributionGroups(groupsData);
        setMembers(membersData);
        setProjectMembers(projectMembersData);
        setExportZones(exportZonesData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleRunExport = () => {
    console.log('Run Export clicked');
    handleMenuClose();
  };

  const handleSendEmail = () => {
    setEmailDialogOpen(true);
    handleMenuClose();
  };

  const handleCloseEmailDialog = () => {
    setEmailDialogOpen(false);
    setSelectedDistGroup(null);
    setSelectedMembers([]);
    setSelectedDataChecks([]);
    setCompiledSelections([]);
    setGroupSearchText('');
  };

  const handleEmailSend = () => {
    console.log('Sending email with compiled selections:', compiledSelections);
    handleCloseEmailDialog();
  };

  const handleDistGroupSelect = (groupId: number) => {
    setSelectedDistGroup(groupId);
    setSelectedMembers([]);
    setSelectedDataChecks([]);
  };

  const handleMemberSelectionChange = (newSelection: GridRowSelectionModel) => {
    setSelectedMembers(newSelection);
    
    // Update or create the compiled selection for the current group
    if (selectedDistGroup !== null && (newSelection.length > 0 || selectedDataChecks.length > 0)) {
      const group = distributionGroups.find(g => g.id === selectedDistGroup);
      if (!group) return;
      
      setCompiledSelections(prev => {
        const existingIndex = prev.findIndex(s => s.groupId === selectedDistGroup);
        const updatedSelection = {
          groupId: group.id,
          groupName: group.name,
          application: group.project,
          recipientCount: newSelection.length,
          dataCheckCount: selectedDataChecks.length,
          selectedMemberIds: newSelection as (string | number)[],
          selectedDataCheckIds: selectedDataChecks as number[]
        };
        
        if (existingIndex >= 0) {
          // Update existing
          const updated = [...prev];
          updated[existingIndex] = updatedSelection;
          return updated;
        } else {
          // Add new
          return [...prev, updatedSelection];
        }
      });
    } else if (selectedDistGroup !== null && newSelection.length === 0 && selectedDataChecks.length === 0) {
      // Remove the selection if both are empty
      setCompiledSelections(prev => prev.filter(s => s.groupId !== selectedDistGroup));
    }
  };

  const handleDataCheckSelectionChange = (newSelection: GridRowSelectionModel) => {
    setSelectedDataChecks(newSelection);
    
    // Update or create the compiled selection for the current group
    if (selectedDistGroup !== null && (newSelection.length > 0 || selectedMembers.length > 0)) {
      const group = distributionGroups.find(g => g.id === selectedDistGroup);
      if (!group) return;
      
      setCompiledSelections(prev => {
        const existingIndex = prev.findIndex(s => s.groupId === selectedDistGroup);
        const updatedSelection = {
          groupId: group.id,
          groupName: group.name,
          application: group.project,
          recipientCount: selectedMembers.length,
          dataCheckCount: newSelection.length,
          selectedMemberIds: selectedMembers as (string | number)[],
          selectedDataCheckIds: newSelection as number[]
        };
        
        if (existingIndex >= 0) {
          // Update existing
          const updated = [...prev];
          updated[existingIndex] = updatedSelection;
          return updated;
        } else {
          // Add new
          return [...prev, updatedSelection];
        }
      });
    } else if (selectedDistGroup !== null && newSelection.length === 0 && selectedMembers.length === 0) {
      // Remove the selection if both are empty
      setCompiledSelections(prev => prev.filter(s => s.groupId !== selectedDistGroup));
    }
  };

  const handleDeleteSelection = (groupId: number) => {
    setCompiledSelections(prev => prev.filter(s => s.groupId !== groupId));
    // If deleting the currently selected group, clear the selection
    if (selectedDistGroup === groupId) {
      setSelectedDistGroup(null);
      setSelectedMembers([]);
      setSelectedDataChecks([]);
    }
  };

  const handleReloadSelection = (groupId: number, recipientCount: number, dataCheckCount: number) => {
    // Find the selection in compiled selections
    const selection = compiledSelections.find(s => s.groupId === groupId);
    if (!selection) return;
    
    // Set the distribution group and restore the selections
    setSelectedDistGroup(groupId);
    setSelectedMembers(selection.selectedMemberIds);
    setSelectedDataChecks(selection.selectedDataCheckIds);
  };

  // Get members for selected distribution group based on the group's project
  const selectedGroupProject = selectedDistGroup
    ? distributionGroups.find(g => g.id === selectedDistGroup)?.project
    : null;
  
  const selectedGroupMembers = selectedGroupProject
    ? members.filter(m => {
        // Check if this member is mapped to this project
        return projectMembers.some(pm => 
          pm.project === selectedGroupProject && pm.memberId === m.id
        );
      })
    : [];

  // Get app for selected distribution group
  const selectedGroupApp = selectedDistGroup
    ? distributionGroups.find(g => g.id === selectedDistGroup)?.project
    : null;

  // Get name for selected distribution group
  const selectedGroupName = selectedDistGroup
    ? distributionGroups.find(g => g.id === selectedDistGroup)?.name
    : null;

  const dataCheckColumns: GridColDef[] = [
    { field: 'name', headerName: 'DataCheck Name', flex: 1 },
    { field: 'issues', headerName: 'Issues', width: 100, align: 'center', headerAlign: 'center' }
  ];

  const dataCheckColumnsWithPercent: GridColDef[] = [
    { field: 'name', headerName: 'DataCheck Name', flex: 1 },
    { field: 'issues', headerName: 'Issues', width: 100, align: 'center', headerAlign: 'center' },
    { 
      field: 'percentChange', 
      headerName: '% Change', 
      width: 120, 
      align: 'center', 
      headerAlign: 'center',
      renderCell: (params) => {
        const value = params.value as number;
        let color: 'error' | 'default' | 'success' = 'default';
        
        if (value > 0) {
          color = 'error'; // red for positive
        } else if (value < 0) {
          color = 'success'; // green for negative
        }
        
        return <Chip label={`${value}%`} color={color} size="small" sx={{ height: 20, fontSize: '0.7rem', '& .MuiChip-label': { px: 1 } }} />;
      }
    }
  ];

  const memberColumns: GridColDef[] = [
    { 
      field: 'fullName', 
      headerName: 'Name', 
      flex: 1,
      valueGetter: (params) => `${params.row.lastName}, ${params.row.firstName}`
    },
    { 
      field: 'memberRole', 
      headerName: 'Role', 
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
    { field: 'email', headerName: 'Email', flex: 1.5 }
  ];

  const memberColumnsWithPercent: GridColDef[] = [
    { 
      field: 'fullName', 
      headerName: 'Name', 
      flex: 1,
      valueGetter: (params) => `${params.row.lastName}, ${params.row.firstName}`
    },
    { 
      field: 'memberRole', 
      headerName: 'Role', 
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
    { field: 'email', headerName: 'Email', flex: 1.5 },
    { 
      field: 'percentChange', 
      headerName: '% Change', 
      width: 120, 
      align: 'center', 
      headerAlign: 'center',
      renderCell: (params) => {
        const value = params.value as number;
        let color: 'error' | 'default' | 'success' = 'default';
        
        if (value > 0) {
          color = 'error'; // red for positive
        } else if (value < 0) {
          color = 'success'; // green for negative
        }
        
        return <Chip label={`${value}%`} color={color} size="small" sx={{ height: 20, fontSize: '0.7rem', '& .MuiChip-label': { px: 1 } }} />;
      }
    }
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', gap: 2, p: 2, overflowY: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={appTabValue}
          onChange={(e, newValue) => setAppTabValue(newValue)}
          sx={{
            flexGrow: 1,
            '& .MuiTab-root': {
              textTransform: 'none'
            },
            '& .MuiTabs-root': {
              minHeight: 48
            }
          }}
        >
          <Tab label="EM" />
          <Tab label="CAP-1" />
          <Tab label="CAP-2" />
          <Tab label="CAP-3" />
          <Tab label="X-326" />
          <Tab label="X-333" />
        </Tabs>
        <Button
          variant="contained"
          endIcon={<ArrowDropDownIcon />}
          onClick={handleMenuClick}
          sx={{ mr: 2 }}
        >
          Actions
        </Button>
        <Menu
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleRunExport}>
            <ListItemIcon>
              <PlayArrowIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Run Export</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleSendEmail}>
            <ListItemIcon>
              <EmailIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Send Email</ListItemText>
          </MenuItem>
        </Menu>
      </Box>

      {/* Top Section - 3 subsections */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        {/* CPP Inputs/Selections */}
        <Paper 
          elevation={0} 
          sx={{ 
            flex: 1, 
            p: 2, 
            border: '1px solid', 
            borderColor: 'divider',
            minHeight: 200
          }}
        >
          <Typography variant="subtitle1" sx={{ mb: 2 }}>CPP Inputs/Selections</Typography>
          <Typography variant="body2" color="text.secondary">
            CPP configuration options will go here
          </Typography>
        </Paper>

        {/* Export Options */}
        <Paper 
          elevation={0} 
          sx={{ 
            flex: 1, 
            p: 2, 
            border: '1px solid', 
            borderColor: 'divider',
            minHeight: 200
          }}
        >
          <Typography variant="subtitle1" sx={{ mb: 2 }}>Export Options</Typography>
          <Typography variant="body2" color="text.secondary">
            Export configuration options will go here
          </Typography>
        </Paper>

        {/* Export Zone */}
        <Paper 
          elevation={0} 
          sx={{ 
            flex: 1, 
            p: 2, 
            border: '1px solid', 
            borderColor: 'divider',
            minHeight: 200
          }}
        >
          <Typography variant="subtitle1" sx={{ mb: 2 }}>Export Zone</Typography>
          <Typography variant="body2" color="text.secondary">
            Export zone settings will go here
          </Typography>
        </Paper>
      </Box>

      {/* Bottom Section - DataChecks with vertical tabs and 2 columns */}
      <Box sx={{ display: 'flex', gap: 2, minHeight: 0, pb: 0 }}>
        {/* Left Section - Vertical Tabs for DataCheck Sets */}
        <Paper 
          elevation={0} 
          sx={{ 
            width: 200, 
            border: '1px solid', 
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            height: 460,
            boxShadow: 'none'
          }}
        >
          <Tabs
            orientation="vertical"
            value={subTabValue}
            onChange={(e, newValue) => setSubTabValue(newValue)}
            sx={{ 
              borderRight: 1, 
              borderColor: 'divider',
              '& .MuiTab-root': {
                alignItems: 'flex-start',
                textAlign: 'left',
                textTransform: 'none'
              }
            }}
          >
            {[...new Set(dataChecks.map(dc => dc.clusterSubtabIndex))].sort().map(index => (
              <Tab key={index} label={`DataCheck Set ${index + 1}`} />
            ))}
          </Tabs>
        </Paper>

        {/* Right Section - DataGrids for current subtab */}
        <Box sx={{ display: 'flex', gap: 2, flexGrow: 1, minHeight: 0 }}>
          {/* Left DataGrid - Position 0 */}
          <Paper 
            elevation={0} 
            sx={{ 
              flex: 1, 
              border: '1px solid', 
              borderColor: 'divider',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              height: 460,
              boxShadow: 'none'
            }}
          >
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle1">DataChecks - Column 1</Typography>
            </Box>
            <Box sx={{ flexGrow: 1, minHeight: 0 }}>
              <DataGrid
                rows={dataChecks.filter(dc => 
                  dc.clusterSubtabIndex === subTabValue && dc.subtabPositionIndex === 0
                )}
                columns={dataCheckColumns}
                checkboxSelection
                disableRowSelectionOnClick
                density="compact"
                rowSelectionModel={leftGridSelection}
                onRowSelectionModelChange={setLeftGridSelection}
                hideFooter
                initialState={{
                  pagination: {
                    paginationModel: { pageSize: 100 }
                  }
                }}
                sx={{
                  border: 'none',
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

          {/* Right DataGrid - Position 1 */}
          <Paper 
            elevation={0} 
            sx={{ 
              flex: 1, 
              border: '1px solid', 
              borderColor: 'divider',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              height: 460,
              boxShadow: 'none'
            }}
          >
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle1">DataChecks - Column 2</Typography>
            </Box>
            <Box sx={{ flexGrow: 1, minHeight: 0 }}>
              <DataGrid
                rows={dataChecks.filter(dc => 
                  dc.clusterSubtabIndex === subTabValue && dc.subtabPositionIndex === 1
                )}
                columns={dataCheckColumns}
                checkboxSelection
                disableRowSelectionOnClick
                density="compact"
                rowSelectionModel={rightGridSelection}
                onRowSelectionModelChange={setRightGridSelection}
                hideFooter
                initialState={{
                  pagination: {
                    paginationModel: { pageSize: 100 }
                  }
                }}
                sx={{
                  border: 'none',
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
        </Box>
      </Box>

      {/* Export Status Section */}
      <Box>
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', p: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>Export Status</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {/* Export Zones Column */}
            <Box sx={{ width: 200, borderRight: '1px solid', borderColor: 'divider', pr: 1 }}>
              <Box sx={{ height: 40, display: 'flex', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider', mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>Export Zone (Release)</Typography>
              </Box>
              {exportZones.map((zone) => (
                <Box 
                  key={zone.id} 
                  sx={{ 
                    height: 40, 
                    display: 'flex', 
                    alignItems: 'center',
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: 'primary.main',
                      cursor: 'pointer',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                    onClick={() => window.open(`file:///${zone.releasePath}`, '_blank')}
                  >
                    {zone.name}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* DataCheck Columns */}
            <Box sx={{ flex: 1, display: 'flex', overflowX: 'auto' }}>
              {/* Left DataCheck Column */}
              <Box sx={{ flex: 1, minWidth: 150 }}>
                <Box sx={{ height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid', borderColor: 'divider', mb: 1, bgcolor: 'grey.100' }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>DataChecks - Column 1</Typography>
                </Box>
                {exportZones.map((zone) => (
                  <Box 
                    key={`${zone.id}-col1`}
                    sx={{ 
                      height: 40, 
                      display: 'flex', 
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      borderRight: '1px solid'
                    }}
                  >
                    <Chip label="idle" size="small" sx={{ fontSize: '0.65rem', height: 20 }} />
                  </Box>
                ))}
              </Box>

              {/* Right DataCheck Column */}
              <Box sx={{ flex: 1, minWidth: 150 }}>
                <Box sx={{ height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid', borderColor: 'divider', mb: 1, bgcolor: 'grey.100' }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>DataChecks - Column 2</Typography>
                </Box>
                {exportZones.map((zone) => (
                  <Box 
                    key={`${zone.id}-col2`}
                    sx={{ 
                      height: 40, 
                      display: 'flex', 
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderBottom: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    <Chip label="idle" size="small" sx={{ fontSize: '0.65rem', height: 20 }} />
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Send Email Dialog */}
      <Dialog
        open={emailDialogOpen}
        onClose={handleCloseEmailDialog}
        maxWidth="xl"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Send Email
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleCloseEmailDialog}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ height: '70vh', p: 2, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ flex: 1, display: 'flex', gap: 2, minHeight: 0 }}>
            {/* Column 1 - Distribution Groups List */}
            <Box sx={{ width: '20%', height: '100%' }}>
              <Box sx={{ 
                height: '100%', 
                bgcolor: 'grey.50',
                borderRadius: 2,
                border: 1,
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <Box sx={{ p: 2, flexShrink: 0 }}>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                    Distribution Groups
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search groups..."
                    value={groupSearchText}
                    onChange={(e) => setGroupSearchText(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 2 }}
                  />
                </Box>
                <Box sx={{ 
                  flex: 1,
                  overflowY: 'auto',
                  px: 2,
                  pb: 2
                }}>
                {['EM', 'CAP-1', 'CAP-2', 'CAP-3', 'X-326', 'X-333'].map((app) => {
                  const groupsForApp = distributionGroups.filter(g => 
                    g.project === app && 
                    (g.name.toLowerCase().includes(groupSearchText.toLowerCase()) ||
                     g.project.toLowerCase().includes(groupSearchText.toLowerCase()))
                  );
                  if (groupsForApp.length === 0) return null;                    return (
                      <Box key={app} sx={{ mb: 2 }}>
                        <Typography 
                          variant="overline" 
                          sx={{ 
                            fontWeight: 700, 
                            color: 'text.primary', 
                            letterSpacing: 1.2,
                            mb: 0.5, 
                            display: 'block', 
                            px: 1.5,
                            fontSize: '0.8rem',
                            bgcolor: 'grey.200',
                            borderRadius: 1,
                            py: 0.5,
                            lineHeight: 1.6
                          }}
                        >
                          {app}
                        </Typography>
                        <List dense disablePadding>
                          {groupsForApp.map((group) => (
                            <ListItemButton
                              key={group.id}
                              selected={selectedDistGroup === group.id}
                              onClick={() => handleDistGroupSelect(group.id)}
                              sx={{ 
                                pl: 2,
                                pr: 2,
                                py: 0,
                                mb: 0.25,
                                borderRadius: 1,
                                minHeight: 32,
                                '&.Mui-selected': {
                                  bgcolor: 'rgba(33, 150, 243, 0.12)',
                                  '&:hover': {
                                    bgcolor: 'rgba(33, 150, 243, 0.2)',
                                  }
                                },
                                '&:hover': {
                                  bgcolor: 'action.hover',
                                }
                              }}
                            >
                              <ListItemText 
                                primary={group.name}
                                primaryTypographyProps={{ 
                                  variant: 'body2',
                                  fontSize: '0.8rem',
                                  fontWeight: selectedDistGroup === group.id ? 600 : 400
                                }}
                              />
                              <Chip 
                                label={group.memberCount} 
                                size="small" 
                                sx={{ 
                                  height: 20,
                                  fontSize: '0.7rem',
                                  fontWeight: 600
                                }} 
                              />
                            </ListItemButton>
                          ))}
                        </List>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            </Box>

            {/* Column 2 - DataChecks & Members DataGrids */}
            <Box sx={{ width: '45%', height: '100%', overflow: 'hidden' }}>
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* DataChecks DataGrid */}
                <Box sx={{ 
                  flex: 1, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  minHeight: 0,
                  bgcolor: 'grey.50',
                  borderRadius: 2,
                  border: 1,
                  borderColor: 'divider',
                  overflow: 'hidden'
                }}>
                  <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', flexShrink: 0, bgcolor: 'background.paper' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {selectedDistGroup ? `DataChecks for ${selectedGroupApp}` : 'DataChecks'}
                    </Typography>
                  </Box>
                  <Box sx={{ flexGrow: 1, minHeight: 0, overflow: 'hidden' }}>
                    {selectedDistGroup ? (
                      <DataGrid
                        rows={dataChecks}
                        columns={dataCheckColumnsWithPercent}
                        checkboxSelection
                        disableRowSelectionOnClick
                        density="compact"
                        rowSelectionModel={selectedDataChecks}
                        onRowSelectionModelChange={handleDataCheckSelectionChange}
                        sx={{ 
                          border: 'none', 
                          height: '100%',
                          '& .MuiDataGrid-columnHeaderTitle': {
                            fontSize: '0.75rem',
                            fontWeight: 600
                          },
                          '& .MuiDataGrid-cell': {
                            fontSize: '0.75rem'
                          }
                        }}
                      />
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <Typography variant="body2" color="text.secondary">
                          Select a distribution group to view data checks
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>

                {/* Members DataGrid */}
                <Box sx={{ 
                  flex: 1, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  minHeight: 0,
                  bgcolor: 'grey.50',
                  borderRadius: 2,
                  border: 1,
                  borderColor: 'divider',
                  overflow: 'hidden'
                }}>
                  <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', flexShrink: 0, bgcolor: 'background.paper' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {selectedGroupName ? `${selectedGroupName} Members` : 'Members'}
                    </Typography>
                  </Box>
                  <Box sx={{ flexGrow: 1, minHeight: 0, overflow: 'hidden' }}>
                    {selectedDistGroup ? (
                      <DataGrid
                        rows={selectedGroupMembers}
                        columns={memberColumnsWithPercent}
                        checkboxSelection
                        disableRowSelectionOnClick
                        density="compact"
                        rowSelectionModel={selectedMembers}
                        onRowSelectionModelChange={handleMemberSelectionChange}
                        initialState={{
                          sorting: {
                            sortModel: [{ field: 'memberRole', sort: 'asc' }]
                          }
                        }}
                        sx={{ 
                          border: 'none', 
                          height: '100%',
                          '& .MuiDataGrid-columnHeaderTitle': {
                            fontSize: '0.75rem',
                            fontWeight: 600
                          },
                          '& .MuiDataGrid-cell': {
                            fontSize: '0.75rem'
                          }
                        }}
                      />
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <Typography variant="body2" color="text.secondary">
                          Select a distribution group to view members
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Column 3 - Email Summary */}
            <Box sx={{ width: '31%', height: '100%' }}>
              <Box sx={{ 
                height: '100%', 
                bgcolor: 'grey.50',
                borderRadius: 2,
                border: 1,
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <Box sx={{ p: 2, flexGrow: 1, overflowY: 'auto' }}>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                    Email Summary
                  </Typography>
                {compiledSelections.length > 0 ? (
                  <Box>
                    {compiledSelections.map((selection) => {
                      const hasZeroCount = selection.recipientCount === 0 || selection.dataCheckCount === 0;
                      return (
                        <Card 
                          key={selection.groupId} 
                          variant="outlined" 
                          sx={{ 
                            mb: 2,
                            bgcolor: hasZeroCount ? '#ffebee' : 'background.paper',
                            cursor: 'pointer',
                            '&:hover': {
                              boxShadow: 2
                            }
                          }}
                          onClick={() => handleReloadSelection(selection.groupId, selection.recipientCount, selection.dataCheckCount)}
                        >
                          <CardContent sx={{ pb: 1.5, '&:last-child': { pb: 1.5 } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                              <Typography 
                                variant="body2" 
                                fontWeight={600}
                                sx={{ 
                                  color: 'primary.main'
                                }}
                              >
                                {selection.project} - {selection.groupName}
                              </Typography>
                              <IconButton 
                                size="small" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSelection(selection.groupId);
                                }}
                                color="error"
                                title="Delete"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                            
                            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                              <Typography variant="body2" color="text.secondary">
                                Recipients: <strong style={{ 
                                  color: selection.recipientCount === 0 ? '#d32f2f' : '#2e7d32',
                                  fontWeight: selection.recipientCount === 0 ? 700 : 600
                                }}>{selection.recipientCount}</strong>
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Data Checks: <strong style={{ 
                                  color: selection.dataCheckCount === 0 ? '#d32f2f' : '#2e7d32',
                                  fontWeight: selection.dataCheckCount === 0 ? 700 : 600
                                }}>{selection.dataCheckCount}</strong>
                              </Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Select a distribution group to begin building your email list.
                  </Typography>
                )}
              </Box>
              {compiledSelections.some(s => s.recipientCount === 0 || s.dataCheckCount === 0) && (
                <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: '#ffebee' }}>
                  <Typography variant="body2" color="error" sx={{ fontWeight: 600 }}>
                    Please fix errors before sending email
                  </Typography>
                </Box>
              )}
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseEmailDialog} variant="outlined">
            Cancel
          </Button>
          <Button 
            onClick={handleEmailSend} 
            variant="contained"
            disabled={
              compiledSelections.length === 0 || 
              compiledSelections.some(s => s.recipientCount === 0 || s.dataCheckCount === 0)
            }
          >
            Email
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}