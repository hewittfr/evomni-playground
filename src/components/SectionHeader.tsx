import React from 'react'
import { Box, Typography, useTheme } from '@mui/material'

export default function SectionHeader({ title, description }: { title: string; description?: string }){
  const theme = useTheme()
  return (
    <Box sx={{ mb: 1 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '-0.01em' }}>{title}</Typography>
      {description ? (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', mt: 0.25, lineHeight: 1.15 }}
        >
          {description}
        </Typography>
      ) : null}
    </Box>
  )
}
