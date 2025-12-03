import React from 'react';
import { Card, CardContent, Grid, TextField, FormControlLabel, Switch } from '@mui/material';

interface CppDetailProps {
  data: any;
  isEditing: boolean;
  onUpdate: (field: string, value: any) => void;
}

export default function CppDetail({ data, isEditing, onUpdate }: CppDetailProps) {
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
          <Grid item xs={12}>
            <TextField
              label="Configuration (JSON)"
              value={JSON.stringify(data.configuration || {}, null, 2)}
              onChange={(e) => {
                try {
                  onUpdate('configuration', JSON.parse(e.target.value));
                } catch {
                  // Invalid JSON, don't update
                }
              }}
              disabled={!isEditing}
              multiline
              rows={4}
              fullWidth
              sx={{ fontFamily: 'monospace' }}
              size="small"
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
