import React from 'react';
import { Card, CardContent, Typography, Box, Grid, Divider, Chip } from '@mui/material';

interface TabsSummaryProps {
  data: any;
}

export default function TabsSummary({ data }: TabsSummaryProps) {
  const tabs = data.tabs || [];
  
  return (
    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>Tabs</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Application tabs configuration ({tabs.length} tabs)
        </Typography>
        <Divider sx={{ my: 2 }} />
        {tabs.map((tab: any, index: number) => (
          <Box key={tab.id} sx={{ mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <Typography variant="subtitle2" color="primary">
                  {tab.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Key: {tab.key}
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip 
                    label={tab.status} 
                    size="small" 
                    color={tab.status === 'Active' ? 'success' : 'default'}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={5}>
                <Typography variant="body2" color="text.secondary">
                  {tab.description || 'No description'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                  Components:
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  <Chip label={`Export Presets: ${tab.exportPresets?.length || 0}`} size="small" variant="outlined" />
                  <Chip label={`Export Zones: ${tab.exportZones?.length || 0}`} size="small" variant="outlined" />
                  <Chip label={`Audit Clusters: ${tab.slots?.length || 0}`} size="small" variant="outlined" />
                </Box>
              </Grid>
            </Grid>
            {index < tabs.length - 1 && <Divider sx={{ mt: 2 }} />}
          </Box>
        ))}
        {tabs.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            No tabs configured for this application.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
