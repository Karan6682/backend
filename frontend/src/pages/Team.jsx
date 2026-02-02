import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { Users, UserPlus, Shield, UserCheck, Trash2 } from 'lucide-react';

const Team = () => {
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchAgents();
    }, []);

    const fetchAgents = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:5000/api/team', {
                headers: { 'x-auth-token': token }
            });
            setAgents(res.data);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const handleAddAgent = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/team/add', formData, {
                headers: { 'x-auth-token': token }
            });
            alert("Agent added successfully!");
            setFormData({ name: '', email: '', password: '' });
            fetchAgents();
        } catch (err) {
            alert(err.response?.data?.msg || "Failed to add agent");
        }
    };

    return (
        <div className="dashboard-container">
            <Sidebar />

            <div className="main-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <div>
                        <h2>Team Management</h2>
                        <p style={{ color: '#94a3b8' }}>Add staff members to handle chats and campaigns.</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '30px' }}>
                    {/* Add Agent Form */}
                    <div className="glass-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                            <UserPlus size={20} color="#3b82f6" />
                            <h3 style={{ margin: 0 }}>Add New Staff</h3>
                        </div>
                        <form onSubmit={handleAddAgent} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Agent Name"
                                />
                            </div>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="agent@company.com"
                                />
                            </div>
                            <div className="form-group">
                                <label>Password</label>
                                <input
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="Minimum 6 characters"
                                />
                            </div>
                            <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>
                                Register Staff
                            </button>
                        </form>
                    </div>

                    {/* Agent List */}
                    <div className="glass-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                            <Users size={20} color="#3b82f6" />
                            <h3 style={{ margin: 0 }}>Active Team Members</h3>
                        </div>

                        {loading ? (
                            <p>Loading team...</p>
                        ) : agents.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {agents.map(agent => (
                                    <div key={agent._id} style={{ padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                            <div style={{ width: '40px', height: '40px', background: '#3b82f622', color: '#3b82f6', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <UserCheck size={20} />
                                            </div>
                                            <div>
                                                <h4 style={{ margin: 0 }}>{agent.name}</h4>
                                                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>{agent.email}</p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.7rem', padding: '4px 8px', background: '#1e293b', borderRadius: '5px', color: '#94a3b8' }}>AGENT</span>
                                            <Trash2 size={16} color="#ef4444" style={{ cursor: 'pointer' }} title="Remove access" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                <Shield size={40} style={{ marginBottom: '10px', opacity: 0.5 }} />
                                <p>No staff members added yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Team;
