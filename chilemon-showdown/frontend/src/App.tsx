﻿//import { useState } from 'react'
import './App.css'

import LoginRegister from './pages/loginRegister/LoginRegister';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import TeamBuilder from './pages/teamBuilder/TeamBuilder';
import Home from './pages/home/Home';
import Profile from './pages/profile/Profile';

const App: React.FC = () => {

  return (
    <BrowserRouter>
      <div className="content mt-16">
      <Routes>
        <Route path="/" element={<LoginRegister />} />
        <Route path="/home" element={<Home />} />
        <Route path="/team-builder" element={<TeamBuilder />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
