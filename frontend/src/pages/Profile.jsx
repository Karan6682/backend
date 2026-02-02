import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { User, Building, MapPin, Globe, CreditCard, Upload, Save, AlertCircle, MessageSquare, ShieldCheck, Mail, Info } from 'lucide-react';

const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        company: '',
        address: '',
        website: '',
        gst: ''
    });
    const [waProfile, setWaProfile] = useState({
        about: '',
        address: '',
        description: '',
        email: '',
        websites: [''],
        vertical: 'OTHER'
    });
    const [twoStepPin, setTwoStepPin] = useState('');
    const [logoFile, setLogoFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [waLoading, setWaLoading] = useState(false);

    const token = localStorage.getItem('token');

    const verticals = [
        "OTHER", "AUTO", "BEAUTY", "APPAREL", "EDU", "ENTERTAIN", "EVENT_PLAN",
        "FINANCE", "GROCERY", "GOVT", "HOTEL", "HEALTH", "NON_PROFIT",
        "PROF_SERVICES", "RETAIL", "TRAVEL", "RESTAURANT"
    ];

    useEffect(() => {
        fetchProfile();
        fetchWhatsAppProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/profile', {
                headers: { 'x-auth-token': token }
            });
            setUser(res.data);
            setFormData({
                company: res.data.company || '',
                address: res.data.businessProfile?.address || '',
                website: res.data.businessProfile?.website || '',
                gst: res.data.businessProfile?.gst || ''
            });
            if (res.data.businessProfile?.logo) {
                setPreview(res.data.businessProfile.logo);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchWhatsAppProfile = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/whatsapp/profile', {
                headers: { 'x-auth-token': token }
            });
            if (res.data.success && res.data.data.data) {
                const profile = res.data.data.data[0];
                setWaProfile({
                    about: profile.about || '',
                    address: profile.address || '',
                    description: profile.description || '',
                    email: profile.email || '',
                    websites: profile.websites || [''],
                    vertical: profile.vertical || 'OTHER'
                });
            }
        } catch (err) {
            console.log("WhatsApp Profile probably not set yet or permission missing", err);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('http://localhost:5000/api/profile/update', formData, {
                headers: { 'x-auth-token': token }
            });

            if (logoFile) {
                const form = new FormData();
                form.append('logo', logoFile);
                await axios.post('http://localhost:5000/api/profile/upload-logo', form, {
                    headers: {
                        'x-auth-token': token,
                        'Content-Type': 'multipart/form-data'
                    }
                });
            }

            alert('Profile updated successfully!');
            fetchProfile();
        } catch (err) {
            alert('Update failed: ' + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleWaSubmit = async (e) => {
        e.preventDefault();
        setWaLoading(true);
        try {
            await axios.post('http://localhost:5000/api/whatsapp/profile-update', waProfile, {
                headers: { 'x-auth-token': token }
            });
            alert('WhatsApp Business Profile updated successfully!');
        } catch (err) {
            alert('Update failed: ' + (err.response?.data?.error || err.message));
        } finally {
            setWaLoading(false);
        }
    };

    const handleSetPin = async () => {
        if (!twoStepPin || twoStepPin.length !== 6) {
            return alert("PIN must be exactly 6 digits.");
        }
        try {
            await axios.post('http://localhost:5000/api/whatsapp/two-step-verification', { pin: twoStepPin }, {
                headers: { 'x-auth-token': token }
            });
            alert("2FA PIN updated successfully!");
            setTwoStepPin('');
        } catch (err) {
            alert("Failed to set PIN: " + (err.response?.data?.error || err.message));
        }
    };

    return (
        <div className="dashboard-container">
            <Sidebar />

            <div className="main-content">
                <div style={{ maxWidth: '900px', paddingBottom: '50px' }}>
                    <h2 style={{ marginBottom: '10px' }}>Settings & Profile</h2>
                    <p style={{ color: '#94a3b8', marginBottom: '30px' }}>Manage your account, business identity, and WhatsApp configuration.</p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>

                        {/* CRM Business Profile */}
                        <form onSubmit={handleSubmit}>
                            <div className="glass-card">
                                <h3 style={{ marginBottom: '20px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Building size={20} color="#3b82f6" /> CRM Business Identity
                                </h3>

                                <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', marginBottom: '30px' }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{
                                            width: '100px', height: '100px', borderRadius: '50%',
                                            border: '2px dashed #334155', display: 'flex', alignItems: 'center',
                                            justifyContent: 'center', overflow: 'hidden', marginBottom: '10px',
                                            background: '#0f172a'
                                        }}>
                                            {preview ? (
                                                <img src={preview} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <Upload size={24} color="#64748b" />
                                            )}
                                        </div>
                                        <label htmlFor="logo-upload" className="btn-secondary" style={{ fontSize: '0.75rem', cursor: 'pointer', padding: '4px 8px' }}>
                                            Change Logo
                                        </label>
                                        <input id="logo-upload" type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                                    </div>

                                    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                        <div className="input-group">
                                            <label>Business Name</label>
                                            <div className="input-with-icon">
                                                <Building size={16} color="#94a3b8" />
                                                <input type="text" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="input-group">
                                            <label>Account Email</label>
                                            <div className="input-with-icon">
                                                <User size={16} color="#94a3b8" />
                                                <input type="text" value={user?.email || ''} disabled style={{ opacity: 0.6 }} />
                                            </div>
                                        </div>
                                        <div className="input-group" style={{ gridColumn: 'span 2' }}>
                                            <label>Office Address</label>
                                            <div className="input-with-icon">
                                                <MapPin size={16} color="#94a3b8" />
                                                <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="input-group">
                                            <label>Website</label>
                                            <div className="input-with-icon">
                                                <Globe size={16} color="#94a3b8" />
                                                <input type="text" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="input-group">
                                            <label>GSTIN / Tax ID</label>
                                            <div className="input-with-icon">
                                                <CreditCard size={16} color="#94a3b8" />
                                                <input type="text" value={formData.gst} onChange={(e) => setFormData({ ...formData, gst: e.target.value })} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
                                    <Save size={18} /> {loading ? 'Saving...' : 'Save CRM Identity'}
                                </button>
                            </div>
                        </form>

                        {/* WhatsApp Business Profile (Meta Sync) */}
                        {user?.metaCredentials?.isVerified && (
                            <form onSubmit={handleWaSubmit}>
                                <div className="glass-card" style={{ borderColor: '#25d36633' }}>
                                    <h3 style={{ marginBottom: '20px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px', color: '#25d366' }}>
                                        <MessageSquare size={20} /> WhatsApp Business Profile
                                    </h3>
                                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '20px' }}>
                                        These details are visible to your customers on WhatsApp. Updating here syncs them with Meta.
                                    </p>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div className="input-group" style={{ gridColumn: 'span 2' }}>
                                            <label>Business Description</label>
                                            <textarea
                                                style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: 'white', padding: '10px', height: '80px', resize: 'vertical' }}
                                                value={waProfile.description}
                                                onChange={(e) => setWaProfile({ ...waProfile, description: e.target.value })}
                                                placeholder="Tell your customers about your business..."
                                            />
                                        </div>

                                        <div className="input-group">
                                            <label>About Text (Status)</label>
                                            <div className="input-with-icon">
                                                <Info size={16} color="#94a3b8" />
                                                <input type="text" value={waProfile.about} onChange={(e) => setWaProfile({ ...waProfile, about: e.target.value })} placeholder="e.g. Always here to help" />
                                            </div>
                                        </div>

                                        <div className="input-group">
                                            <label>Business Category</label>
                                            <select
                                                style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: 'white' }}
                                                value={waProfile.vertical}
                                                onChange={(e) => setWaProfile({ ...waProfile, vertical: e.target.value })}
                                            >
                                                {verticals.map(v => <option key={v} value={v}>{v}</option>)}
                                            </select>
                                        </div>

                                        <div className="input-group">
                                            <label>Display Email</label>
                                            <div className="input-with-icon">
                                                <Mail size={16} color="#94a3b8" />
                                                <input type="email" value={waProfile.email} onChange={(e) => setWaProfile({ ...waProfile, email: e.target.value })} />
                                            </div>
                                        </div>

                                        <div className="input-group">
                                            <label>Business Address</label>
                                            <div className="input-with-icon">
                                                <MapPin size={16} color="#94a3b8" />
                                                <input type="text" value={waProfile.address} onChange={(e) => setWaProfile({ ...waProfile, address: e.target.value })} />
                                            </div>
                                        </div>
                                    </div>

                                    <button type="submit" className="btn-primary" style={{ marginTop: '25px', width: '100%', background: '#25d366', color: 'black' }} disabled={waLoading}>
                                        <Save size={18} /> {waLoading ? 'Syncing with Meta...' : 'Sync with WhatsApp'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Security & API */}
                        <div className="glass-card">
                            <h3 style={{ marginBottom: '20px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <ShieldCheck size={20} color="#f59e0b" /> Security & Advanced Settings
                            </h3>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                                {/* Two-Step Verification */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Two-Step Verification PIN</label>
                                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '10px' }}>Set a 6-digit PIN to protect your phone number.</p>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <input
                                            type="text"
                                            maxLength="6"
                                            value={twoStepPin}
                                            onChange={(e) => setTwoStepPin(e.target.value.replace(/\D/g, ''))}
                                            placeholder="123456"
                                            style={{ flex: 1, background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: 'white', padding: '10px', textAlign: 'center', letterSpacing: '5px' }}
                                        />
                                        <button onClick={handleSetPin} className="btn-secondary">Set PIN</button>
                                    </div>
                                </div>

                                {/* API Key */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>External API Access</label>
                                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '10px' }}>Used for programmatic integration.</p>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <div style={{ flex: 1, background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.8rem', color: user?.apiKey ? '#10b981' : '#64748b', border: '1px solid #334155', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {user?.apiKey || 'No Key'}
                                        </div>
                                        <button
                                            onClick={async () => {
                                                if (!window.confirm("Generate new API Key? Old one will stop working.")) return;
                                                try {
                                                    await axios.post('http://localhost:5000/api/external/generate-key', {}, { headers: { 'x-auth-token': token } });
                                                    fetchProfile();
                                                    alert("New API Key Generated!");
                                                } catch (err) { alert("Error generating key"); }
                                            }}
                                            className="btn-secondary"
                                            style={{ padding: '8px 12px', fontSize: '0.8rem' }}
                                        >
                                            {user?.apiKey ? 'Refresh' : 'Generate'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
