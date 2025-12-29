/**
 * LocalStorage service for persisting database changes
 * This allows the app to work on GitHub Pages without a backend
 */

const STORAGE_KEY = 'evomni_database';

export interface Database {
  distributionGroups: any[];
  members: any[];
  projects: any[];
  [key: string]: any;
}

/**
 * Initialize localStorage with data from the JSON file if not already set
 */
export const initializeStorage = async (): Promise<void> => {
  const existing = localStorage.getItem(STORAGE_KEY);
  
  if (!existing) {
    // First time - load from JSON file
    try {
      const response = await fetch('/evomni-playground/src/database/database.json', {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      const data = await response.json();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      console.log('✅ Initialized localStorage from database.json');
    } catch (error) {
      console.error('❌ Failed to initialize localStorage:', error);
      // Create empty database structure
      const emptyDb: Database = {
        distributionGroups: [],
        members: [],
        projects: []
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(emptyDb));
    }
  }
};

/**
 * Get the entire database from localStorage
 */
export const getDatabase = (): Database => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    console.warn('⚠️ No data in localStorage, returning empty database');
    return {
      distributionGroups: [],
      members: [],
      projects: []
    };
  }
  return JSON.parse(data);
};

/**
 * Save the entire database to localStorage
 */
export const saveDatabase = (database: Database): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(database));
  console.log('💾 Saved database to localStorage');
};

/**
 * Clear all data (useful for debugging/reset)
 */
export const clearStorage = (): void => {
  localStorage.removeItem(STORAGE_KEY);
  console.log('🗑️ Cleared localStorage');
};

/**
 * Export data as JSON (for backup)
 */
export const exportDatabase = (): string => {
  const db = getDatabase();
  return JSON.stringify(db, null, 2);
};

/**
 * Import data from JSON string
 */
export const importDatabase = (jsonString: string): void => {
  try {
    const data = JSON.parse(jsonString);
    saveDatabase(data);
    console.log('📥 Imported database successfully');
  } catch (error) {
    console.error('❌ Failed to import database:', error);
    throw new Error('Invalid JSON format');
  }
};
