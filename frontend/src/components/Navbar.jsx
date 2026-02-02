import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageSquare, LogOut, User as UserIcon, LayoutDashboard, Send, Globe } from 'lucide-react';

const Navbar = ({ user, logout }) => {
    const navigate = useNavigate();

    return (
        <nav>
            <Link to="/" className="logo" style={{ textDecoration: 'none', color: 'inherit' }}>
                <MessageSquare size={32} color="#25d366" />
                <span>Cloud<span style={{ color: '#25d366' }}>CRM</span></span>
            </Link>

            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                {/* Language Switcher */}
                <select
                    onChange={(e) => localStorage.setItem('language', e.target.value)}
                    defaultValue={localStorage.getItem('language') || 'en'}
                    style={{
                        padding: '6px 12px',
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                    }}
                >
                    <option value="en">🇬🇧 English</option>
                    <option value="hi">🇮🇳 हिंदी</option>
                </select>

                {user ? (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginRight: '10px', padding: '5px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px' }}>
                            <UserIcon size={16} color="#3b82f6" />
                            <span style={{ fontSize: '0.9rem', color: '#e2e8f0' }}>{user.name}</span>
                        </div>
                        <Link to="/dashboard" className="sidebar-item" style={{ padding: '8px 15px' }}>
                            <LayoutDashboard size={20} />
                            Dashboard
                        </Link>
                        <button onClick={logout} className="btn-secondary" style={{ padding: '8px 15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <LogOut size={18} />
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>Login</Link>
                        <Link to="/signup" className="btn-primary" style={{ textDecoration: 'none' }}>Get Started</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
