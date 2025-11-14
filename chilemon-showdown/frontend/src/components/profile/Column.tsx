import * as React from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

interface Props {
  title: string;
  children?: React.ReactNode;
}

export default function Column({ title, children }: Props) {
  return (
    <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }} elevation={0}>
      <Typography variant="h6" component="h2" sx={{ mb: 2, fontWeight: 600 }}>
        {title}
      </Typography>
      {children}
    </Paper>
  );
}
