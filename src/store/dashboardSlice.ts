import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../api/axiosClient'

export const fetchDashboard = createAsyncThunk('dashboard/fetch', async (params?: { start?: string; end?: string }) => {
  const res = await api.get('/api/dashboard', { params })
  return res.data
})

const slice = createSlice({
  name: 'dashboard',
  initialState: { loading: false, data: null, error: null as any },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (s) => { s.loading = true })
      .addCase(fetchDashboard.fulfilled, (s, a) => { s.loading = false; s.data = a.payload })
      .addCase(fetchDashboard.rejected, (s, a) => { s.loading = false; s.error = a.error })
  }
})

export default slice.reducer
