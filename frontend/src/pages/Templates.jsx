import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, CheckCircle, Clock, Trash2, Edit, RefreshCw, X, Send } from 'lucide-react';
import Sidebar from '../components/Sidebar';

const Templates = () => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newTemplate, setNewTemplate] = useState({
        name: '',
        category: 'MARKETING',
        language: 'en_US',
        body: '',
        headerType: 'NONE', // NONE, TEXT, IMAGE, VIDEO, DOCUMENT
        headerText: '',
        footer: '',
        buttons: [] // { type: 'QUICK_REPLY'|'URL'|'PHONE', text: '', value: '' }
    });
    const [submitting, setSubmitting] = useState(false);
    const token = localStorage.getItem('token');

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:5000/api/whatsapp/templates', {
                headers: { 'x-auth-token': token }
            });
            setTemplates(res.data.data || []);
        } catch (err) {
            console.error("Failed to fetch templates", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const components = [];

            // 1. Header
            if (newTemplate.headerType && newTemplate.headerType !== 'NONE') {
                components.push({
                    type: 'HEADER',
                    format: newTemplate.headerType,
                    text: newTemplate.headerType === 'TEXT' ? newTemplate.headerText : undefined,
                });
            }

            // 2. Body
            components.push({
                type: 'BODY',
                text: newTemplate.body
            });

            // 3. Footer
            if (newTemplate.footer) {
                components.push({
                    type: 'FOOTER',
                    text: newTemplate.footer
                });
            }

            // 4. Buttons
            if (newTemplate.buttons?.length > 0) {
                const buttons = newTemplate.buttons.map(btn => {
                    if (btn.type === 'QUICK_REPLY') {
                        return { type: 'QUICK_REPLY', text: btn.text };
                    } else if (btn.type === 'PHONE_NUMBER') {
                        return { type: 'PHONE_NUMBER', text: btn.text, phone_number: btn.value };
                    } else if (btn.type === 'URL') {
                        return { type: 'URL', text: btn.text, url: btn.value };
                    }
                    return null;
                }).filter(Boolean);

                components.push({
                    type: 'BUTTONS',
                    buttons: buttons
                });
            }

            const templateData = {
                name: newTemplate.name.toLowerCase().replace(/\s+/g, '_'),
                category: newTemplate.category,
                language: newTemplate.language,
                components: components
            };

            await axios.post('http://localhost:5000/api/whatsapp/templates/create', templateData, {
                headers: { 'x-auth-token': token }
            });

            setShowModal(false);
            setNewTemplate({
                name: '', category: 'MARKETING', language: 'en_US', body: '',
                headerType: 'NONE', headerText: '', footer: '', buttons: []
            });
            fetchTemplates();
            alert('Template submitted for approval!');
        } catch (err) {
            alert('Template creation failed: ' + (err.response?.data?.error?.error?.message || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (name) => {
        if (!window.confirm(`Are you sure you want to delete template "${name}"?`)) return;

        try {
            await axios.delete(`http://localhost:5000/api/whatsapp/templates/delete/${name}`, {
                headers: { 'x-auth-token': token }
            });
            alert('Template deleted successfully!');
            fetchTemplates();
        } catch (err) {
            alert('Template deletion failed: ' + (err.response?.data?.error || err.message));
        }
    };

    // Helper functions for buttons
    const addButton = (type) => {
        const current = newTemplate.buttons || [];
        if (current.length >= 3) return alert("Max 3 buttons allowed");
        setNewTemplate(prev => ({ ...prev, buttons: [...current, { type, text: '', value: '' }] }));
    };

    const updateButton = (idx, field, val) => {
        const updated = [...(newTemplate.buttons || [])];
        updated[idx][field] = val;
        setNewTemplate(prev => ({ ...prev, buttons: updated }));
    };

    const removeButton = (idx) => {
        const updated = (newTemplate.buttons || []).filter((_, i) => i !== idx);
        setNewTemplate(prev => ({ ...prev, buttons: updated }));
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    return (
        <div className="dashboard-container">
            <Sidebar />

            <div className="main-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <div>
                        <h2>Message Templates</h2>
                        <p style={{ color: '#94a3b8' }}>Templates are required for business-initiated conversations.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <button className="btn-secondary" onClick={fetchTemplates} disabled={loading}>
                            {loading ? <RefreshCw className="animate-spin" size={18} /> : <RefreshCw size={18} />}
                            Sync from Meta
                        </button>
                        <button className="btn-primary" onClick={() => setShowModal(true)}>
                            <Plus size={18} /> Create Template
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '100px', color: '#64748b' }}>
                        <RefreshCw className="animate-spin" size={40} style={{ marginBottom: '20px' }} />
                        <p>Fetching templates from Meta Cloud API...</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                        {templates.map((tpl, i) => {
                            const bodyComp = tpl.components?.find(c => c.type === 'BODY');
                            return (
                                <div key={i} className="glass-card">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '6px',
                                            background: 'rgba(255,255,255,0.05)',
                                            fontSize: '0.7rem',
                                            color: '#94a3b8'
                                        }}>{tpl.category}</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            {tpl.status === 'APPROVED' ? (
                                                <><CheckCircle size={14} color="#25d366" /><span style={{ fontSize: '0.75rem', color: '#25d366' }}>Approved</span></>
                                            ) : (
                                                <><Clock size={14} color="#f59e0b" /><span style={{ fontSize: '0.75rem', color: '#f59e0b' }}>{tpl.status}</span></>
                                            )}
                                        </div>
                                    </div>
                                    <h4 style={{ marginBottom: '10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tpl.name}</h4>
                                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '8px', fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '15px', whiteSpace: 'pre-wrap' }}>
                                        {tpl.components?.find(c => c.type === 'HEADER') && <div style={{ fontWeight: 'bold', marginBottom: '5px', color: 'white' }}>{tpl.components.find(c => c.type === 'HEADER').format} HEADER</div>}
                                        {bodyComp?.text || 'No body text'}
                                        {tpl.components?.find(c => c.type === 'FOOTER') && <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '10px' }}>{tpl.components.find(c => c.type === 'FOOTER').text}</div>}
                                        {tpl.components?.find(c => c.type === 'BUTTONS') && <div style={{ marginTop: '10px', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                                            {tpl.components.find(c => c.type === 'BUTTONS').buttons.map((b, bi) => (
                                                <span key={bi} style={{ background: '#3b82f6', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem' }}>{b.text}</span>
                                            ))}
                                        </div>}
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid #1e293b', paddingTop: '15px' }}>
                                        <button className="btn-secondary" style={{ padding: '8px', flex: 1 }}><Edit size={16} /></button>
                                        <button className="btn-secondary" style={{ padding: '8px', flex: 1, color: '#ef4444' }} onClick={() => handleDelete(tpl.name)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}

                        <div className="glass-card"
                            style={{ border: '2px dashed #1e293b', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '15px', color: '#64748b', cursor: 'pointer' }}
                            onClick={() => setShowModal(true)}
                        >
                            <Plus size={32} />
                            <span>Create New Template</span>
                        </div>
                    </div>
                )}
            </div>

            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div className="glass-card" style={{ width: '95%', maxWidth: '1000px', height: '90vh', padding: 0, display: 'flex', overflow: 'hidden' }}>

                        {/* LEFT: FORM SECTION */}
                        <div style={{ flex: 1, padding: '30px', overflowY: 'auto', borderRight: '1px solid #334155' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                <h3>Create Template</h3>
                                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><X size={24} /></button>
                            </div>

                            <form onSubmit={handleCreate}>
                                <div className="input-group">
                                    <label>Template Name</label>
                                    <input type="text" placeholder="e.g. welcome_offer" value={newTemplate.name} onChange={e => setNewTemplate({ ...newTemplate, name: e.target.value.toLowerCase().replace(/\s+/g, '_') })} required pattern="[a-z0-9_]+" style={{ color: 'white' }} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div className="input-group">
                                        <label>Category</label>
                                        <select value={newTemplate.category} onChange={e => setNewTemplate({ ...newTemplate, category: e.target.value })} className="input-field">
                                            <option value="MARKETING">Marketing</option>
                                            <option value="UTILITY">Utility</option>
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label>Language</label>
                                        <select value={newTemplate.language} onChange={e => setNewTemplate({ ...newTemplate, language: e.target.value })} className="input-field">
                                            <option value="en_US">English (US)</option>
                                            <option value="hi">Hindi</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="input-group" style={{ marginTop: '20px', borderTop: '1px solid #334155', paddingTop: '20px' }}>
                                    <label>Header (Optional)</label>
                                    <select value={newTemplate.headerType || 'NONE'} onChange={e => setNewTemplate({ ...newTemplate, headerType: e.target.value })} className="input-field">
                                        <option value="NONE">None</option>
                                        <option value="TEXT">Text Header</option>
                                        <option value="IMAGE">Image Header</option>
                                        <option value="VIDEO">Video Header</option>
                                        <option value="DOCUMENT">Document Header</option>
                                    </select>
                                    {newTemplate.headerType === 'TEXT' && (
                                        <input type="text" placeholder="Header text here..." value={newTemplate.headerText || ''} onChange={e => setNewTemplate({ ...newTemplate, headerText: e.target.value })} style={{ marginTop: '10px', color: 'white' }} maxLength={60} />
                                    )}
                                </div>

                                <div className="input-group">
                                    <label>Body Text</label>
                                    <textarea
                                        placeholder="Hi {{1}}, thanks for contacting us..."
                                        value={newTemplate.body}
                                        onChange={e => setNewTemplate({ ...newTemplate, body: e.target.value })}
                                        required
                                        style={{ height: '120px', width: '100%', padding: '15px', background: 'rgba(255,255,255,0.05)', border: '1px solid #334155', borderRadius: '10px', color: 'white' }}
                                    />
                                    <small style={{ color: '#64748b' }}>Use {"{{1}}"}, {"{{2}}"} for dynamic variables.</small>
                                </div>

                                <div className="input-group">
                                    <label>Footer (Optional)</label>
                                    <input type="text" placeholder="e.g. Reply STOP to unsubscribe" value={newTemplate.footer || ''} onChange={e => setNewTemplate({ ...newTemplate, footer: e.target.value })} style={{ color: 'white' }} maxLength={60} />
                                </div>

                                <div className="input-group" style={{ marginTop: '20px', borderTop: '1px solid #334155', paddingTop: '20px' }}>
                                    <label>Buttons (Max 3)</label>
                                    <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                                        <button type="button" onClick={() => addButton('QUICK_REPLY')} className="btn-secondary" style={{ fontSize: '0.75rem', padding: '6px 12px' }}>+ Quick Reply</button>
                                        <button type="button" onClick={() => addButton('URL')} className="btn-secondary" style={{ fontSize: '0.75rem', padding: '6px 12px' }}>+ Link</button>
                                        <button type="button" onClick={() => addButton('PHONE_NUMBER')} className="btn-secondary" style={{ fontSize: '0.75rem', padding: '6px 12px' }}>+ Phone</button>
                                    </div>

                                    {newTemplate.buttons?.map((btn, idx) => (
                                        <div key={idx} style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px', marginBottom: '10px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            <div style={{ minWidth: '80px', fontSize: '0.7rem', fontWeight: 'bold', color: '#94a3b8' }}>{btn.type.replace('_', ' ')}</div>
                                            <input type="text" placeholder="Button Text" value={btn.text} onChange={e => updateButton(idx, 'text', e.target.value)} style={{ flex: 1, color: 'white', background: 'none', border: '1px solid #334155', padding: '5px', borderRadius: '4px' }} />
                                            {btn.type !== 'QUICK_REPLY' && (
                                                <input type="text" placeholder={btn.type === 'URL' ? 'https://...' : '+91...'} value={btn.value} onChange={e => updateButton(idx, 'value', e.target.value)} style={{ flex: 1, color: 'white', background: 'none', border: '1px solid #334155', padding: '5px', borderRadius: '4px' }} />
                                            )}
                                            <X size={16} cursor="pointer" onClick={() => removeButton(idx)} color="#ef4444" />
                                        </div>
                                    ))}
                                </div>

                                <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
                                    <button type="button" onClick={() => setShowModal(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                                    <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={submitting}>
                                        {submitting ? 'Creating...' : 'Submit for Approval'}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* RIGHT: LIVE PREVIEW - WHATSAPP THEME */}
                        <div style={{ width: '400px', background: '#0f172a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            {/* Phone Frame */}
                            <div style={{
                                width: '320px',
                                height: '650px',
                                background: '#fff',
                                borderRadius: '30px',
                                border: '8px solid #1e293b',
                                overflow: 'hidden',
                                position: 'relative',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                            }}>
                                {/* Phone Status Bar */}
                                <div style={{ height: '30px', background: '#075e54', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 15px', color: 'white', fontSize: '10px' }}>
                                    <span>9:41</span>
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        <div style={{ width: '12px', height: '12px', background: 'white', borderRadius: '50%' }}></div>
                                        <div style={{ width: '12px', height: '12px', background: 'white', borderRadius: '50%' }}></div>
                                    </div>
                                </div>

                                {/* WhatsApp Header */}
                                <div style={{ height: '50px', background: '#075e54', display: 'flex', alignItems: 'center', padding: '0 10px', color: 'white' }}>
                                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#ccc', marginRight: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: '12px' }}>Logo</div>
                                    <div>
                                        <div style={{ fontSize: '14px', fontWeight: '500' }}>My Business <CheckCircle size={10} fill="white" color="#075e54" style={{ display: 'inline', marginLeft: '2px' }} /></div>
                                        <div style={{ fontSize: '10px', opacity: 0.8 }}>Business Account</div>
                                    </div>
                                </div>

                                {/* Chat Area - Background Doodle */}
                                <div style={{
                                    flex: 1,
                                    height: 'calc(100% - 80px)',
                                    background: '#e5ddd5 url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")',
                                    padding: '20px 10px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    overflowY: 'auto'
                                }}>

                                    {/* Date Separator */}
                                    <div style={{ alignSelf: 'center', background: '#d1d7db', padding: '5px 10px', borderRadius: '10px', fontSize: '10px', color: '#555', marginBottom: '15px', boxShadow: '0 1px 1px rgba(0,0,0,0.1)' }}>
                                        TODAY
                                    </div>

                                    {/* Message Bubble */}
                                    <div style={{
                                        background: '#fff',
                                        borderRadius: '7px 0px 7px 7px', // Tail on top right for sender? No, business sends, user receives. 
                                        // Wait, usually preview shows what USER sees. If business sends, it's incoming for user.
                                        // Incoming messages are white, left aligned.
                                        // But this is business previewing THEIR message. 
                                        // Actually, most generic previews show it as "Incoming" on the left (White) 
                                        // OR "Outgoing" from business on the right (Light Green). 
                                        // Let's stick to standard Left-Inc (White) layout as it's cleaner for reading content.
                                        borderRadius: '0px 7px 7px 7px',
                                        maxWidth: '90%',
                                        alignSelf: 'flex-start',
                                        boxShadow: '0 1px 1px rgba(0,0,0,0.1)',
                                        position: 'relative'
                                    }}>
                                        {/* Tail Triangle */}
                                        <div style={{ position: 'absolute', top: 0, left: '-8px', width: 0, height: 0, borderTop: '10px solid #fff', borderLeft: '10px solid transparent' }}></div>

                                        <div style={{ padding: '5px' }}>
                                            {/* HEADER */}
                                            {newTemplate.headerType === 'TEXT' && <div style={{ fontWeight: 'bold', marginBottom: '6px', color: '#111827', padding: '5px 5px 0 5px' }}>{newTemplate.headerText || 'Header'}</div>}
                                            {newTemplate.headerType === 'IMAGE' && <div style={{ height: '140px', background: '#f0f2f5', borderRadius: '6px', marginBottom: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}><RefreshCw size={24} /></div>}
                                            {newTemplate.headerType === 'VIDEO' && <div style={{ height: '140px', background: '#f0f2f5', borderRadius: '6px', marginBottom: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>Video Preview</div>}
                                            {newTemplate.headerType === 'DOCUMENT' && <div style={{ height: '50px', background: '#f0f2f5', borderRadius: '6px', marginBottom: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>📄 Document</div>}

                                            {/* BODY */}
                                            <div style={{ fontSize: '14px', color: '#111827', whiteSpace: 'pre-wrap', lineHeight: '1.4', padding: '0 5px' }}>
                                                {newTemplate.body || 'Your message content...'}
                                            </div>

                                            {/* FOOTER */}
                                            {newTemplate.footer && (
                                                <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '8px', padding: '0 5px' }}>
                                                    {newTemplate.footer}
                                                </div>
                                            )}
                                        </div>

                                        {/* Meta-data / Time */}
                                        <div style={{ textAlign: 'right', fontSize: '10px', color: '#9ca3af', padding: '0 5px 5px 0', marginRight: '5px' }}>
                                            12:00 PM
                                        </div>
                                    </div>

                                    {/* BUTTONS - Attached below bubble */}
                                    {newTemplate.buttons?.map((btn, i) => (
                                        <div key={i} style={{
                                            background: 'white',
                                            marginTop: '5px',
                                            padding: '10px',
                                            borderRadius: '5px',
                                            textAlign: 'center',
                                            color: '#00a5f4',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            boxShadow: '0 1px 1px rgba(0,0,0,0.1)',
                                            cursor: 'pointer',
                                            maxWidth: '90%',
                                            alignSelf: 'flex-start',
                                            width: '100%'
                                        }}>
                                            {btn.type === 'PHONE_NUMBER' && '📞 '}
                                            {btn.type === 'URL' && '🔗 '}
                                            {btn.type === 'QUICK_REPLY' && '↩️ '}
                                            {btn.text || 'Button'}
                                        </div>
                                    ))}

                                </div>
                            </div>
                            <div style={{ marginTop: '20px', background: 'rgba(255,255,255,0.1)', padding: '5px 15px', borderRadius: '20px', color: '#94a3b8', fontSize: '12px' }}>Live WhatsApp Preview</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Templates;
