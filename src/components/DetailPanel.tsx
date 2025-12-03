import React from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  TextField, 
  Switch, 
  FormControlLabel, 
  Button, 
  Chip,
  Grid,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileCopy as CopyIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { TreeNode, NodeType } from '../types/adminTypes';
import { adminDataService } from '../services/adminDataService';
import SingleAppForm from './SingleAppForm';
import DataChecksList from './DataChecksList';
import SettingsList from './SettingsList';
import TabDetail from './TabDetail';
import AppsSummary from './AppsSummary';
import DataCheckDetail from './DataCheckDetail';
import SettingDetail from './SettingDetail';
import TabsSummary from './TabsSummary';
import TabSettingsSummary from './TabSettingsSummary';
import CppDetail from './CppDetail';
import ExportZoneDetail from './ExportZoneDetail';
import ExportPresetDetail from './ExportPresetDetail';
import SlotDetail from './SlotDetail';
import EventJobDetail from './EventJobDetail';
import EmailDistributionGroups from './EmailDistributionGroups';

interface DetailPanelProps {
  selectedNode: TreeNode | null;
  onUpdate: (nodeType: NodeType, itemId: string, updates: any) => void;
  onDelete: (nodeType: NodeType, itemId: string) => void;
  onCopy: (nodeType: NodeType, itemId: string) => void;
}

export default function DetailPanel({ selectedNode, onUpdate, onDelete, onCopy }: DetailPanelProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editData, setEditData] = React.useState<any>({});
  const [allApps, setAllApps] = React.useState<any[]>([]);
  const [showNewDataCheckDialog, setShowNewDataCheckDialog] = React.useState(false);
  const [showNewSettingDialog, setShowNewSettingDialog] = React.useState(false);

  React.useEffect(() => {
    setIsEditing(false);
    setEditData(selectedNode?.data || {});
    
    // Load all apps for validation purposes
    const loadAllApps = async () => {
      try {
        const adminData = await adminDataService.getAdminData();
        setAllApps(adminData.apps || []);
      } catch (error) {
        console.error('Error loading apps for validation:', error);
        setAllApps([]);
      }
    };
    
    loadAllApps();
  }, [selectedNode]);

  if (!selectedNode) {
    return (
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Typography variant="h6" color="text.secondary">
          Select an item from the tree to view details
        </Typography>
      </Box>
    );
  }

  const handleEdit = () => {
    setIsEditing(true);
    setEditData(selectedNode.data || {});
  };

  const handleSave = () => {
    onUpdate(selectedNode.nodeType, selectedNode.data?.id, editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData(selectedNode.data || {});
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${selectedNode.label}"?`)) {
      onDelete(selectedNode.nodeType, selectedNode.data?.id);
    }
  };

  const handleCopy = () => {
    onCopy(selectedNode.nodeType, selectedNode.data?.id);
  };

  const canCopy = selectedNode.data?.canCopy === true;
  const hasData = selectedNode.data && Object.keys(selectedNode.data).length > 0;

  // Function to handle Save button for SingleAppForm
  const handleAppSave = () => {
    const form = document.getElementById('single-app-form');
    if (form) {
      const event = new Event('submit', { bubbles: true, cancelable: true });
      form.dispatchEvent(event);
    }
  };

  return (
    <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">{selectedNode.label}</Typography>
        <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
          {isEditing ? (
            <>
              <IconButton onClick={handleSave} color="primary">
                <SaveIcon />
              </IconButton>
              <IconButton onClick={handleCancel}>
                <CancelIcon />
              </IconButton>
            </>
          ) : hasData ? (
            <>
              {/* Add Save button for individual app editing */}
              {selectedNode.nodeType === 'app' && (
                <>
                  <Button 
                    variant="outlined"
                    size="small"
                    startIcon={<AddIcon />}
                    sx={{ mr: 1 }}
                    onClick={() => {/* TODO: Handle new app item */}}
                  >
                    New
                  </Button>
                  <Button 
                    onClick={handleAppSave}
                    variant="contained"
                    size="small"
                    startIcon={<SaveIcon />}
                    sx={{ mr: 1 }}
                  >
                    Save
                  </Button>
                </>
              )}
              {canCopy && (
                <Tooltip title="Copy">
                  <IconButton onClick={handleCopy}>
                    <CopyIcon />
                  </IconButton>
                </Tooltip>
              )}
              {selectedNode.nodeType === 'dataChecks' && (
                <Button 
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => setShowNewDataCheckDialog(true)}
                >
                  New
                </Button>
              )}
              {selectedNode.nodeType === 'settings' && (
                <Button 
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => setShowNewSettingDialog(true)}
                >
                  New
                </Button>
              )}
            </>
          ) : null}
        </Box>
      </Box>

      {renderNodeDetails(selectedNode, isEditing, editData, setEditData, onUpdate, allApps, showNewDataCheckDialog, () => setShowNewDataCheckDialog(false), showNewSettingDialog, () => setShowNewSettingDialog(false))}
    </Box>
  );
}

