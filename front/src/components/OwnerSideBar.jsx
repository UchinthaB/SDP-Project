import React from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Box,
  Typography,
  styled
} from '@mui/material';
import { 
  Dashboard,
  People,
  Store,
  Assessment,
  Settings,
  ExitToApp,
  RestaurantMenu
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const DrawerHeader = styled('div')(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`
}));

const OwnerSidebar = () => {
  const navigate = useNavigate();

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/owner/dashboard' },
    { text: 'Menu Management', icon: <RestaurantMenu />, path: '/owner/menu' },
    { text: 'Staff Management', icon: <People />, path: '/owner/staff' },
    { text: 'Restaurant Profile', icon: <Store />, path: '/owner/profile' },
    { text: 'Reports & Analytics', icon: <Assessment />, path: '/owner/reports' },
    { text: 'Settings', icon: <Settings />, path: '/owner/settings' },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
          backgroundColor: '#1a1a1a',
          color: 'grey'
        },
      }}
    >
      <DrawerHeader>
        <Typography variant="h6" color="black">
          Restaurant Owner
        </Typography>
      </DrawerHeader>
      
      <List>
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.text}
            onClick={() => navigate(item.path)}
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(28, 7, 7, 0.1)'
              }
            }}
          >
            <ListItemIcon sx={{ color: 'white' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      
      <Box sx={{ position: 'absolute', bottom: 0, width: '100%' }}>
        <List>
          <ListItem 
            button 
            onClick={() => navigate('/logout')}
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            <ListItemIcon sx={{ color: 'white' }}>
              <ExitToApp />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
};

export default OwnerSidebar;
