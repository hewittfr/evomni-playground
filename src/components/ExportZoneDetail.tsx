import React from 'react';
import { Card, CardContent, Grid, TextField, FormControlLabel, Switch } from '@mui/material';

interface ExportZoneDetailProps {
  data: any;
  isEditing: boolean;
  onUpdate: (field: string, value: any) => void;
}

export default function ExportZoneDetail({ data, isEditing, onUpdate }: ExportZoneDetailProps) {
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
              label="Target Path"
              value={data.targetPath || ''}
              onChange={(e) => onUpdate('targetPath', e.target.value)}
              disabled={!isEditing}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Format"
              value={data.format || ''}
              onChange={(e) => onUpdate('format', e.target.value)}
              disabled={!isEditing}
              select
              SelectProps={{ native: true }}
              fullWidth
              size="small"
            >
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
              <option value="xml">XML</option>
            </TextField>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
