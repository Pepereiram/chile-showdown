import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

interface Props {
  name: string;
  location?: string;
  avatarSrc?: string;
}

export default function UserName({ name, location, avatarSrc }: Props) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Avatar src={avatarSrc} alt={name} sx={{ width: 56, height: 56 }} />
      <Box>
        <Typography fontWeight={600}>{name}</Typography>
        {location && (
          <Typography variant="body2" color="text.secondary">
            {location}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
