import React from 'react';
import { Card, CardContent, Grid, TextField } from '@mui/material';

interface SettingDetailProps {
  data: any;
  isEditing: boolean;
  onUpdate: (field: string, value: any) => void;
}

export default function SettingDetail({ data, isEditing, onUpdate }: SettingDetailProps) {
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
            <TextField
              label="Type"
              value={data.type || ''}
              onChange={(e) => onUpdate('type', e.target.value)}
              disabled={!isEditing}
              select
              SelectProps={{ native: true }}
              fullWidth
              size="small"
            >
              <option value="string">String</option>
              <option value="number">Number</option>
              <option value="boolean">Boolean</option>
              <option value="json">JSON</option>
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Value"
              value={data.type === 'boolean' ? (data.value ? 'true' : 'false') : String(data.value || '')}
              onChange={(e) => {
                let value: any = e.target.value;
                if (data.type === 'number') value = Number(value);
                else if (data.type === 'boolean') value = value === 'true';
                onUpdate('value', value);
              }}
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
              rows={2}
              fullWidth
              size="small"
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
