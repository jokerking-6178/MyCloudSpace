import { useState } from 'react'
import './App.css'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing/Landing'
import Dashboard from './pages/dashboard/Dashboard'
import LoginModal from './components/Login/Login';
import RegisterModal from './components/Register/Register';
import OAuth2RedirectHandler from './components/OauthHandler/OAuth2RedirectHandler';

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path='/login' element={<LoginModal />} />
          <Route path='/register' element={<RegisterModal />} />
          <Route path='/oauth2/redirect' element={<OAuth2RedirectHandler />} />
        </Routes>
      </Router>
      <ToastContainer />
    </>
  )
}

export default App
