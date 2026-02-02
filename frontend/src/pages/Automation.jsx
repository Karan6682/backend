import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { Workflow, Plus, Trash2, Power, Zap, HelpCircle, Send, MessageSquare } from 'lucide-react';

const Automation = () => {
    const [rules, setRules] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [templates, setTemplates] = useState([]);
    const [newRule, setNewRule] = useState({
        name: '',
        trigger: { type: 'keyword', content: '' },
        action: { type: 'send_template', content: '' }
    });
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchRules();
        fetchTemplates();
    }, []);

    const fetchRules = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/automation', {
                headers: { 'x-auth-token': token }
            });
            setRules(res.data);
        } catch (err) { }
    };

    const fetchTemplates = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/whatsapp/templates', {
                headers: { 'x-auth-token': token }
            });
            setTemplates(res.data);
        } catch (err) { }
    };

    const handleCreate = async () => {
        if (!newRule.name || !newRule.trigger.content || !newRule.action.content) {
            alert("Please fill all fields!");
            return;
        }
        try {
            await axios.post('http://localhost:5000/api/automation/create', newRule, {
                headers: { 'x-auth-token': token }
            });
            alert("✅ Automation Created Successfully!");
            setShowModal(false);
            setNewRule({ name: '', trigger: { type: 'keyword', content: '' }, action: { type: 'send_template', content: '' } });
            fetchRules();
        } catch (err) {
            alert("Failed to create rule");
        }
    };

    const toggleRule = async (id) => {
        try {
            await axios.put(`http://localhost:5000/api/automation/toggle/${id}`, {}, {
                headers: { 'x-auth-token': token }
            });
            fetchRules();
        } catch (err) { }
    };

    const deleteRule = async (id) => {
        if (!window.confirm("Delete this automation?")) return;
        try {
            await axios.delete(`http://localhost:5000/api/automation/delete/${id}`, {
                headers: { 'x-auth-token': token }
            });
            fetchRules();
        } catch (err) { }
    };

    return (
        <div className="dashboard-container">
            <Sidebar />

            <div className="main-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <div>
                        <h2>⚡ Smart Automation Flows</h2>
                        <p style={{ color: '#94a3b8' }}>Create intelligent auto-replies without coding.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => setShowHelp(true)} className="btn-secondary" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <HelpCircle size={18} /> How it Works
                        </button>
                        <button onClick={() => setShowModal(true)} className="btn-primary" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <Plus size={18} /> New Flow
                        </button>
                    </div>
                </div>

                <div className="glass-card" style={{ marginBottom: '30px', background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1))', border: '1px solid rgba(59,130,246,0.3)' }}>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <Zap size={24} color="#facc15" />
                        <div>
                            <h4 style={{ margin: 0, marginBottom: '5px' }}>💡 Pro Tip</h4>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#cbd5e1' }}>
                                Automation flows work 24/7. When a customer sends a keyword like "PRICE" or "HELP",
                                your system will instantly reply with the template you choose!
                            </p>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                    {rules.map(rule => (
                        <div key={rule._id} className="glass-card" style={{ position: 'relative', borderLeft: `4px solid ${rule.isActive ? '#10b981' : '#64748b'}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <div style={{ padding: '10px', background: 'rgba(59,130,246,0.1)', borderRadius: '8px' }}>
                                        <Workflow size={20} color="#3b82f6" />
                                    </div>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{rule.name}</h3>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <Power
                                        size={18}
                                        color={rule.isActive ? '#10b981' : '#64748b'}
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => toggleRule(rule._id)}
                                        title={rule.isActive ? "Click to Disable" : "Click to Enable"}
                                    />
                                    <Trash2 size={18} color="#ef4444" style={{ cursor: 'pointer' }} onClick={() => deleteRule(rule._id)} />
                                </div>
                            </div>

                            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '10px', fontSize: '0.9rem' }}>
                                <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <MessageSquare size={14} color="#f59e0b" />
                                    <span style={{ color: '#94a3b8' }}>When customer types:</span>
                                    <strong style={{ color: '#facc15', fontSize: '1rem' }}>"{rule.trigger.content}"</strong>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Send size={14} color="#3b82f6" />
                                    <span style={{ color: '#94a3b8' }}>Auto-send template:</span>
                                    <strong style={{ color: 'white' }}>{rule.action.content}</strong>
                                </div>
                            </div>
                            <div style={{ marginTop: '10px', fontSize: '0.7rem', color: rule.isActive ? '#10b981' : '#64748b', textAlign: 'center' }}>
                                {rule.isActive ? '● ACTIVE' : '○ PAUSED'}
                            </div>
                        </div>
                    ))}
                    {rules.length === 0 && (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#64748b', padding: '50px' }}>
                            <Workflow size={40} style={{ opacity: 0.3, marginBottom: '10px' }} />
                            <p>No automations yet. Click "New Flow" to create your first smart reply!</p>
                        </div>
                    )}
                </div>

                {showModal && (
                    <div className="modal-overlay">
                        <div className="modal-content" style={{ width: '550px', maxHeight: '90vh', overflowY: 'auto' }}>
                            <h3 style={{ marginBottom: '20px' }}>⚡ Create Smart Automation</h3>

                            <div className="form-group">
                                <label>Flow Name <span style={{ fontSize: '0.75rem', color: '#64748b' }}>(Internal reference)</span></label>
                                <input
                                    type="text"
                                    placeholder="e.g., Price Inquiry Auto-Reply"
                                    value={newRule.name}
                                    onChange={e => setNewRule({ ...newRule, name: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Trigger Keyword <span style={{ fontSize: '0.75rem', color: '#64748b' }}>(What customer will type)</span></label>
                                <input
                                    type="text"
                                    placeholder="e.g., PRICE, HELP, CATALOG"
                                    style={{ textTransform: 'uppercase', fontWeight: 'bold' }}
                                    value={newRule.trigger.content}
                                    onChange={e => setNewRule({ ...newRule, trigger: { ...newRule.trigger, content: e.target.value.toUpperCase() } })}
                                />
                                <small style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '5px', display: 'block' }}>
                                    💡 Tip: Use simple, common words. System will match if message contains this keyword.
                                </small>
                            </div>

                            <div className="form-group">
                                <label>Auto-Reply Template <span style={{ fontSize: '0.75rem', color: '#64748b' }}>(What system will send)</span></label>
                                <select
                                    value={newRule.action.content}
                                    onChange={e => setNewRule({ ...newRule, action: { ...newRule.action, content: e.target.value } })}
                                    style={{ padding: '12px' }}
                                >
                                    <option value="">-- Select Template --</option>
                                    {templates.filter(t => t.status === 'APPROVED').map(t => (
                                        <option key={t.name} value={t.name}>✅ {t.name}</option>
                                    ))}
                                </select>
                                {templates.filter(t => t.status === 'APPROVED').length === 0 && (
                                    <small style={{ color: '#ef4444', marginTop: '5px', display: 'block' }}>
                                        ⚠️ No approved templates found. Create one in Templates tab first.
                                    </small>
                                )}
                            </div>

                            {newRule.trigger.content && newRule.action.content && (
                                <div style={{ background: 'rgba(59,130,246,0.1)', padding: '15px', borderRadius: '12px', marginTop: '20px', border: '1px solid rgba(59,130,246,0.3)' }}>
                                    <h4 style={{ margin: 0, marginBottom: '10px', fontSize: '0.9rem', color: '#3b82f6' }}>📋 Preview</h4>
                                    <div style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>
                                        <div style={{ marginBottom: '8px' }}>
                                            <strong style={{ color: '#facc15' }}>Customer:</strong>
                                            <span style={{ color: '#cbd5e1' }}> "Hi, I want {newRule.trigger.content}"</span>
                                        </div>
                                        <div>
                                            <strong style={{ color: '#10b981' }}>Your System (Auto):</strong>
                                            <span style={{ color: '#cbd5e1' }}> Sends "{newRule.action.content}" template instantly!</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
                                <button className="btn-secondary" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Cancel</button>
                                <button className="btn-primary" onClick={handleCreate} style={{ flex: 1 }}>Create Automation</button>
                            </div>
                        </div>
                    </div>
                )}

                {showHelp && (
                    <div className="modal-overlay">
                        <div className="modal-content" style={{ width: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
                            <h3 style={{ marginBottom: '20px' }}>📚 How Automation Works</h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px' }}>
                                    <h4 style={{ color: '#3b82f6', marginBottom: '10px' }}>1️⃣ What is Automation?</h4>
                                    <p style={{ color: '#cbd5e1', lineHeight: '1.6', margin: 0 }}>
                                        Automation lets your WhatsApp reply to customers automatically, 24/7.
                                        No need to manually type replies for common questions!
                                    </p>
                                </div>

                                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px' }}>
                                    <h4 style={{ color: '#10b981', marginBottom: '10px' }}>2️⃣ How Does It Work?</h4>
                                    <ul style={{ color: '#cbd5e1', lineHeight: '1.8', paddingLeft: '20px' }}>
                                        <li>Customer sends a message containing your keyword (e.g., "PRICE")</li>
                                        <li>System detects the keyword instantly</li>
                                        <li>Your chosen template is sent automatically</li>
                                        <li>Customer gets instant reply, even at 3 AM!</li>
                                    </ul>
                                </div>

                                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px' }}>
                                    <h4 style={{ color: '#facc15', marginBottom: '10px' }}>3️⃣ Real Examples</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', borderLeft: '3px solid #3b82f6' }}>
                                            <strong style={{ color: '#3b82f6' }}>Keyword:</strong> PRICE<br />
                                            <strong style={{ color: '#10b981' }}>Action:</strong> Send "Price List" template
                                        </div>
                                        <div style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', borderLeft: '3px solid #8b5cf6' }}>
                                            <strong style={{ color: '#8b5cf6' }}>Keyword:</strong> HELP<br />
                                            <strong style={{ color: '#10b981' }}>Action:</strong> Send "Customer Support" template
                                        </div>
                                        <div style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', borderLeft: '3px solid #ec4899' }}>
                                            <strong style={{ color: '#ec4899' }}>Keyword:</strong> CATALOG<br />
                                            <strong style={{ color: '#10b981' }}>Action:</strong> Send "Product Catalog" template
                                        </div>
                                    </div>
                                </div>

                                <div style={{ background: 'rgba(239,68,68,0.1)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(239,68,68,0.3)' }}>
                                    <h4 style={{ color: '#ef4444', marginBottom: '8px', fontSize: '0.9rem' }}>⚠️ Important Notes</h4>
                                    <ul style={{ color: '#fca5a5', fontSize: '0.85rem', lineHeight: '1.6', paddingLeft: '20px', margin: 0 }}>
                                        <li>Keywords are case-insensitive (PRICE = price = Price)</li>
                                        <li>Only APPROVED templates can be used</li>
                                        <li>Toggle the power button to pause/resume flows</li>
                                    </ul>
                                </div>
                            </div>

                            <button className="btn-primary" onClick={() => setShowHelp(false)} style={{ width: '100%', marginTop: '20px' }}>
                                Got it!
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Automation;
