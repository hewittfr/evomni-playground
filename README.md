EV-OMNI - dev notes

Dev workflow

1) Start C# mock API:

   npm run dev:api

2) Start the frontend dev server (Vite):

   npm run react-dev

3) Start Electron (development):

   npm run electron:dev

One-command dev (API, Vite, Electron):

   npm run dev:all

Production build & run:

   npm run start:prod

Notes
- Make sure .NET SDK is installed (dotnet --info). The mock API targets net8.0.
- If Electron tries to load a missing build file you'll see a helpful error instead of the raw "Not allowed to load local resource" crash.
