import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

interface Props {
  img?: string;
  title?: string;
}

export default function ActiveBattleItem({ img, title }: Props) {
  return (
    <Paper sx={{ p: 2, borderRadius: 2 }} elevation={1}>
      <Typography variant="body2" color="text.secondary">
        {title ?? 'Current Battle: Ash vs. Gary'}
      </Typography>
      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar src={img} alt="active" />
        <Box sx={{ flex: 1 }}>
          <Typography>Xodaa</Typography>
        </Box>
        <Button variant="contained" size="small">Select Move</Button>
      </Box>
    </Paper>
  );
}
