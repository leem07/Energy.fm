import * as React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import HomeIcon from '@mui/icons-material/Home';

export default function IconLabelTabs() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const getTabValue = () => {
    if (location.pathname === '/search') return 1;
    if (location.pathname === '/profile') return 2;
    return 0;
  };

  const [value, setValue] = React.useState(getTabValue());

  const handleChange = (event, newValue) => {
    setValue(newValue);
    if (newValue === 1) {
      navigate('/search');
    } else if (newValue === 0) {
      navigate('/home');
    } else if (newValue === 2) {
      navigate('/profile');
    }
  };

  React.useEffect(() => {
    setValue(getTabValue());
  }, [location.pathname]);

  return (
    <Tabs value={value} onChange={handleChange} aria-label="icon label tabs example" sx={{'& .MuiTabs-indicator': {
      backgroundColor: '#23d3ee',
    },}}>
      <Tab icon={<HomeIcon />} label="Home" sx={{ color: 'white', fontFamily: 'Hanken Grotesk','&.Mui-selected': {
      color: '#23d3ee',
    }, }} />
      <Tab icon={<SearchIcon />} label="Search" sx={{ color: 'white' , fontFamily: 'Hanken Grotesk', '&.Mui-selected': {
      color: '#23d3ee',
    }, }} />
      <Tab icon={<PersonIcon />} label="Profile" sx={{ color: 'white', fontFamily: 'Hanken Grotesk','&.Mui-selected': {
      color: '#23d3ee',
    }, }} />
    </Tabs>
  );
}