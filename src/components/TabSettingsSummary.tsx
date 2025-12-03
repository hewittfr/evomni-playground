import React from 'react';
import { Card, CardContent, Typography, Box, Grid, Divider } from '@mui/material';

interface TabSettingsSummaryProps {
  data: any;
}

export default function TabSettingsSummary({ data }: TabSettingsSummaryProps) {
  const settings = data.settings || [];
  
  return (
    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>Tab Settings</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Configuration settings for this tab ({settings.length} settings)
        </Typography>
        <Divider sx={{ my: 2 }} />
        {settings.map((setting: any, index: number) => (
          <Box key={setting.id} sx={{ mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="primary">
                  {setting.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Type: {setting.type}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  {setting.type === 'boolean' ? (setting.value ? 'true' : 'false') : String(setting.value)}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary">
                  {setting.description || 'No description'}
                </Typography>
              </Grid>
            </Grid>
            {index < settings.length - 1 && <Divider sx={{ mt: 2 }} />}
          </Box>
        ))}
        {settings.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            No settings configured for this tab.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
