import React from 'react'
import { Box, Paper, Toolbar, Typography, useTheme } from '@mui/material'
import { DRAWER_WIDTH } from '../constants/layout'
// DateRangeSelector moved to Layout to guarantee alignment with main content

export default React.forwardRef<HTMLDivElement, { children?: React.ReactNode, topOffset?: number, height?: number }>(function Subheader({ children, topOffset, height }, ref){
  const theme = useTheme()
  // allow Layout to pass an explicit top offset (measured AppBar height). fallback to theme toolbar minHeight.
  const defaultHeight = 52
  const top = typeof topOffset === 'number' ? topOffset : (theme.mixins?.toolbar?.minHeight ?? defaultHeight)
  // Use explicit height prop for the subheader toolbar if provided (we want a 57px toolbar
  // while positioning the subheader below the AppBar using the AppBar height as the top offset).
  const toolbarHeight = typeof height === 'number' ? height : (theme.mixins?.toolbar?.minHeight ?? defaultHeight)
  return (
    <Paper
      ref={ref as any}
      elevation={0}
      sx={{
        backgroundColor: '#f5f5f5',
        borderBottom: '1px solid #e0e0e0',
        position: 'fixed',
        left: 0,
        right: 0,
        top: top,
        // enforce the visual height of the subheader container so measurements are stable
        height: `${toolbarHeight}px`,
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'stretch',
        zIndex: (t:any) => (t.zIndex.appBar ? t.zIndex.appBar - 1 : 1100),
        width: '100%'
      }}
    >
      {/* reduced height subheader; date picker moved to main toolbar */}
  <Toolbar sx={{ height: '100%', minHeight: 'unset', alignItems: 'center', display: 'flex', px: 0 }}>
  {/* Fine-tune: nudge 1px to match hamburger visual edge (4px -> 5px) */}
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', width: '100%', height: '100%', pl: 0.625 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flex: 1 }}>
          <Typography component="div" variant="subtitle1" sx={{ textAlign: 'left', lineHeight: 1, ml: 0, height: '100%', display: 'flex', alignItems: 'center' }}>{children}</Typography>
        </Box>
      </Box>
    </Toolbar>
    </Paper>
  )
})
