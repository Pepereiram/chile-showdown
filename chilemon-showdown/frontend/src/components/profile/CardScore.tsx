import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

interface Props {
  score: number;
  tag: string;
}

export default function CardScore({ score, tag }: Props) {
  return (
    <Paper elevation={1} sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
      <Typography variant="h5" component="div" fontWeight={700}>
        {score}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {tag}
      </Typography>
    </Paper>
  );
}
