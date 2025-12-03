import React from 'react';
import { Card, CardContent, Grid, TextField, Typography, Box, Chip } from '@mui/material';

interface SlotDetailProps {
  data: any;
  isEditing: boolean;
  onUpdate: (field: string, value: any) => void;
}

export default function SlotDetail({ data, isEditing, onUpdate }: SlotDetailProps) {
  return (
    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              label="Name"
              value={data.name || ''}
              onChange={(e) => onUpdate('name', e.target.value)}
              disabled={!isEditing}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Description"
              value={data.description || ''}
              onChange={(e) => onUpdate('description', e.target.value)}
              disabled={!isEditing}
              multiline
              rows={3}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Components</Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Chip label={`${data.settings?.length || 0} Settings`} />
              <Chip label={`${data.exportZones?.length || 0} Export Zones`} />
              <Chip label={`${data.dataChecks?.length || 0} Data Checks`} />
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
