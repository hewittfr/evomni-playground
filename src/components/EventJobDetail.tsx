import React from 'react';
import { Card, CardContent, Grid, TextField, FormControlLabel, Switch } from '@mui/material';

interface EventJobDetailProps {
  data: any;
  isEditing: boolean;
  onUpdate: (field: string, value: any) => void;
}

export default function EventJobDetail({ data, isEditing, onUpdate }: EventJobDetailProps) {
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
                  checked={data.isActive || false}
                  onChange={(e) => onUpdate('isActive', e.target.checked)}
                  disabled={!isEditing}
                />
              }
              label="Active"
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
              label="Trigger"
              value={data.trigger || ''}
              onChange={(e) => onUpdate('trigger', e.target.value)}
              disabled={!isEditing}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Action"
              value={data.action || ''}
              onChange={(e) => onUpdate('action', e.target.value)}
              disabled={!isEditing}
              fullWidth
              size="small"
            />
          </Grid>
          {data.schedule && (
            <Grid item xs={12}>
              <TextField
                label="Schedule (Cron)"
                value={data.schedule || ''}
                onChange={(e) => onUpdate('schedule', e.target.value)}
                disabled={!isEditing}
                fullWidth
                size="small"
              />
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
}
