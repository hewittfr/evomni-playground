import React from 'react'
import { Box, Typography } from '@mui/material'

export default function About(){
  return (
    <Box>
      <Typography variant="h5" sx={{ mt: 2 }}>About</Typography>
      <Typography sx={{ mt: 1 }}>About this application.</Typography>
    </Box>
  )
}
