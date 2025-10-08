//import { useState } from 'react'
import './App.css'

import LoginRegister from './components/loginRegister/LoginRegister';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import TeamBuilder from './components/TeamBuilder';
import Home from './pages/home/Home';
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginRegister />} />
        <Route path="/home" element={<Home />} />
        <Route path="/team-builder" element={<TeamBuilder />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
