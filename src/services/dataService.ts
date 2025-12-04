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
  
  const response = await dbClient.get('database/database.json');
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

  // Get members by group ID
  async getMembersByGroupId(groupId: number | string) {
    const db = await getDatabase();
    return db.members?.filter((m: any) => m.groupId === groupId || m.groupId === Number(groupId)) || [];
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
    return {
      apps: db.apps || [],
      globalExportZones: db.exportZones || [],
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
