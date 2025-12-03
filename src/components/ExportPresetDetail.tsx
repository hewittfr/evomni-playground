import React from 'react';
import { Card, CardContent, Grid, TextField, FormControlLabel, Switch, Typography, Box, Chip } from '@mui/material';

interface ExportPresetDetailProps {
  data: any;
  isEditing: boolean;
  onUpdate: (field: string, value: any) => void;
}

export default function ExportPresetDetail({ data, isEditing, onUpdate }: ExportPresetDetailProps) {
  return (
    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Name"
              value={data.name || ''}
              onChange={(e) => onUpdate('name', e.target.value)}
              disabled={!isEditing}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={data.canCopy || false}
                  onChange={(e) => onUpdate('canCopy', e.target.checked)}
                  disabled={!isEditing}
                />
              }
              label="Allow copying"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Description"
              value={data.description || ''}
              onChange={(e) => onUpdate('description', e.target.value)}
              disabled={!isEditing}
              multiline
              rows={2}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Schedule (Cron)"
              value={data.schedule || ''}
              onChange={(e) => onUpdate('schedule', e.target.value)}
              disabled={!isEditing}
              fullWidth
              placeholder="0 2 * * *"
              size="small"
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>Export Zones</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {(data.zones || []).map((zoneId: string, index: number) => (
                <Chip key={index} label={zoneId} size="small" />
              ))}
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
