import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Column, ActiveBattleItem, UserName } from '../../components/profile';
import { useEffect } from "react";
import { useBattleStore } from "../../store/battleStore";

export default function Profile() {
  const user = localStorage.getItem('user')
    ? JSON.parse(localStorage.getItem('user')!)
    : null;
  
  const { 
    fetchUserBattles, 
    getActiveBattles,      // in_progress
    getPendingBattles,     // waiting
    getFinishedBattles,    // finished
    loading,
    error 
  } = useBattleStore();

  const activeBattles = getActiveBattles();
  const pendingBattles = getPendingBattles();
  const finishedBattles = getFinishedBattles();
  
  if (!user) {
    return <Box sx={{ p: 3 }}>Please log in to view your profile.</Box>;
  }

  useEffect(() => {
    fetchUserBattles(user.id);
  }, [user.id, fetchUserBattles]);

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
      {/* Grid externa */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' },
          gap: 3,
          height: '100%',
        }}
      >
        {/* Perfil usuario */}
        <Box>
          <Column title="User Profile">
            <Box sx={{ mt: 2 }}>
              <UserName name={user.username} />
            </Box>
          </Column>
        </Box>

        {/* Secciones de batallas */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 3,
          }}
        >
          <Column title="Pending Battles">
            <Box sx={{ mt: 2, display: 'grid', gap: 2 }}>
              {loading ? (
                <Typography>Loading...</Typography>
              ) : error ? (
                <Typography color="error">{error}</Typography>
              ) : pendingBattles.length > 0 ? (
                pendingBattles.map((b) => {
                  const id = b._id;
                  const title = b.players?.length
                    ? b.players.map(p => p.username ?? p.userId).join(' vs ')
                    : `Battle ${id}`;
                  return (
                    <ActiveBattleItem
                      key={id}
                      id={id}
                      title={title + " (Waiting)"}
                    />
                  );
                })
              ) : (
                <Typography>No pending battles</Typography>
              )}
            </Box>
          </Column>

          <Column title="In Progress Battles">
            <Box sx={{ mt: 2, display: 'grid', gap: 2 }}>
              {activeBattles.length > 0 ? (
                activeBattles.map((b) => {
                  const id = b._id;
                  const title = b.players?.length
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
                <Typography>No active battles</Typography>
              )}
            </Box>
          </Column>

          <Column title="Finished Battles">
            <Box sx={{ mt: 2, display: 'grid', gap: 2 }}>
              {finishedBattles.length > 0 ? (
                finishedBattles.map((b) => {
                  const id = b._id;
                  const title = b.players?.length
                    ? b.players.map(p => p.username ?? p.userId).join(' vs ')
                    : `Battle ${id}`;
                  return (
                    <ActiveBattleItem
                      key={id}
                      id={id}
                      title={title + " (Finished)"}
                    />
                  );
                })
              ) : (
                <Typography>No finished battles</Typography>
              )}
            </Box>
          </Column>
        </Box>
      </Box>
    </Box>
  );
}
