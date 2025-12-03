import React from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  TextField, 
  Button,
  Grid,
  Divider,
  Alert,
  Switch,
  FormControlLabel,
  IconButton
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Formik, Form, Field, FieldArray } from 'formik';
import * as Yup from 'yup';
import { App } from '../types/adminTypes';

interface AppsManagementFormProps {
  apps: App[];
  onSave: (apps: App[]) => void;
}

// Validation schema
const appValidationSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  key: Yup.string()
    .required('Key is required')
    .matches(/^[a-z0-9-]+$/, 'Key must be lowercase letters, numbers, and hyphens only')
    .test('unique-key', 'Key must be unique', function(value) {
      const { parent, path } = this;
      const apps = this.options.context?.apps || [];
      const currentIndex = parseInt(path.split('[')[1]?.split(']')[0]);
      
      return !apps.some((app: App, index: number) => 
        index !== currentIndex && app.key === value
      );
    }),
  description: Yup.string().required('Description is required'),
  status: Yup.string().oneOf(['Active', 'Inactive']).required('Status is required'),
});

const appsValidationSchema = Yup.object().shape({
  apps: Yup.array().of(appValidationSchema)
});

export default function AppsManagementForm({ apps, onSave }: AppsManagementFormProps) {
  const initialValues = {
    apps: apps
  };

  const handleSubmit = (values: { apps: App[] }) => {
    onSave(values.apps);
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Apps Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Configure and manage application settings. Keys must be unique and lowercase.
            </Typography>
          </Box>
          <Button
            type="submit"
            variant="contained"
            size="small"
            form="apps-management-form"
          >
            Save All Apps
          </Button>
        </Box>

        <Formik
          initialValues={initialValues}
          validationSchema={appsValidationSchema}
          onSubmit={handleSubmit}
          context={{ apps }}
        >
          {({ values, errors, touched, isSubmitting, setFieldValue }) => (
            <Form id="apps-management-form">
              <FieldArray name="apps">
                {({ push, remove }) => (
                  <Box>
                    {values.apps.map((app, index) => (
                      <Card 
                        key={index} 
                        variant="outlined" 
                        sx={{ mb: 2, p: 1.5 }}
                      >
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                              <Typography variant="subtitle1" color="primary">
                                App {index + 1}
                              </Typography>
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={app.status === 'Active'}
                                    onChange={(e) => 
                                      setFieldValue(`apps.${index}.status`, e.target.checked ? 'Active' : 'Inactive')
                                    }
                                    size="small"
                                  />
                                }
                                label={
                                  <Box sx={{ textAlign: 'right' }}>
                                    <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>Status</Typography>
                                    <Typography 
                                      variant="caption" 
                                      color={app.status === 'Active' ? 'success.main' : 'error.main'}
                                    >
                                      {app.status}
                                    </Typography>
                                  </Box>
                                }
                              />
                            </Box>
                          </Grid>

                          <Grid item xs={12} md={4}>
                            <Field name={`apps.${index}.name`}>
                              {({ field, meta }: any) => (
                                <TextField
                                  {...field}
                                  fullWidth
                                  size="small"
                                  label="Name"
                                  placeholder="Enter application name"
                                  error={meta.touched && !!meta.error}
                                  helperText={meta.touched && meta.error}
                                  required
                                />
                              )}
                            </Field>
                          </Grid>

                          <Grid item xs={12} md={4}>
                            <Field name={`apps.${index}.key`}>
                              {({ field, meta }: any) => (
                                <TextField
                                  {...field}
                                  fullWidth
                                  size="small"
                                  label="Key"
                                  placeholder="lowercase-key"
                                  error={meta.touched && !!meta.error}
                                  helperText={
                                    meta.touched && meta.error 
                                      ? meta.error 
                                      : 'Must be unique and lowercase'
                                  }
                                  onChange={(e) => {
                                    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                                    setFieldValue(`apps.${index}.key`, value);
                                  }}
                                />
                              )}
                            </Field>
                          </Grid>

                          <Grid item xs={12} md={4}>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                              <Field name={`apps.${index}.description`}>
                                {({ field, meta }: any) => (
                                  <TextField
                                    {...field}
                                    fullWidth
                                    size="small"
                                    label="Description"
                                    error={meta.touched && !!meta.error}
                                    helperText={meta.touched && meta.error}
                                    required
                                  />
                                )}
                              </Field>
                              {values.apps.length > 1 && (
                                <IconButton 
                                  onClick={() => remove(index)} 
                                  color="error"
                                  size="small"
                                  sx={{ mt: 0.5 }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              )}
                            </Box>
                          </Grid>
                        </Grid>
                        
                        {index < values.apps.length - 1 && <Divider sx={{ mt: 1.5 }} />}
                      </Card>
                    ))}

                    <Box sx={{ display: 'flex', gap: 1.5, mt: 2 }}>
                      <Button
                        type="button"
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={() => push({
                          id: `new-${Date.now()}`,
                          name: '',
                          key: '',
                          description: '',
                          status: 'Active',
                          dataChecks: [],
                          settings: [],
                          tabs: []
                        })}
                        size="small"
                      >
                        Add App
                      </Button>
                    </Box>

                    {Object.keys(errors).length > 0 && (
                      <Alert severity="error" sx={{ mt: 2, py: 0.5 }}>
                        Please fix the validation errors above before saving.
                      </Alert>
                    )}
                  </Box>
                )}
              </FieldArray>
            </Form>
          )}
        </Formik>
      </CardContent>
    </Card>
  );
}