function renderNodeDetails(
  node: TreeNode, 
  isEditing: boolean, 
  editData: any, 
  setEditData: (data: any) => void, 
  onUpdate: (nodeType: NodeType, itemId: string, updates: any) => void,
  allApps: any[],
  showNewDataCheckDialog: boolean,
  onCloseNewDataCheckDialog: () => void,
  showNewSettingDialog: boolean,
  onCloseNewSettingDialog: () => void
) {
  const updateEditData = (field: string, value: any) => {
    setEditData((prev: any) => ({ ...prev, [field]: value }));
  };

  // If it's a collection node (like "Data Checks", "Settings", etc.), show summary
  if (!node.data || Object.keys(node.data).length === 0) {
    return (
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {getNodeTypeDescription(node.nodeType)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This is a collection node. Select individual items to view and edit their details.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const data = isEditing ? editData : node.data;

  switch (node.nodeType) {
    case 'apps':
      return <AppsSummary data={data} />;
    case 'app':
      return <SingleAppForm app={data} onSave={(updatedApp) => onUpdate('app', updatedApp.id, updatedApp)} allApps={allApps} />;
    case 'dataChecks':
      return <DataChecksList dataChecks={data.dataChecks || []} readOnly={true} showNewDialog={showNewDataCheckDialog} onCloseNewDialog={onCloseNewDataCheckDialog} />;
    case 'dataCheck':
      return <DataCheckDetail data={data} isEditing={isEditing} onUpdate={updateEditData} />;
    case 'settings':
      return <SettingsList settings={data.settings || []} readOnly={true} showNewDialog={showNewSettingDialog} onCloseNewDialog={onCloseNewSettingDialog} />;
    case 'setting':
      return <SettingDetail data={data} isEditing={isEditing} onUpdate={updateEditData} />;
    case 'tabs':
      return <TabsSummary data={data} />;
    case 'tab':
      return <TabDetail tab={data} />;
    case 'tabSettings':
      return <TabSettingsSummary data={data} />;
    case 'cpp':
      return <CppDetail data={data} isEditing={isEditing} onUpdate={updateEditData} />;
    case 'exportZone':
      return <ExportZoneDetail data={data} isEditing={isEditing} onUpdate={updateEditData} />;
    case 'exportPreset':
      return <ExportPresetDetail data={data} isEditing={isEditing} onUpdate={updateEditData} />;
    case 'slot':
      return <SlotDetail data={data} isEditing={isEditing} onUpdate={updateEditData} />;
    case 'eventJob':
      return <EventJobDetail data={data} isEditing={isEditing} onUpdate={updateEditData} />;
    case 'emailDistributionGroups':
      return <EmailDistributionGroups />;
    default:
      return renderGenericDetails(data, isEditing, updateEditData);
  }
}

function getNodeTypeDescription(nodeType: NodeType): string {
  const descriptions = {
    'apps': 'Application Management',
    'app': 'Application Configuration',
    'dataChecks': 'Data Validation Rules',
    'settings': 'Configuration Settings',
    'tab': 'Application Tab',
    'tabSettings': 'Tab-specific Settings',
    'cpps': 'Configuration Preset Packages',
    'exportZones': 'Data Export Destinations',
    'exportPresets': 'Export Configuration Presets',
    'slot': 'Processing Slot',
    'slotExportZones': 'Slot Export Destinations',
    'slotDataChecks': 'Slot Data Validation',
    'globalExportZones': 'Global Export Destinations',
    'eventJobs': 'Automated Event Jobs'
  };
  return descriptions[nodeType] || 'Configuration Item';
}

function renderGenericDetails(data: any, isEditing: boolean, updateEditData: (field: string, value: any) => void) {
  return (
    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>Details</Typography>
        <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.875rem' }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );
}