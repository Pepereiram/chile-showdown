//import { useState } from 'react'
import './App.css'

import LoginRegister from './components/loginRegister/LoginRegister';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import TeamBuilder from './components/TeamBuilder';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginRegister />} />
        <Route path="/team-builder" element={<TeamBuilder />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
