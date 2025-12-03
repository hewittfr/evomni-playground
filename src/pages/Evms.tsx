import React, { useState } from 'react';
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

// Mock data for datagrids
const mockDataChecks = [
  { id: 1, name: 'Budget Validation', runtime: '2.3s', issues: 3 },
  { id: 2, name: 'Resource Allocation', runtime: '1.8s', issues: 0 },
  { id: 3, name: 'Timeline Consistency', runtime: '3.1s', issues: 5 },
  { id: 4, name: 'Cost Analysis', runtime: '2.7s', issues: 2 },
  { id: 5, name: 'Performance Metrics', runtime: '1.5s', issues: 1 },
  { id: 6, name: 'Variance Check', runtime: '2.9s', issues: 4 },
  { id: 7, name: 'Baseline Validation', runtime: '2.2s', issues: 0 },
  { id: 8, name: 'EAC Calculation', runtime: '3.5s', issues: 2 }
];

// Mock distribution groups organized by application
const mockDistributionGroups = [
  { id: 1, name: 'Project Managers', application: 'EM', memberCount: 12 },
  { id: 2, name: 'Engineering Team', application: 'EM', memberCount: 8 },
  { id: 3, name: 'Project Leads', application: 'CAP-1', memberCount: 11 },
  { id: 4, name: 'Technical Leads', application: 'CAP-1', memberCount: 6 },
  { id: 5, name: 'Finance Department', application: 'CAP-2', memberCount: 15 },
  { id: 6, name: 'Budget Analysts', application: 'CAP-2', memberCount: 7 },
  { id: 7, name: 'Executive Leadership', application: 'CAP-3', memberCount: 5 },
  { id: 8, name: 'Program Directors', application: 'CAP-3', memberCount: 9 },
  { id: 9, name: 'Operations Team', application: 'X-326', memberCount: 14 },
  { id: 10, name: 'Site Managers', application: 'X-326', memberCount: 6 },
  { id: 11, name: 'Quality Assurance', application: 'X-333', memberCount: 10 },
  { id: 12, name: 'Compliance Team', application: 'X-333', memberCount: 8 }
];

