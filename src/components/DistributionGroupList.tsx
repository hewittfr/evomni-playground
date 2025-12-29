import React from 'react';
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
  Chip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import GroupIcon from '@mui/icons-material/Group';
import AddIcon from '@mui/icons-material/Add';

interface DistributionGroup {
  id: string;
  name: string;
  key: string;
  project?: string;
  description?: string;
  status: 'Active' | 'Inactive';
  members: any[];
}

interface DistributionGroupListProps {
  groups: DistributionGroup[];
  selectedGroupId: string | null;
  onSelectGroup: (groupId: string) => void;
  onNewGroup: () => void;
}

const DistributionGroupList: React.FC<DistributionGroupListProps> = ({
  groups,
  selectedGroupId,
  onSelectGroup,
  onNewGroup
}) => {
  const [searchText, setSearchText] = React.useState('');

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
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
          <Button variant="contained" size="small" onClick={onNewGroup} startIcon={<AddIcon />}>
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
              onClick={() => onSelectGroup(group.id)}
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
  );
};

export default DistributionGroupList;
