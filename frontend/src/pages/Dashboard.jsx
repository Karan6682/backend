import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, Clock, AlertCircle, Plus, Globe } from 'lucide-react';

const Dashboard = () => {
    const [metaInfo, setMetaInfo] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [campaigns, setCampaigns] = useState([]);
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [wallet, setWallet] = useState({ balance: 0, perMessageCost: 0.50 });
    const token = localStorage.getItem('token');
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const isDemo = params.get('demo') === 'true';

    useEffect(() => {
        // If demo mode is active (from ?demo=true), populate demo data and skip API calls
        if (isDemo) {
            setMetaInfo({ isVerified: true, phoneNumber: '+91 98765 43210' });
            setUserProfile({ name: 'Demo User', company: 'Demo Corp', businessProfile: { logo: 'https://via.placeholder.com/80' } });
            setCampaigns([
                {
                    _id: 'demo-1', name: 'Welcome Campaign', templateName: 'Welcome Template', totalContacts: 1200,
                    sentCount: 1180, deliveredCount: 1150, failedCount: 30, status: 'completed', createdAt: new Date().toISOString(), logs: []
                },
                {
                    _id: 'demo-2', name: 'Promo Blast', templateName: 'Promo Template', totalContacts: 5000,
                    sentCount: 4500, deliveredCount: 4300, failedCount: 200, status: 'running', createdAt: new Date().toISOString(), logs: []
                }
            ]);
            setWallet({ balance: 499.00, perMessageCost: 0.50 });
        } else {
            const fetchData = async () => {
                try {
                    // Fetch Meta Status
                    const metaRes = await axios.get('http://localhost:5000/api/client/meta', {
                        headers: { 'x-auth-token': token }
                    });
                    setMetaInfo(metaRes.data);

                    // Fetch Full Profile (Company Info)
                    const profileRes = await axios.get('http://localhost:5000/api/profile', {
                        headers: { 'x-auth-token': token }
                    });
                    setUserProfile(profileRes.data);

                    const campaignRes = await axios.get('http://localhost:5000/api/campaign/list', {
                        headers: { 'x-auth-token': token }
                    });
                    setCampaigns(campaignRes.data);

                    // Fetch Wallet Balance
                    const walletRes = await axios.get('http://localhost:5000/api/wallet/balance', {
                        headers: { 'x-auth-token': token }
                    });
                    setWallet(walletRes.data);
                } catch (err) {
                    console.error(err);
                }
            };

            fetchData();
        }

        // Auto refresh if a campaign is running
        const interval = setInterval(() => {
            fetchData();
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="dashboard-container">
            <Sidebar />

            <div className="main-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>

                    {/* Welcome Section */}
                    <div>
                        <h2 style={{ fontSize: '1.8rem', marginBottom: '5px' }}>Dashboard Overview</h2>
                        <p style={{ color: '#94a3b8' }}>Welcome back, <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>{userProfile?.name?.split(' ')[0]}</span>!</p>
                    </div>

                    {/* Right Side: Business Branding & Action */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>

                        {/* Business Profile Display */}
                        {userProfile?.businessProfile?.logo && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.05)', padding: '8px 15px', borderRadius: '30px' }}>
                                <img
                                    src={userProfile.businessProfile.logo}
                                    alt="Logo"
                                    style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }}
                                />
                                <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{userProfile.company || 'My Business'}</span>
                            </div>
                        )}

                        <Link to="/campaign" className="btn-primary" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Plus size={18} /> New Campaign
                        </Link>
                    </div>
                </div>

                {/* Stats Calculation Helper */}
                {(() => {
                    const today = new Date().toDateString();
                    const todayCampaigns = campaigns.filter(c => new Date(c.createdAt).toDateString() === today);

                    const getStats = (list) => ({
                        submitted: list.reduce((acc, c) => acc + (c.totalContacts || 0), 0),
                        sent: list.reduce((acc, c) => acc + (c.sentCount || 0), 0),
                        delivered: list.reduce((acc, c) => acc + (c.deliveredCount || 0), 0),
                        failed: list.reduce((acc, c) => acc + (c.failedCount || 0), 0)
                    });

                    const todayStats = getStats(todayCampaigns);
                    const overallStats = getStats(campaigns);

                    return (
                        <>
                            {/* WALLET & SUMMARY ROW */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                                {/* Wallet Card */}
                                <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(16, 185, 129, 0.1))' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.9rem', marginBottom: '10px' }}>
                                        <span>Wallet Balance</span>
                                        <Globe size={16} color="#10b981" />
                                    </div>
                                    <h3 style={{ fontSize: '1.8rem', color: '#10b981' }}>₹{wallet.balance?.toFixed(2) || '0.00'}</h3>
                                    <Link to="/wallet">
                                        <button className="btn-primary" style={{ width: '100%', marginTop: '10px', padding: '8px', fontSize: '0.8rem' }}>Recharge Wallet</button>
                                    </Link>
                                </div>

                                <div className="glass-card">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.9rem', marginBottom: '10px' }}>
                                        <span>Connection Status</span>
                                        {metaInfo?.isVerified ? <CheckCircle size={16} color="#25d366" /> : <AlertCircle size={16} color="#ef4444" />}
                                    </div>
                                    <h3 style={{ fontSize: '1.5rem', color: metaInfo?.isVerified ? '#25d366' : '#ef4444' }}>
                                        {metaInfo?.isVerified ? 'Active' : 'Offline'}
                                    </h3>
                                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '5px' }}>{metaInfo?.phoneNumber || 'No Number'}</p>
                                </div>
                            </div>

                            {/* TODAY'S STATISTICS (4 Cards) */}
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', color: '#e2e8f0' }}>Today's Statistics</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                                <div className="glass-card">
                                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '5px' }}>Total Submitted</p>
                                    <h3 style={{ fontSize: '1.5rem' }}>{todayStats.submitted.toLocaleString()}</h3>
                                    <p style={{ fontSize: '0.7rem', color: '#10b981' }}>▲ Today</p>
                                </div>
                                <div className="glass-card">
                                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '5px' }}>Total Sent</p>
                                    <h3 style={{ fontSize: '1.5rem' }}>{todayStats.sent.toLocaleString()}</h3>
                                    <p style={{ fontSize: '0.7rem', color: '#10b981' }}>▲ Today</p>
                                </div>
                                <div className="glass-card">
                                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '5px' }}>Total Delivered</p>
                                    <h3 style={{ fontSize: '1.5rem', color: '#25d366' }}>{todayStats.delivered.toLocaleString()}</h3>
                                    <p style={{ fontSize: '0.7rem', color: '#10b981' }}>▲ Today</p>
                                </div>
                                <div className="glass-card">
                                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '5px' }}>Total Failed</p>
                                    <h3 style={{ fontSize: '1.5rem', color: '#ef4444' }}>{todayStats.failed.toLocaleString()}</h3>
                                    <p style={{ fontSize: '0.7rem', color: '#ef4444' }}>▼ Today</p>
                                </div>
                            </div>

                            {/* LIFETIME STATISTICS (4 Cards) */}
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', color: '#e2e8f0' }}>Lifetime Statistics</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                                <div className="glass-card">
                                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '5px' }}>Total Submitted</p>
                                    <h3 style={{ fontSize: '1.5rem' }}>{overallStats.submitted.toLocaleString()}</h3>
                                </div>
                                <div className="glass-card">
                                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '5px' }}>Total Sent</p>
                                    <h3 style={{ fontSize: '1.5rem' }}>{overallStats.sent.toLocaleString()}</h3>
                                </div>
                                <div className="glass-card">
                                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '5px' }}>Total Delivered</p>
                                    <h3 style={{ fontSize: '1.5rem', color: '#25d366' }}>{overallStats.delivered.toLocaleString()}</h3>
                                </div>
                                <div className="glass-card">
                                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '5px' }}>Total Failed</p>
                                    <h3 style={{ fontSize: '1.5rem', color: '#ef4444' }}>{overallStats.failed.toLocaleString()}</h3>
                                </div>
                            </div>
                        </>
                    );
                })()}

                <h3 style={{ marginBottom: '20px' }}>Recent Campaigns</h3>
                <div className="glass-card" style={{ padding: '0' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ color: '#94a3b8', fontSize: '0.85rem', borderBottom: '1px solid #1e293b' }}>
                                <th style={{ padding: '16px 24px' }}>Campaign Name</th>
                                <th style={{ padding: '16px 24px' }}>Template</th>
                                <th style={{ padding: '16px 24px' }}>Sent</th>
                                <th style={{ padding: '16px 24px' }}>Status</th>
                                <th style={{ padding: '16px 24px' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {campaigns.length > 0 ? campaigns.map(camp => (
                                <tr key={camp._id} style={{ borderBottom: '1px solid #1e293b', fontSize: '0.9rem' }}>
                                    <td style={{ padding: '16px 24px', fontWeight: '500' }}>{camp.name}</td>
                                    <td style={{ padding: '16px 24px', color: '#94a3b8' }}>{camp.templateName}</td>
                                    <td style={{ padding: '16px 24px' }}>{camp.sentCount} / {camp.totalContacts}</td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: '20px',
                                            fontSize: '0.75rem',
                                            background: camp.status === 'completed' ? 'rgba(37, 211, 102, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                                            color: camp.status === 'completed' ? '#25d366' : '#3b82f6'
                                        }}>
                                            {camp.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <button
                                            onClick={() => setSelectedCampaign(camp)}
                                            style={{ background: 'rgba(59, 130, 246, 0.1)', border: 'none', color: '#3b82f6', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}
                                        >
                                            View Logs
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No campaigns found. Create your first one!</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* LOGS MODAL */}
            {selectedCampaign && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                    <div className="glass-card" style={{ width: '100%', maxWidth: '700px', maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0 }}>Campaign: {selectedCampaign.name}</h3>
                            <button onClick={() => setSelectedCampaign(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                <thead style={{ position: 'sticky', top: 0, background: '#1e293b' }}>
                                    <tr style={{ color: '#94a3b8', textAlign: 'left', borderBottom: '1px solid #334155' }}>
                                        <th style={{ padding: '12px' }}>Number</th>
                                        <th style={{ padding: '12px' }}>Status</th>
                                        <th style={{ padding: '12px' }}>Error/Reason</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(selectedCampaign.logs || []).map((log, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid #1e293b' }}>
                                            <td style={{ padding: '12px' }}>+{log.number}</td>
                                            <td style={{ padding: '12px' }}>
                                                <span style={{ color: log.status === 'success' ? '#25d366' : '#ef4444' }}>
                                                    {log.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px', color: '#94a3b8' }}>{log.error || '-'}</td>
                                        </tr>
                                    ))}
                                    {(!selectedCampaign.logs || selectedCampaign.logs.length === 0) && (
                                        <tr>
                                            <td colSpan="3" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No logs available for this campaign.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div style={{ marginTop: '20px', textAlign: 'right' }}>
                            <button onClick={() => setSelectedCampaign(null)} className="btn-secondary">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