// Mock members data matching EmailDistributionGroups structure
const mockMembers = [
  // Group 1 - Project Managers (EM)
  { id: 'm1', lastName: 'Smith', firstName: 'John', memberType: 'Manager', email: 'john.smith@example.com', groupId: 1 },
  { id: 'm2', lastName: 'Johnson', firstName: 'Sarah', memberType: 'Project Lead', email: 'sarah.johnson@example.com', groupId: 1 },
  { id: 'm3', lastName: 'Williams', firstName: 'Michael', memberType: 'Scheduler', email: 'michael.williams@example.com', groupId: 1 },
  { id: 'm4', lastName: 'Brown', firstName: 'Emily', memberType: 'Scheduler', email: 'emily.brown@example.com', groupId: 1 },
  { id: 'm5', lastName: 'Davis', firstName: 'David', memberType: 'Scheduler', email: 'david.davis@example.com', groupId: 1 },
  { id: 'm6', lastName: 'Miller', firstName: 'Jennifer', memberType: 'Scheduler', email: 'jennifer.miller@example.com', groupId: 1 },
  { id: 'm7', lastName: 'Wilson', firstName: 'Robert', memberType: 'Scheduler', email: 'robert.wilson@example.com', groupId: 1 },
  { id: 'm8', lastName: 'Moore', firstName: 'Linda', memberType: 'Scheduler', email: 'linda.moore@example.com', groupId: 1 },
  { id: 'm9', lastName: 'Taylor', firstName: 'James', memberType: 'Scheduler', email: 'james.taylor@example.com', groupId: 1 },
  { id: 'm10', lastName: 'Anderson', firstName: 'Mary', memberType: 'Scheduler', email: 'mary.anderson@example.com', groupId: 1 },
  { id: 'm11', lastName: 'Thomas', firstName: 'Christopher', memberType: 'Scheduler', email: 'christopher.thomas@example.com', groupId: 1 },
  { id: 'm12', lastName: 'Jackson', firstName: 'Patricia', memberType: 'Scheduler', email: 'patricia.jackson@example.com', groupId: 1 },
  
  // Group 2 - Engineering Team (EM)
  { id: 'm13', lastName: 'White', firstName: 'Daniel', memberType: 'Manager', email: 'daniel.white@example.com', groupId: 2 },
  { id: 'm14', lastName: 'Harris', firstName: 'Jessica', memberType: 'Engineer', email: 'jessica.harris@example.com', groupId: 2 },
  { id: 'm15', lastName: 'Martin', firstName: 'Matthew', memberType: 'Engineer', email: 'matthew.martin@example.com', groupId: 2 },
  { id: 'm16', lastName: 'Thompson', firstName: 'Ashley', memberType: 'Engineer', email: 'ashley.thompson@example.com', groupId: 2 },
  { id: 'm17', lastName: 'Garcia', firstName: 'Joshua', memberType: 'Engineer', email: 'joshua.garcia@example.com', groupId: 2 },
  { id: 'm18', lastName: 'Martinez', firstName: 'Amanda', memberType: 'Engineer', email: 'amanda.martinez@example.com', groupId: 2 },
  { id: 'm19', lastName: 'Robinson', firstName: 'Andrew', memberType: 'Engineer', email: 'andrew.robinson@example.com', groupId: 2 },
  { id: 'm20', lastName: 'Clark', firstName: 'Stephanie', memberType: 'Engineer', email: 'stephanie.clark@example.com', groupId: 2 },
  
  // Group 3 - Project Leads (CAP-1)
  { id: 'm21', lastName: 'Rodriguez', firstName: 'Kevin', memberType: 'Manager', email: 'kevin.rodriguez@example.com', groupId: 3 },
  { id: 'm22', lastName: 'Lewis', firstName: 'Nicole', memberType: 'Project Lead', email: 'nicole.lewis@example.com', groupId: 3 },
  { id: 'm23', lastName: 'Lee', firstName: 'Brian', memberType: 'Project Lead', email: 'brian.lee@example.com', groupId: 3 },
  { id: 'm24', lastName: 'Walker', firstName: 'Michelle', memberType: 'Project Lead', email: 'michelle.walker@example.com', groupId: 3 },
  { id: 'm25', lastName: 'Hall', firstName: 'Ryan', memberType: 'Project Lead', email: 'ryan.hall@example.com', groupId: 3 },
  { id: 'm26', lastName: 'Allen', firstName: 'Lauren', memberType: 'Project Lead', email: 'lauren.allen@example.com', groupId: 3 },
  { id: 'm27', lastName: 'Young', firstName: 'Jason', memberType: 'Project Lead', email: 'jason.young@example.com', groupId: 3 },
  { id: 'm28', lastName: 'King', firstName: 'Rebecca', memberType: 'Project Lead', email: 'rebecca.king@example.com', groupId: 3 },
  { id: 'm29', lastName: 'Wright', firstName: 'Eric', memberType: 'Project Lead', email: 'eric.wright@example.com', groupId: 3 },
  { id: 'm30', lastName: 'Scott', firstName: 'Megan', memberType: 'Project Lead', email: 'megan.scott@example.com', groupId: 3 },
  { id: 'm31', lastName: 'Green', firstName: 'Justin', memberType: 'Project Lead', email: 'justin.green@example.com', groupId: 3 },
  
  // Group 4 - Technical Leads (CAP-1)
  { id: 'm32', lastName: 'Adams', firstName: 'Rachel', memberType: 'Manager', email: 'rachel.adams@example.com', groupId: 4 },
  { id: 'm33', lastName: 'Baker', firstName: 'Tyler', memberType: 'Technical Lead', email: 'tyler.baker@example.com', groupId: 4 },
  { id: 'm34', lastName: 'Nelson', firstName: 'Samantha', memberType: 'Technical Lead', email: 'samantha.nelson@example.com', groupId: 4 },
  { id: 'm35', lastName: 'Carter', firstName: 'Brandon', memberType: 'Technical Lead', email: 'brandon.carter@example.com', groupId: 4 },
  { id: 'm36', lastName: 'Mitchell', firstName: 'Katherine', memberType: 'Technical Lead', email: 'katherine.mitchell@example.com', groupId: 4 },
  { id: 'm37', lastName: 'Perez', firstName: 'Dylan', memberType: 'Technical Lead', email: 'dylan.perez@example.com', groupId: 4 },
  
  // Group 5 - Finance Department (CAP-2)
  { id: 'm38', lastName: 'Roberts', firstName: 'Olivia', memberType: 'Manager', email: 'olivia.roberts@example.com', groupId: 5 },
  { id: 'm39', lastName: 'Turner', firstName: 'Nathan', memberType: 'Analyst', email: 'nathan.turner@example.com', groupId: 5 },
  { id: 'm40', lastName: 'Phillips', firstName: 'Hannah', memberType: 'Analyst', email: 'hannah.phillips@example.com', groupId: 5 },
  { id: 'm41', lastName: 'Campbell', firstName: 'Zachary', memberType: 'Analyst', email: 'zachary.campbell@example.com', groupId: 5 },
  { id: 'm42', lastName: 'Parker', firstName: 'Emma', memberType: 'Analyst', email: 'emma.parker@example.com', groupId: 5 },
  { id: 'm43', lastName: 'Evans', firstName: 'Alexander', memberType: 'Analyst', email: 'alexander.evans@example.com', groupId: 5 },
  { id: 'm44', lastName: 'Edwards', firstName: 'Grace', memberType: 'Analyst', email: 'grace.edwards@example.com', groupId: 5 },
  { id: 'm45', lastName: 'Collins', firstName: 'Ethan', memberType: 'Analyst', email: 'ethan.collins@example.com', groupId: 5 },
  
  // Group 6 - Budget Analysts (CAP-2)
  { id: 'm46', lastName: 'Stewart', firstName: 'Victoria', memberType: 'Manager', email: 'victoria.stewart@example.com', groupId: 6 },
  { id: 'm47', lastName: 'Morris', firstName: 'Jacob', memberType: 'Budget Analyst', email: 'jacob.morris@example.com', groupId: 6 },
  { id: 'm48', lastName: 'Rogers', firstName: 'Alexis', memberType: 'Budget Analyst', email: 'alexis.rogers@example.com', groupId: 6 },
  { id: 'm49', lastName: 'Reed', firstName: 'Connor', memberType: 'Budget Analyst', email: 'connor.reed@example.com', groupId: 6 },
  { id: 'm50', lastName: 'Cook', firstName: 'Madison', memberType: 'Budget Analyst', email: 'madison.cook@example.com', groupId: 6 },
  { id: 'm51', lastName: 'Morgan', firstName: 'Lucas', memberType: 'Budget Analyst', email: 'lucas.morgan@example.com', groupId: 6 },
  { id: 'm52', lastName: 'Bell', firstName: 'Sophia', memberType: 'Budget Analyst', email: 'sophia.bell@example.com', groupId: 6 },
  
  // Group 7 - Executive Leadership (CAP-3)
  { id: 'm53', lastName: 'Murphy', firstName: 'Benjamin', memberType: 'Executive', email: 'benjamin.murphy@example.com', groupId: 7 },
  { id: 'm54', lastName: 'Bailey', firstName: 'Isabella', memberType: 'Executive', email: 'isabella.bailey@example.com', groupId: 7 },
  { id: 'm55', lastName: 'Rivera', firstName: 'Noah', memberType: 'Executive', email: 'noah.rivera@example.com', groupId: 7 },
  { id: 'm56', lastName: 'Cooper', firstName: 'Ava', memberType: 'Executive', email: 'ava.cooper@example.com', groupId: 7 },
  { id: 'm57', lastName: 'Richardson', firstName: 'Mason', memberType: 'Executive', email: 'mason.richardson@example.com', groupId: 7 },
  
  // Group 8 - Program Directors (CAP-3)
  { id: 'm58', lastName: 'Cox', firstName: 'Lily', memberType: 'Manager', email: 'lily.cox@example.com', groupId: 8 },
  { id: 'm59', lastName: 'Howard', firstName: 'Logan', memberType: 'Director', email: 'logan.howard@example.com', groupId: 8 },
  { id: 'm60', lastName: 'Ward', firstName: 'Chloe', memberType: 'Director', email: 'chloe.ward@example.com', groupId: 8 },
  { id: 'm61', lastName: 'Torres', firstName: 'Carter', memberType: 'Director', email: 'carter.torres@example.com', groupId: 8 },
  { id: 'm62', lastName: 'Peterson', firstName: 'Zoe', memberType: 'Director', email: 'zoe.peterson@example.com', groupId: 8 },
  { id: 'm63', lastName: 'Gray', firstName: 'Jackson', memberType: 'Director', email: 'jackson.gray@example.com', groupId: 8 },
  { id: 'm64', lastName: 'Ramirez', firstName: 'Ella', memberType: 'Director', email: 'ella.ramirez@example.com', groupId: 8 },
  { id: 'm65', lastName: 'James', firstName: 'Sebastian', memberType: 'Director', email: 'sebastian.james@example.com', groupId: 8 },
  { id: 'm66', lastName: 'Watson', firstName: 'Aria', memberType: 'Director', email: 'aria.watson@example.com', groupId: 8 },
  
  // Group 9 - Operations Team (X-326)
  { id: 'm67', lastName: 'Brooks', firstName: 'Luke', memberType: 'Manager', email: 'luke.brooks@example.com', groupId: 9 },
  { id: 'm68', lastName: 'Kelly', firstName: 'Natalie', memberType: 'Operations', email: 'natalie.kelly@example.com', groupId: 9 },
  { id: 'm69', lastName: 'Sanders', firstName: 'Owen', memberType: 'Operations', email: 'owen.sanders@example.com', groupId: 9 },
  { id: 'm70', lastName: 'Price', firstName: 'Leah', memberType: 'Operations', email: 'leah.price@example.com', groupId: 9 },
  { id: 'm71', lastName: 'Bennett', firstName: 'Isaac', memberType: 'Operations', email: 'isaac.bennett@example.com', groupId: 9 },
  { id: 'm72', lastName: 'Wood', firstName: 'Addison', memberType: 'Operations', email: 'addison.wood@example.com', groupId: 9 },
  { id: 'm73', lastName: 'Barnes', firstName: 'Gabriel', memberType: 'Operations', email: 'gabriel.barnes@example.com', groupId: 9 },
  
  // Group 10 - Site Managers (X-326)
  { id: 'm74', lastName: 'Ross', firstName: 'Aubrey', memberType: 'Manager', email: 'aubrey.ross@example.com', groupId: 10 },
  { id: 'm75', lastName: 'Henderson', firstName: 'Wyatt', memberType: 'Site Manager', email: 'wyatt.henderson@example.com', groupId: 10 },
  { id: 'm76', lastName: 'Coleman', firstName: 'Scarlett', memberType: 'Site Manager', email: 'scarlett.coleman@example.com', groupId: 10 },
  { id: 'm77', lastName: 'Jenkins', firstName: 'Julian', memberType: 'Site Manager', email: 'julian.jenkins@example.com', groupId: 10 },
  { id: 'm78', lastName: 'Perry', firstName: 'Penelope', memberType: 'Site Manager', email: 'penelope.perry@example.com', groupId: 10 },
  { id: 'm79', lastName: 'Powell', firstName: 'Leo', memberType: 'Site Manager', email: 'leo.powell@example.com', groupId: 10 },
  
  // Group 11 - Quality Assurance (X-333)
  { id: 'm80', lastName: 'Long', firstName: 'Layla', memberType: 'Manager', email: 'layla.long@example.com', groupId: 11 },
  { id: 'm81', lastName: 'Patterson', firstName: 'Levi', memberType: 'QA Analyst', email: 'levi.patterson@example.com', groupId: 11 },
  { id: 'm82', lastName: 'Hughes', firstName: 'Aurora', memberType: 'QA Analyst', email: 'aurora.hughes@example.com', groupId: 11 },
  { id: 'm83', lastName: 'Flores', firstName: 'Lincoln', memberType: 'QA Analyst', email: 'lincoln.flores@example.com', groupId: 11 },
  { id: 'm84', lastName: 'Washington', firstName: 'Nova', memberType: 'QA Analyst', email: 'nova.washington@example.com', groupId: 11 },
  { id: 'm85', lastName: 'Butler', firstName: 'Henry', memberType: 'QA Analyst', email: 'henry.butler@example.com', groupId: 11 },
  
  // Group 12 - Compliance Team (X-333)
  { id: 'm86', lastName: 'Simmons', firstName: 'Bella', memberType: 'Manager', email: 'bella.simmons@example.com', groupId: 12 },
  { id: 'm87', lastName: 'Foster', firstName: 'Caleb', memberType: 'Compliance', email: 'caleb.foster@example.com', groupId: 12 },
  { id: 'm88', lastName: 'Gonzales', firstName: 'Hazel', memberType: 'Compliance', email: 'hazel.gonzales@example.com', groupId: 12 },
  { id: 'm89', lastName: 'Bryant', firstName: 'Liam', memberType: 'Compliance', email: 'liam.bryant@example.com', groupId: 12 },
  { id: 'm90', lastName: 'Alexander', firstName: 'Violet', memberType: 'Compliance', email: 'violet.alexander@example.com', groupId: 12 },
  { id: 'm91', lastName: 'Russell', firstName: 'Elijah', memberType: 'Compliance', email: 'elijah.russell@example.com', groupId: 12 },
  { id: 'm92', lastName: 'Griffin', firstName: 'Lucy', memberType: 'Compliance', email: 'lucy.griffin@example.com', groupId: 12 },
  { id: 'm93', lastName: 'Diaz', firstName: 'Oliver', memberType: 'Compliance', email: 'oliver.diaz@example.com', groupId: 12 },
];

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
      const group = mockDistributionGroups.find(g => g.id === selectedDistGroup);
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
      const group = mockDistributionGroups.find(g => g.id === selectedDistGroup);
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
    ? mockMembers.filter(m => m.groupId === selectedDistGroup)
    : [];

  // Get app for selected distribution group
  const selectedGroupApp = selectedDistGroup
    ? mockDistributionGroups.find(g => g.id === selectedDistGroup)?.application
    : null;

  // Get name for selected distribution group
  const selectedGroupName = selectedDistGroup
    ? mockDistributionGroups.find(g => g.id === selectedDistGroup)?.name
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
              rows={mockDataChecks.slice(0, 4)}
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
              rows={mockDataChecks.slice(4)}
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
                  const groupsForApp = mockDistributionGroups.filter(g => 
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
                        rows={mockDataChecks}
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