//import { useState } from 'react'
import './App.css'

import LoginRegister from './pages/loginRegister/LoginRegister';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuth } from './hooks/useAuth';
import TeamBuilder from './pages/teamBuilder/TeamBuilder';
import Home from './pages/home/Home';
import Profile from './pages/profile/Profile';
import LayoutNavbar from './components/LayoutNavbar';


const App: React.FC = () => {
  const {isLoggedIn} = useAuth();

  return (
    <BrowserRouter>
      <LayoutNavbar />
      <div className="content mt-16">
      <Routes>
        {true ? (<>
        <Route path="/" element={<LoginRegister />} />
        <Route path="/home" element={<Home />} />
        <Route path="/team-builder" element={<TeamBuilder />} />
        <Route path="/profile" element={<Profile />} />
        </>) : (
        <Route path="*" element={<LoginRegister />} />
        )}
      </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
