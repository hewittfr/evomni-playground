export interface DataCheck {
  id: string;
  name: string;
  description?: string;
  key: string;
  sqlSelect: string;
  sortOrder: number;
  status: 'Active' | 'Inactive';
  rules: string[];
  isShared: boolean;
}

export interface Settings {
  id: string;
  key: string;
  name: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  description?: string;
  status: 'Active' | 'Inactive';
}

export interface ExportZone {
  id: string;
  name: string;
  description?: string;
  key: string;
  debugPath: string;
  releasePath: string;
  sortOrder: number;
  status: 'Active' | 'Inactive';
  targetPath?: string;
  format?: 'csv' | 'json' | 'xml';
  isActive?: boolean;
}

export interface ExportPreset {
  id: string;
  name: string;
  description?: string;
  key: string;
  presetSettings?: string;
  sortOrder: number;
  status: 'Active' | 'Inactive';
  zones: string[]; // ExportZone IDs
  schedule?: string;
  canCopy: boolean;
}

export interface CPP {
  id: string;
  name: string;
  description?: string;
  configuration: any;
  canCopy: boolean;
}

export interface Slot {
  id: string;
  name: string;
  description?: string;
  settings: Settings[];
  exportZones: ExportZone[];
  dataChecks: DataCheck[];
}

export interface Tab {
  id: string;
  name: string;
  description?: string;
  key: string;
  sortOrder: number;
  status: 'Active' | 'Inactive';
  settings: Settings[];
  cpps: CPP[];
  exportZones: ExportZone[];
  exportPresets: ExportPreset[];
  slots: Slot[];
}

export interface App {
  id: string;
  name: 'EVMS' | 'EVCSA' | 'EVFC';
  key: string;
  description?: string;
  status: 'Active' | 'Inactive';
  dataChecks: DataCheck[];
  settings: Settings[];
  tabs: Tab[];
}

export interface EventJob {
  id: string;
  name: string;
  description?: string;
  trigger: string;
  action: string;
  isActive: boolean;
  schedule?: string;
}

export interface AdminData {
  apps: App[];
  globalExportZones: ExportZone[];
  eventJobs: EventJob[];
}

export type NodeType = 'apps' | 'app' | 'dataChecks' | 'settings' | 'tabs' | 'tab' | 'tabSettings' | 'cpps' | 'exportZones' | 'exportPresets' | 'slot' | 'slotExportZones' | 'slotDataChecks' | 'globalExportZones' | 'eventJobs' | 'cpp' | 'exportPreset' | 'exportZone' | 'setting' | 'dataCheck' | 'eventJob' | 'emailDistributionGroups';

export interface TreeNode {
  id: string;
  label: string;
  nodeType: NodeType;
  parentId?: string;
  appId?: string;
  tabId?: string;
  slotId?: string;
  data?: any;
  children?: TreeNode[];
}