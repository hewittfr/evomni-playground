import React from 'react';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { Box, Typography } from '@mui/material';
import { 
  Apps as AppsIcon,
  Settings as SettingsIcon,
  Tab as TabIcon,
  DataObject as DataObjectIcon,
  CloudUpload as CloudUploadIcon,
  Inventory as InventoryIcon,
  CheckCircle as CheckCircleIcon,
  Event as EventIcon,
  DateRange as DateRangeIcon,
  FolderOpen as FolderOpenIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { TreeNode, AdminData, NodeType } from '../types/adminTypes';

interface AdminTreeViewProps {
  data: AdminData;
  selectedNodeId: string | null;
  onNodeSelect: (node: TreeNode) => void;
  expandedNodes: string[];
  onExpandedNodesChange: (nodeIds: string[]) => void;
}

export default function AdminTreeView({ 
  data, 
  selectedNodeId, 
  onNodeSelect, 
  expandedNodes, 
  onExpandedNodesChange 
}: AdminTreeViewProps) {
  const treeData = buildTreeData(data);

  const handleNodeSelect = (event: React.SyntheticEvent, selectedItems: string[]) => {
    // Get the selected item ID
    let nodeId: string | null = null;
    
    if (Array.isArray(selectedItems)) {
      nodeId = selectedItems.length > 0 ? selectedItems[0] : null;
    } else {
      // Handle case where it's passed as a string incorrectly
      nodeId = selectedItems as any;
    }
    
    if (nodeId) {
      const node = findNodeById(treeData, nodeId);
      if (node) {
        onNodeSelect(node);
      }
    }
  };

  const handleExpandedItemsChange = (event: React.SyntheticEvent, nodeIds: string[]) => {
    onExpandedNodesChange(nodeIds);
  };

  return (
    <Box sx={{ height: '100%', overflow: 'auto' }} className="admin-tree-view">
      <Typography variant="h6" sx={{ p: 2, pb: 1, fontWeight: 600 }}>
        System Administration
      </Typography>
      <SimpleTreeView
        selectedItems={selectedNodeId ? [selectedNodeId] : []}
        onSelectedItemsChange={handleNodeSelect}
        expandedItems={expandedNodes}
        onExpandedItemsChange={handleExpandedItemsChange}
        sx={{ px: 1 }}
      >
        {treeData.map((node) => renderTreeNode(node))}
      </SimpleTreeView>
    </Box>
  );
}

function renderTreeNode(node: TreeNode): React.ReactNode {
  const icon = getNodeIcon(node.nodeType);
  
  return (
    <TreeItem 
      key={node.id} 
      itemId={node.id} 
      label={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
          {icon}
          <Typography variant="body2" sx={{ fontWeight: node.children ? 600 : 400 }}>
            {node.label}
          </Typography>
        </Box>
      }
    >
      {node.children?.map((child) => renderTreeNode(child))}
    </TreeItem>
  );
}

function getNodeIcon(nodeType: NodeType) {
  const iconProps = { fontSize: 'small' as const, sx: { color: 'text.secondary' } };
  
  switch (nodeType) {
    case 'apps':
      return <AppsIcon {...iconProps} sx={{ color: 'primary.main' }} />;
    case 'app':
      return <AppsIcon {...iconProps} sx={{ color: 'primary.main' }} />;
    case 'dataChecks':
    case 'dataCheck':
    case 'slotDataChecks':
      return <CheckCircleIcon {...iconProps} sx={{ color: 'success.main' }} />;
    case 'settings':
    case 'setting':
    case 'tabSettings':
      return <SettingsIcon {...iconProps} />;
    case 'tabs':
    case 'tab':
      return <TabIcon {...iconProps} sx={{ color: 'info.main' }} />;
    case 'cpps':
    case 'cpp':
      return <DateRangeIcon {...iconProps} sx={{ color: 'secondary.main' }} />;
    case 'exportZones':
    case 'exportZone':
    case 'slotExportZones':
    case 'globalExportZones':
      return <CloudUploadIcon {...iconProps} sx={{ color: 'warning.main' }} />;
    case 'exportPresets':
    case 'exportPreset':
      return <InventoryIcon {...iconProps} sx={{ color: 'warning.main' }} />;
    case 'slot':
      return <DataObjectIcon {...iconProps} sx={{ color: 'info.main' }} />;
    case 'eventJobs':
    case 'eventJob':
      return <EventIcon {...iconProps} sx={{ color: 'error.main' }} />;
    case 'emailDistributionGroups':
      return <EmailIcon {...iconProps} sx={{ color: 'primary.main' }} />;
    default:
      return <FolderOpenIcon {...iconProps} />;
  }
}

function buildTreeData(data: AdminData): TreeNode[] {
  const rootNodes: TreeNode[] = [];

  // Build App Modules section
  const appsNode: TreeNode = {
    id: 'apps',
    label: `App Modules (${data.apps.length})`,
    nodeType: 'apps' as NodeType,
    data: { apps: data.apps },  // Store all apps data for the form
    children: []
  };

  data.apps.forEach((app) => {
    const appNode: TreeNode = {
      id: `app-${app.id}`,
      label: app.name,
      nodeType: 'app',
      data: app,
      children: []
    };

    // Audit Checks
    if (app.dataChecks.length > 0) {
      const dataChecksNode: TreeNode = {
        id: `app-${app.id}-dataChecks`,
        label: `Audit Checks (${app.dataChecks.length})`,
        nodeType: 'dataChecks',
        appId: app.id,
        data: { dataChecks: app.dataChecks }  // Store all data checks in the node itself
        // No children - this is now a leaf node
      };
      appNode.children!.push(dataChecksNode);
    }

    // App Settings
    if (app.settings.length > 0) {
      const settingsNode: TreeNode = {
        id: `app-${app.id}-settings`,
        label: `App Settings (${app.settings.length})`,
        nodeType: 'settings',
        appId: app.id,
        data: { settings: app.settings }  // Store all settings in the node itself
        // No children - this is now a leaf node
      };
      appNode.children!.push(settingsNode);
    }

    // Tabs - expand to show each tab with children
    if (app.tabs.length > 0) {
      const tabsNode: TreeNode = {
        id: `app-${app.id}-tabs`,
        label: `Tabs (${app.tabs.length})`,
        nodeType: 'tabs',
        appId: app.id,
        data: { tabs: app.tabs },
        children: app.tabs.map((tab) => {
          const tabNode: TreeNode = {
            id: `tab-${tab.id}`,
            label: tab.name,
            nodeType: 'tab',
            data: tab,
            children: []
          };

          // Tab Settings
          if (tab.settings && tab.settings.length > 0) {
            tabNode.children!.push({
              id: `tab-${tab.id}-settings`,
              label: `Tab Settings (${tab.settings.length})`,
              nodeType: 'tabSettings',
              data: { settings: tab.settings }
            });
          }

          // Audit Clusters
          if (tab.slots && tab.slots.length > 0) {
            tabNode.children!.push({
              id: `tab-${tab.id}-slots`,
              label: `Audit Clusters (${tab.slots.length})`,
              nodeType: 'slot',
              data: { slots: tab.slots }
            });
          }

          // Export Presets
          if (tab.exportPresets && tab.exportPresets.length > 0) {
            tabNode.children!.push({
              id: `tab-${tab.id}-exportPresets`,
              label: `Export Presets (${tab.exportPresets.length})`,
              nodeType: 'exportPresets',
              data: { exportPresets: tab.exportPresets }
            });
          }

          // Export Zones
          if (tab.exportZones && tab.exportZones.length > 0) {
            tabNode.children!.push({
              id: `tab-${tab.id}-exportZones`,
              label: `Export Zones (${tab.exportZones.length})`,
              nodeType: 'exportZones',
              data: { exportZones: tab.exportZones }
            });
          }

          // CPPs
          if (tab.cpps && tab.cpps.length > 0) {
            tabNode.children!.push({
              id: `tab-${tab.id}-cpps`,
              label: `CPP Inputs (${tab.cpps.length})`,
              nodeType: 'cpps',
              data: { cpps: tab.cpps }
            });
          }

          return tabNode;
        })
      };
      appNode.children!.push(tabsNode);
    }

    appsNode.children!.push(appNode);
  });

  // Add App Modules node to root
  rootNodes.push(appsNode);

  // Export Zones (rename from Global Export Zones)
  if (data.globalExportZones.length > 0) {
    const exportZonesNode: TreeNode = {
      id: 'exportZones',
      label: `Export Zones (${data.globalExportZones.length})`,
      nodeType: 'globalExportZones',
      children: data.globalExportZones.map((zone) => ({
        id: `exportZone-${zone.id}`,
        label: zone.name,
        nodeType: 'exportZone',
        data: zone
      }))
    };
    rootNodes.push(exportZonesNode);
  }

  return rootNodes;
}

function findNodeById(nodes: TreeNode[], id: string): TreeNode | null {
  for (const node of nodes) {
    if (node.id === id) {
      return node;
    }
    if (node.children) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

function getAllNodeIds(nodes: TreeNode[]): string[] {
  const ids: string[] = [];
  for (const node of nodes) {
    ids.push(node.id);
    if (node.children) {
      ids.push(...getAllNodeIds(node.children));
    }
  }
  return ids;
}