//import { useState } from 'react'
import './App.css'

import LoginRegister from './components/loginRegister/LoginRegister';
import { BrowserRouter, Routes, Route } from "react-router-dom";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginRegister />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
