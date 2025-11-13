//import { useState } from 'react'
import './App.css'

import LoginRegister from './pages/loginRegister/LoginRegister';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuth } from './hooks/useAuth';
import TeamBuilder from './pages/teamBuilder/TeamBuilder';
import Home from './pages/home/Home';
import Profile from './pages/profile/Profile';
import Navtab from './components/Navtab';

const App: React.FC = () => {
  const { isLoggedIn } = useAuth();

  const navTabs = [
    { label: 'Login', path: '/' },
    { label: 'Home', path: '/home' },
    { label: 'Team Builder', path: '/team-builder' },
    { label: 'Profile', path: '/profile' },
  ];

  return (
    <BrowserRouter>
      <div className="content mt-16">
        <Navtab tabs={navTabs} />
        <Routes>
              <Route path="/" element={<LoginRegister />} />
              <Route path="/home" element={<Home />} />
              <Route path="/team-builder" element={<TeamBuilder />} />
              <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App
