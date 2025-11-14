import * as React from 'react';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

interface Battle {
  name: string;
  result: string;
  img: string;
}

interface Props {
  battle: Battle;
}

export default function HistoryItem({ battle }: Props) {
  return (
    <Paper sx={{ p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 2 }} elevation={1}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar src={battle.img} alt={battle.name} />
        <Box>
          <Typography fontWeight={600}>{battle.name}</Typography>
          <Typography variant="caption" color="text.secondary">
            {new Date().toLocaleDateString()}
          </Typography>
        </Box>
      </Box>
      <Typography fontWeight={600}>{battle.result}</Typography>
    </Paper>
  );
}
