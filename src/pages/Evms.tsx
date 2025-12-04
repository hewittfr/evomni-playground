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
  const [loading, setLoading] = useState(true);

  // Load data on component mount
  useEffect(() => {
    async function loadData() {
      try {
        const [checksData, groupsData, membersData] = await Promise.all([
          dataService.getDataChecks(),
          dataService.getDistributionGroups(),
          dataService.getMembers()
        ]);
        setDataChecks(checksData);
        setDistributionGroups(groupsData);
        setMembers(membersData);
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
          application: group.application,
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
          application: group.application,
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

  // Get members for selected distribution group
  const selectedGroupMembers = selectedDistGroup 
    ? members.filter(m => m.groupId === selectedDistGroup)
    : [];

  // Get app for selected distribution group
  const selectedGroupApp = selectedDistGroup
    ? distributionGroups.find(g => g.id === selectedDistGroup)?.application
    : null;

  // Get name for selected distribution group
  const selectedGroupName = selectedDistGroup
    ? distributionGroups.find(g => g.id === selectedDistGroup)?.name
    : null;

  const dataCheckColumns: GridColDef[] = [
    { field: 'name', headerName: 'DataCheck Name', flex: 1 },
    { field: 'runtime', headerName: 'Runtime', width: 120 },
    { field: 'issues', headerName: 'Issues', width: 100 }
  ];

  const memberColumns: GridColDef[] = [
    { field: 'lastName', headerName: 'Last Name', flex: 1 },
    { field: 'firstName', headerName: 'First Name', flex: 1 },
    { field: 'memberType', headerName: 'Type', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1.5 }
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', gap: 2 }}>
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

      {/* Bottom Section - 3 sections */}
      <Box sx={{ display: 'flex', gap: 2, flexGrow: 1, minHeight: 0 }}>
        {/* Left Section - Vertical Tabs */}
        <Paper 
          elevation={0} 
          sx={{ 
            width: 250, 
            border: '1px solid', 
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Tabs
            orientation="vertical"
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{ 
              borderRight: 1, 
              borderColor: 'divider',
              '& .MuiTab-root': {
                alignItems: 'flex-start',
                textAlign: 'left'
              }
            }}
          >
            <Tab label="Tab 1" />
            <Tab label="Tab 2" />
            <Tab label="Tab 3" />
          </Tabs>
        </Paper>

        {/* Middle Section - DataGrid */}
        <Paper 
          elevation={0} 
          sx={{ 
            flex: 1, 
            border: '1px solid', 
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle1">DataChecks - Set 1</Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <DataGrid
              rows={dataChecks.slice(0, 4)}
              columns={dataCheckColumns}
              checkboxSelection
              disableRowSelectionOnClick
              density="compact"
              rowSelectionModel={leftGridSelection}
              onRowSelectionModelChange={setLeftGridSelection}
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

        {/* Right Section - DataGrid */}
        <Paper 
          elevation={0} 
          sx={{ 
            flex: 1, 
            border: '1px solid', 
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle1">DataChecks - Set 2</Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <DataGrid
              rows={dataChecks.slice(4)}
              columns={dataCheckColumns}
              checkboxSelection
              disableRowSelectionOnClick
              density="compact"
              rowSelectionModel={rightGridSelection}
              onRowSelectionModelChange={setRightGridSelection}
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
                    g.application === app && 
                    (g.name.toLowerCase().includes(groupSearchText.toLowerCase()) ||
                     g.application.toLowerCase().includes(groupSearchText.toLowerCase()))
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
            <Box sx={{ width: '38%', height: '100%', overflow: 'hidden' }}>
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
                        columns={dataCheckColumns}
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
                        columns={memberColumns}
                        checkboxSelection
                        disableRowSelectionOnClick
                        density="compact"
                        rowSelectionModel={selectedMembers}
                        onRowSelectionModelChange={handleMemberSelectionChange}
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
            <Box sx={{ width: '38%', height: '100%' }}>
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
                                {selection.application} - {selection.groupName}
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