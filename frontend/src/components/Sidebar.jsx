import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Send, FileText, Globe, Wallet, Settings, BarChart3, Users, Workflow, UserCircle } from 'lucide-react';

const Sidebar = () => {
    const location = useLocation();

    const menuItems = [
        { path: '/dashboard', label: 'Overview', icon: LayoutDashboard },
        { path: '/chat', label: 'Inbox', icon: MessageSquare },
        { path: '/contacts', label: 'Contacts', icon: UserCircle }, // New Contacts
        { path: '/automation', label: 'Flows', icon: Workflow },
        { path: '/campaign', label: 'Campaigns', icon: Send },
        { path: '/reports', label: 'Reports', icon: BarChart3 },
        { path: '/templates', label: 'Templates', icon: FileText },
        { path: '/team', label: 'Team', icon: Users },
        { path: '/wallet', label: 'Wallet', icon: Wallet },
        { path: '/profile', label: 'Profile', icon: Settings },
        { path: '/connect', label: 'Connect Meta', icon: Globe },
    ];

    return (
        <div className="sidebar">
            <div style={{ padding: '20px', marginBottom: '20px' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>Main Menu</div>
            </div>
            {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`sidebar-item ${isActive ? 'active' : ''}`}
                    >
                        <Icon size={20} />
                        {item.label}
                    </Link>
                );
            })}

            <div style={{ marginTop: 'auto', padding: '20px' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.65rem', color: '#64748b' }}>Powered by</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#94a3b8', letterSpacing: '0.5px' }}>STARNEXT TECHNOLOGIES</div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
