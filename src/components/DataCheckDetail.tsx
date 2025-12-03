import React from 'react';
import { Card, CardContent, Grid, TextField, FormControlLabel, Switch, Typography, Box, Chip } from '@mui/material';

interface DataCheckDetailProps {
  data: any;
  isEditing: boolean;
  onUpdate: (field: string, value: any) => void;
}

export default function DataCheckDetail({ data, isEditing, onUpdate }: DataCheckDetailProps) {
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
                  checked={data.isShared || false}
                  onChange={(e) => onUpdate('isShared', e.target.checked)}
                  disabled={!isEditing}
                />
              }
              label="Shared across slots"
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
            <Typography variant="subtitle2" gutterBottom>Rules</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {(data.rules || []).map((rule: string, index: number) => (
                <Chip key={index} label={rule} size="small" />
              ))}
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
