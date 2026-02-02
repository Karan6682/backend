import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Campaign from './pages/Campaign';
import Connect from './pages/Connect';
import Templates from './pages/Templates';
import Privacy from './pages/Privacy';
import Chat from './pages/Chat';
import TokenGuide from './pages/TokenGuide';
import Wallet from './pages/Wallet';
import Profile from './pages/Profile';
import Reports from './pages/Reports';
import Team from './pages/Team';
import Automation from './pages/Automation';
import Contacts from './pages/Contacts';

function App() {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <div className="bg-gradient"></div>
            <div className="glow" style={{ top: '10%', left: '10%' }}></div>
            <div className="glow" style={{ bottom: '10%', right: '10%' }}></div>

            <Navbar user={user} logout={logout} />

            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to="/dashboard" />} />
                <Route path="/signup" element={!user ? <Signup setUser={setUser} /> : <Navigate to="/dashboard" />} />

                <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
                <Route path="/campaign" element={user ? <Campaign /> : <Navigate to="/login" />} />
                <Route path="/connect" element={user ? <Connect /> : <Navigate to="/login" />} />
                <Route path="/templates" element={user ? <Templates /> : <Navigate to="/login" />} />
                <Route path="/chat" element={user ? <Chat /> : <Navigate to="/login" />} />
                <Route path="/wallet" element={user ? <Wallet /> : <Navigate to="/login" />} />
                <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
                <Route path="/reports" element={user ? <Reports /> : <Navigate to="/login" />} />
                <Route path="/team" element={user ? <Team /> : <Navigate to="/login" />} />
                <Route path="/automation" element={user ? <Automation /> : <Navigate to="/login" />} />
                <Route path="/contacts" element={user ? <Contacts /> : <Navigate to="/login" />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/token-guide" element={<TokenGuide />} />
            </Routes>
        </Router>
    );
}

export default App;
