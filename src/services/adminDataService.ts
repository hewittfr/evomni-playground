import { AdminData, App, DataCheck, Settings, Tab, ExportZone, ExportPreset, EventJob } from '../types/adminTypes';

const API_BASE_URL = 'http://localhost:5005';

class AdminDataService {
  async getAdminData(): Promise<AdminData> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin`, {
        credentials: 'include', // Send Windows Auth credentials
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.status === 401) {
        const errorData = await response.json().catch(() => ({ error: 'Unauthorized' }));
        throw new Error(errorData.message || 'User Not authorized');
      }
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
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
