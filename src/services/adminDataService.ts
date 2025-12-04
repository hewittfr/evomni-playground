import { AdminData, App, DataCheck, Settings, Tab, ExportZone, ExportPreset, EventJob } from '../types/adminTypes';
import dataService from './dataService';

class AdminDataService {
  async getAdminData(): Promise<AdminData> {
    try {
      const data = await dataService.getAdminData();
      return data as AdminData;
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      throw error;
    }
  }

  async updateItem(
    type: 'app' | 'dataCheck' | 'setting' | 'tab' | 'exportZone' | 'exportPreset' | 'eventJob',
    id: string,
    updates: Partial<App | DataCheck | Settings | Tab | ExportZone | ExportPreset | EventJob>
  ): Promise<void> {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 200));
    console.log(`Updated ${type} ${id}:`, updates);
  }

  async deleteItem(
    type: 'app' | 'dataCheck' | 'setting' | 'tab' | 'exportZone' | 'exportPreset' | 'eventJob',
    id: string
  ): Promise<void> {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 200));
    console.log(`Deleted ${type} ${id}`);
  }

  async copyItem(
    type: 'app' | 'dataCheck' | 'setting' | 'tab' | 'exportZone' | 'exportPreset',
    id: string
  ): Promise<string> {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 300));
    const newId = `${id}-copy-${Date.now()}`;
    console.log(`Copied ${type} ${id} to ${newId}`);
    return newId;
  }
}

export const adminDataService = new AdminDataService();
