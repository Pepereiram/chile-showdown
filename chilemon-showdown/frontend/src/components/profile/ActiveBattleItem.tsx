import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';

interface Props {
  title?: string;
  id?: string | number;
}

export default function ActiveBattleItem({ title, id }: Props) {
  const navigate = useNavigate();

  const handleSelect = () => {
    if (id !== undefined && id !== null) {
      navigate(`/battle/${id}`);
    }
  };

  return (
    <Paper sx={{ p: 2, borderRadius: 2 }} elevation={1}>
      <Typography variant="body2" color="text.secondary">
        {title ?? 'Current Battle: Ash vs. Gary'}
      </Typography>
      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Typography>{title ?? 'Opponent'}</Typography>
        </Box>
        <Button variant="contained" size="small" onClick={handleSelect}>Select Move</Button>
      </Box>
    </Paper>
  );
}
