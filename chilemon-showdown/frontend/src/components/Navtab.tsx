import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export interface NavTabItem {
  label: string;
  path: string;
}

interface NavtabProps {
  tabs: NavTabItem[];
  /** Optional list of paths where the nav should be hidden */
  hidePaths?: string[];
}

export default function Navtab({ tabs, hidePaths }: NavtabProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const currentIndex = React.useMemo(
    () => Math.max(tabs.findIndex((tab) => tab.path === location.pathname), 0),
    [location.pathname, tabs],
  );

  const [value, setValue] = React.useState<number>(currentIndex);

  React.useEffect(() => {
    setValue(currentIndex);
  }, [currentIndex]);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    navigate(tabs[newValue].path);
  };

  // auth (optional) - update login state when logging out
  const auth = useAuth();

  const handleLogout = () => {
    try {
      localStorage.removeItem('user');
      // support auth implementations that expose a setter (optional)
      (auth as any)?.setIsLoggedIn?.(false);
    } catch (e) {
      // ignore
    }
    navigate('/');
  };

  // hide when location is explicitly in hidePaths or when at root '/'
  const shouldHide = (hidePaths ?? []).includes(location.pathname) || location.pathname === '/';
  if (shouldHide) return null;

  return (
    <AppBar position="fixed" color="default" elevation={1} sx={{ top: 0 }}>
      <Toolbar variant="dense" sx={{ paddingLeft: 1, paddingRight: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="navigation tabs"
            variant="scrollable"
            scrollButtons="auto"
            sx={{ flex: 1 }}
          >
            {tabs.map((tab, index) => (
              <Tab
                key={tab.path}
                label={tab.label}
                id={`nav-tab-${index}`}
                aria-controls={`nav-tabpanel-${index}`}
              />
            ))}
          </Tabs>

          <Button color="inherit" onClick={handleLogout} sx={{ marginLeft: 2 }} aria-label="logout">
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}