# API Migration Notes

## Overview
Successfully migrated admin data from local TypeScript mock data to centralized .NET mock API.

## Changes Made

### 1. .NET Mock API (Program.cs)
- **Added**: `/api/admin` endpoint that returns complete admin data structure
- **Data Included**:
  - 6 Applications (EVMS, EVFC, EVCSA, AVA, EVBF, EVUTIL)
  - 3 Data Checks per app
  - 3 Settings per app
  - 3 Tabs per app with full nested structure
  - 3 Export Zones
  - 4 Export Presets
  - 2 Event Jobs

### 2. AdminDataService (adminDataService.ts)
- **Before**: 300+ lines of local mock data
- **After**: Clean API client with fetch calls
- **Methods**:
  - `getAdminData()`: Fetches from `http://localhost:5005/api/admin`
  - `updateItem()`: Placeholder for future POST endpoint
  - `deleteItem()`: Placeholder for future DELETE endpoint
  - `copyItem()`: Placeholder for future POST endpoint

### 3. Apps Component (Apps.tsx)
- **Added**: `toApiType()` helper function to convert NodeType (plural) to API type (singular)
- **Fixed**: Type compatibility between UI and API service

### 4. .NET Project Configuration
- **Updated**: Target framework from `net8.0` to `net9.0` (matches installed runtime)

## Running the Application

### Start .NET Mock API
```bash
cd mock-api-dotnet
EVOMNI_DEV=1 dotnet run
```
API runs on: http://localhost:5005

### Start Vite Dev Server
```bash
npm run dev
```
UI runs on: http://localhost:5173

### Test API Endpoints
```bash
# Health check
curl http://localhost:5005/api/health

# Admin data
curl http://localhost:5005/api/admin | python3 -m json.tool
```

## Data Flow

1. **App Loads** → `Apps.tsx` calls `adminDataService.getAdminData()`
2. **Service Fetches** → GET request to `http://localhost:5005/api/admin`
3. **API Returns** → Complete admin data structure (apps, globalExportZones, eventJobs)
4. **UI Renders** → Tree view and detail panels populated with API data

## Benefits

✅ **Centralized Data**: All mock data in one place (.NET API)  
✅ **Type Safety**: TypeScript types match API responses  
✅ **Realistic**: Simulates actual production architecture  
✅ **Maintainable**: Easier to update mock data  
✅ **Testable**: Can test API independently  

## Next Steps

To complete the integration:
1. Add POST/PUT endpoints for `updateItem()`
2. Add DELETE endpoint for `deleteItem()`
3. Add POST endpoint for `copyItem()`
4. Implement error handling and loading states in UI components
5. Add data refresh after mutations

## CORS Configuration

CORS is enabled in development mode when `EVOMNI_DEV=1` environment variable is set:
- AllowAnyOrigin
- AllowAnyMethod
- AllowAnyHeader

This allows the Vite dev server (localhost:5173) to call the API (localhost:5005).
