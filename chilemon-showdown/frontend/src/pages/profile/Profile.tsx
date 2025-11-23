import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { CardScore, Column, ActiveBattleItem, UserName } from '../../components/profile';
import {getUserBattles, type BattleSummary} from "../../services/battle";
import { useEffect, useState } from "react";
export default function Profile() {

  // Obtenemos los datos del usuario para poder mostrar la lista de batallas activas

  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;
  
  if (!user) {
    return <Box sx={{ p: 3 }}>Please log in to view your profile.</Box>;
  }
  
  const [battles, setBattles] = useState<BattleSummary[]>([]);
  // Obtenemos los id de las batallas de cada usuario

  useEffect(() => {
    const fetchBattles = async () => {
      const battles = await getUserBattles(user.id);
      console.log("Battles fetched:", battles);
      setBattles(battles || []);
    };
    fetchBattles();
  }, [user.id]);

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
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
          gap: 3,
          height: '100%',
        }}
      >
        <Box>
          <Column title="User Profile">
            <Box sx={{ mt: 2 }}>
              <UserName name={user.username} />
              <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
              </Box>
            </Box>
          </Column>
        </Box>

        <Box>
          <Column title="Active Battle">
            <Box sx={{ mt: 2, display: 'grid', gap: 2 }}>
              {battles && battles.length > 0 ? (
                battles.map((b) => {
                  const id = b._id;
                  const title = b.players && b.players.length > 0
                    ? b.players.map(p => p.username ?? p.userId).join(' vs ')
                    : `Battle ${id}`;
                  return (
                    <ActiveBattleItem
                      key={id}
                      id={id}
                      title={title}
                    />
                  );
                })
              ) : (
                <Typography variant="body2" color="text.secondary">No active battles</Typography>
              )}
            </Box>
          </Column>
        </Box>
      </Box>
    </Box>
  );
}
