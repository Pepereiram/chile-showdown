import eggkingImg from "../../assets/HuevitoRey.jpeg";
import corxeaImg from "../../assets/corxea.jpg";
import misterionImg from "../../assets/misterion.jpg";
import papiMickeyImg from "../../assets/papimickey.jpg";
import vardokImg from "../../assets/vardok.jpg";
import xodaImg from "../../assets/xoda.jpg";

import Box from '@mui/material/Box';
import { CardScore, Column, UserName, BattleHistory, ActiveBattleItem } from '../../components/profile';

export default function Profile() {
  const battles = [
    { name: "Corxea", result: "Victory", img: corxeaImg },
    { name: "Misterion", result: "Defeat", img: misterionImg },
    { name: "Egg King", result: "Victory", img: eggkingImg },
    { name: "Vardok", result: "Defeat", img: vardokImg },
  ];

  return (
    <Box
      sx={{
        width: '100%',
        height: 'calc(100vh - 48px)',
        bgcolor: 'background.paper',
        p: 3,
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gap: 3,
          height: '100%',
        }}
      >
        <Box>
          <Column title="User Profile">
            <UserName name="Papi Mickey" location="Paine" avatarSrc={papiMickeyImg} />
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                <CardScore score={120} tag="Wins" />
                <CardScore score={69} tag="Losses" />
              </Box>
            </Box>
          </Column>
        </Box>

        <Box>
          <Column title="Player History">
            <BattleHistory battles={battles} />
          </Column>
        </Box>

        <Box>
          <Column title="Active Battle">
            <ActiveBattleItem img={xodaImg} title="Current Battle: Ash vs. Gary" />
          </Column>
        </Box>
      </Box>
    </Box>
  );
}
