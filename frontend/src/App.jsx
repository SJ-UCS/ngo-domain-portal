import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import api from './api';
import Home from './pages/Home';
import NGOs from './pages/NGOs';
import NGOProfile from './pages/NGOProfile';
import Login from './pages/Login';
import Register from './pages/Register';
import Donate from './pages/Donate';
import AddCampaign from './pages/AddCampaign';

export default function App() {
  const [user, setUser] = useState(null);
  const [campaignCount, setCampaignCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      // Fetch updated profile with campaign count
      fetchUserProfile();
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/auth/profile');
      setUser(response.data.user);
      setCampaignCount(response.data.user.campaign_participation_count || 0);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCampaignCount(0);
  };

  return (
    <div className="app">
      <nav className="nav">
        <div className="brand">NGO Portal</div>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/ngos">NGOs</Link>
          
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{user.profile_icon || '👤'}</span>
                <div className="text-sm">
                  <div className="font-semibold">{user.name}</div>
                  <div className="text-muted">
                    {campaignCount} campaign{campaignCount !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="btn btn-secondary text-sm"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </nav>
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ngos" element={<NGOs />} />
          <Route path="/ngos/:id" element={<NGOProfile />} />
          <Route path="/donate/:campaignId" element={<Donate />} />
          <Route path="/add-campaign" element={<AddCampaign />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
      <footer className="footer">Made with ❤️ for social good</footer>
    </div>
  );
}
