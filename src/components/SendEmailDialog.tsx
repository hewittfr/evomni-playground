import React from 'react';
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Chip,
  TextField,
  InputAdornment,
  Card,
  CardContent
} from '@mui/material';
import { DataGrid, GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';

interface CompiledSelection {
  groupId: number;
  groupName: string;
  project: string;
  recipientCount: number;
  dataCheckCount: number;
  selectedMemberIds: (string | number)[];
  selectedDataCheckIds: number[];
}

interface DistributionGroup {
  id: number;
  name: string;
  key: string;
  project: string;
  memberCount: number;
  members: any[];
}

interface SendEmailDialogProps {
  open: boolean;
  onClose: () => void;
  onSend: () => void;
  distributionGroups: DistributionGroup[];
  members: any[];
  dataChecks: any[];
  selectedDistGroup: number | null;
  setSelectedDistGroup: (id: number | null) => void;
  selectedMembers: GridRowSelectionModel;
  selectedDataChecks: GridRowSelectionModel;
  onMemberSelectionChange: (selection: GridRowSelectionModel) => void;
  onDataCheckSelectionChange: (selection: GridRowSelectionModel) => void;
  compiledSelections: CompiledSelection[];
  onDeleteSelection: (groupId: number) => void;
  onReloadSelection: (groupId: number, recipientCount: number, dataCheckCount: number) => void;
  memberColumns: GridColDef[];
  dataCheckColumns: GridColDef[];
}

export default function SendEmailDialog({
  open,
  onClose,
  onSend,
  distributionGroups,
  members,
  dataChecks,
  selectedDistGroup,
  setSelectedDistGroup,
  selectedMembers,
  selectedDataChecks,
  onMemberSelectionChange,
  onDataCheckSelectionChange,
  compiledSelections,
  onDeleteSelection,
  onReloadSelection,
  memberColumns,
  dataCheckColumns
}: SendEmailDialogProps) {
  const [groupSearchText, setGroupSearchText] = React.useState('');

  const handleClose = () => {
    setGroupSearchText('');
    onClose();
  };

  const selectedGroup = distributionGroups.find(g => g.id === selectedDistGroup);
  const selectedGroupApp = selectedGroup?.project || null;
  const selectedGroupName = selectedGroup?.name || null;

  const hasErrors = compiledSelections.some(s => s.recipientCount === 0 || s.dataCheckCount === 0);

  // Get schedulers from the selected group for owner assignment
  const schedulersInGroup = members.filter(m => m.memberRole === 'Scheduler');

  // Create enhanced dataCheck columns with Owner column
  const dataCheckColumnsWithOwner: GridColDef[] = [
    dataCheckColumns[0], // DataCheck Name column
    {
      field: 'owner',
      headerName: 'Owner',
      flex: 1,
      valueGetter: (params) => {
        if (schedulersInGroup.length === 0) return '-';
        
        // Distribute data checks across schedulers evenly
        const dataCheckIndex = dataChecks.findIndex(dc => dc.id === params.row.id);
        const schedulerIndex = dataCheckIndex % schedulersInGroup.length;
        const owner = schedulersInGroup[schedulerIndex];
        return owner ? `${owner.lastName}, ${owner.firstName}` : '-';
      }
    },
    ...dataCheckColumns.slice(1) // Issues and other columns
  ];

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xl"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Send Email
        <IconButton
          edge="end"
          color="inherit"
          onClick={handleClose}
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
                  if (groupsForApp.length === 0) return null;
                  
                  return (
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
                            onClick={() => setSelectedDistGroup(group.id)}
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

          {/* Column 2 - Members & DataChecks DataGrids */}
          <Box sx={{ width: '50%', height: '100%', overflow: 'hidden' }}>
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                      rows={members}
                      columns={memberColumns}
                      checkboxSelection
                      disableRowSelectionOnClick
                      density="compact"
                      rowSelectionModel={selectedMembers}
                      onRowSelectionModelChange={onMemberSelectionChange}
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
                    {selectedGroupName ? `${selectedGroupName} Data Checks` : 'Data Checks'}
                  </Typography>
                </Box>
                <Box sx={{ flexGrow: 1, minHeight: 0, overflow: 'hidden' }}>
                  {selectedDistGroup ? (
                    <DataGrid
                      rows={dataChecks}
                      columns={dataCheckColumnsWithOwner}
                      checkboxSelection
                      disableRowSelectionOnClick
                      density="compact"
                      rowSelectionModel={selectedDataChecks}
                      onRowSelectionModelChange={onDataCheckSelectionChange}
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
            </Box>
          </Box>

          {/* Column 3 - Email Summary */}
          <Box sx={{ width: '26%', height: '100%' }}>
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
                          onClick={() => onReloadSelection(selection.groupId, selection.recipientCount, selection.dataCheckCount)}
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
                                  onDeleteSelection(selection.groupId);
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
              {hasErrors && (
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
        <Button onClick={handleClose} variant="outlined">
          Cancel
        </Button>
        <Button 
          onClick={onSend} 
          variant="contained"
          disabled={compiledSelections.length === 0 || hasErrors}
        >
          Email
        </Button>
      </DialogActions>
    </Dialog>
  );
}
