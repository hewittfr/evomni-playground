import axios from 'axios';

// Create axios instance for database.json
const dbClient = axios.create({
  baseURL: import.meta.env.BASE_URL || '/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Cache for the database
let databaseCache: any = null;

// Fetch the entire database
async function getDatabase() {
  if (databaseCache) {
    return databaseCache;
  }
  
  const response = await dbClient.get(`src/database/database.json?t=${Date.now()}`);
  databaseCache = response.data;
  return databaseCache;
}

// Data access functions
export const dataService = {
  // Get all data checks
  async getDataChecks() {
    const db = await getDatabase();
    return db.dataChecks || [];
  },

  // Get distribution groups
  async getDistributionGroups() {
    const db = await getDatabase();
    return db.distributionGroups || [];
  },

  // Get distribution group by ID
  async getDistributionGroupById(id: number | string) {
    const db = await getDatabase();
    return db.distributionGroups?.find((g: any) => g.id === id || g.id === Number(id));
  },

  // Get members
  async getMembers() {
    const db = await getDatabase();
    return db.members || [];
  },

  // Get project members (mapping of members to projects)
  async getProjectMembers() {
    const db = await getDatabase();
    return db.projectMembers || [];
  },

  // Get members by project
  async getMembersByProject(project: string) {
    const db = await getDatabase();
    const projectMembers = db.projectMembers || [];
    const members = db.members || [];
    
    // Get member IDs for this project
    const memberIds = projectMembers
      .filter((pm: any) => pm.project === project)
      .map((pm: any) => pm.memberId);
    
    // Return full member objects
    return members.filter((m: any) => memberIds.includes(m.id));
  },

  // Get members by group ID (legacy - now uses project)
  async getMembersByGroupId(groupId: number | string) {
    const db = await getDatabase();
    const group = db.distributionGroups?.find((g: any) => g.id === groupId || g.id === Number(groupId));
    if (!group) return [];
    
    // Use the group's project to find members
    return this.getMembersByProject(group.project);
  },

  // Get settings
  async getSettings() {
    const db = await getDatabase();
    return db.settings || [];
  },

  // Get export zones
  async getExportZones() {
    const db = await getDatabase();
    return db.exportZones || [];
  },

  // Get export presets
  async getExportPresets() {
    const db = await getDatabase();
    return db.exportPresets || [];
  },

  // Get tab settings
  async getTabSettings() {
    const db = await getDatabase();
    return db.tabSettings || [];
  },

  // Get slots
  async getSlots() {
    const db = await getDatabase();
    return db.slots || [];
  },

  // Get tabs
  async getTabs() {
    const db = await getDatabase();
    return db.tabs || [];
  },

  // Get apps
  async getApps() {
    const db = await getDatabase();
    return db.apps || [];
  },

  // Get app by ID
  async getAppById(id: string) {
    const db = await getDatabase();
    return db.apps?.find((a: any) => a.id === id);
  },

  // Get event jobs
  async getEventJobs() {
    const db = await getDatabase();
    return db.eventJobs || [];
  },

  // Get projects
  async getProjects() {
    const db = await getDatabase();
    return db.projects || [];
  },

  // Get admin data (combined for admin page)
  async getAdminData() {
    const db = await getDatabase();
    
    // Build nested app structure
    const apps = (db.apps || []).map((app: any, index: number) => {
      // Get tabs for this app using appId
      const appTabs = (db.tabs || [])
        .filter((tab: any) => tab.appId === app.id)
        .map((tab: any) => ({
          ...tab,
          tabSettings: (db.tabSettings || []).filter((ts: any) => ts.tabId === tab.id),
          slots: (db.slots || [])
            .filter((slot: any) => slot.tabId === tab.id)
            .map((slot: any) => ({
              ...slot,
              dataChecks: (db.dataChecks || []).filter((dc: any) => dc.slotId === slot.id),
              exportZones: (db.exportZones || []).filter((ez: any) => ez.slotId === slot.id),
              exportPresets: (db.exportPresets || []).filter((ep: any) => ep.slotId === slot.id)
            }))
        }));
      
      // Distribute dataChecks across apps (10 per app) - since they don't have appId
      const startIdx = index * 10;
      const appDataChecks = (db.dataChecks || []).slice(startIdx, startIdx + 10);
      
      // Distribute settings across apps - since they don't have appId
      const appSettings = (db.settings || []).filter((_: any, i: number) => i % (db.apps.length || 1) === index);
      
      return {
        ...app,
        dataChecks: appDataChecks,
        settings: appSettings,
        tabs: appTabs
      };
    });
    
    return {
      apps,
      globalExportZones: (db.exportZones || []).filter((ez: any) => !ez.slotId),
      eventJobs: db.eventJobs || [],
      settings: db.settings || [],
      dataChecks: db.dataChecks || [],
      tabSettings: db.tabSettings || [],
      exportPresets: db.exportPresets || [],
      slots: db.slots || [],
      tabs: db.tabs || []
    };
  },

  // Clear cache (useful for testing or force refresh)
  clearCache() {
    databaseCache = null;
  }
};

export default dataService;
