import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { useLocation, useNavigate } from 'react-router-dom';

export interface NavTabItem {
  label: string;
  path: string;
}

interface NavtabProps {
  tabs: NavTabItem[];
}

export default function BasicTabs({ tabs }: NavtabProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const currentIndex = React.useMemo(
    () => Math.max(tabs.findIndex((tab) => tab.path === location.pathname), 0),
    [location.pathname, tabs],
  );

  const [value, setValue] = React.useState(currentIndex);

  React.useEffect(() => {
    setValue(currentIndex);
  }, [currentIndex]);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    navigate(tabs[newValue].path);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Tabs value={value} onChange={handleChange} aria-label="navigation tabs" variant="scrollable" scrollButtons="auto">
        {tabs.map((tab, index) => (
          <Tab key={tab.path} label={tab.label} id={`nav-tab-${index}`} aria-controls={`nav-tabpanel-${index}`} />
        ))}
      </Tabs>
    </Box>
  );
}