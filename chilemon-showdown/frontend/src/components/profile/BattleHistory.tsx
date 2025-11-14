import * as React from 'react';
import Stack from '@mui/material/Stack';
import HistoryItem from './HistoryItem';

interface Battle {
  name: string;
  result: string;
  img: string;
}

interface Props {
  battles: Battle[];
}

export default function BattleHistory({ battles }: Props) {
  return (
    <Stack spacing={2}>
      {battles.map((b) => (
        <HistoryItem key={b.name} battle={b} />
      ))}
    </Stack>
  );
}
