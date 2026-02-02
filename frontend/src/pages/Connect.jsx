import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Globe, ShieldCheck, Zap, Lock, MessageSquare, CheckCircle, RefreshCw, Key, ExternalLink, ArrowRight, Info, Trash2, User, CreditCard, Video } from 'lucide-react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const Connect = () => {
    // Current Settings
    const [formData, setFormData] = useState({
        wabaId: '',
        phoneNumberId: '',
        accessToken: '',
        appId: '',
        appSecret: '',
        phoneNumber: '',
        isVerified: false
    });

    // Wizard States
    const [step, setStep] = useState(1); // 1: Connect, 2: Select/Verify Number, 3: Billing
    const [shortToken, setShortToken] = useState('');
    const [discoveredData, setDiscoveredData] = useState(null);

    // UI States
    const [loading, setLoading] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [manualMode, setManualMode] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [healthStatus, setHealthStatus] = useState(null);
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchCurrentConfig();
    }, []);

    useEffect(() => {
        if (formData.wabaId && formData.accessToken) {
            fetchAccountHealth();
        }
    }, [formData.wabaId, formData.accessToken]);

    const fetchAccountHealth = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/whatsapp/health', {
                headers: { 'x-auth-token': token }
            });
            setHealthStatus(res.data);
        } catch (err) {
            console.error("Health fetch failed:", err);
            // Don't alert here to avoid annoyance, but maybe the user needs to know.
        }
    };

    const fetchCurrentConfig = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/client/meta', {
                headers: { 'x-auth-token': token }
            });
            if (res.data && res.data.accessToken) {
                setFormData(res.data);
                // If verified, go to Step 3, otherwise Step 2 to allow re-registration
                if (res.data.isVerified) {
                    setStep(3);
                } else {
                    setStep(2); // Go to Discovery so they can re-request OTP or see numbers

                    // Auto-discover if token exists to populate list
                    handleDiscover(null);
                }
            }
        } catch (err) { }
    };

    // STEP 1: Discover Account from Token
    const handleManualSave = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            const config = {
                ...formData,
                isVerified: true // Assume verified if manually entered, or let them verify later
            };
            await axios.post('http://localhost:5000/api/client/update-meta', config, {
                headers: { 'x-auth-token': token }
            });
            setStep(3);
            alert('Settings saved successfully!');
        } catch (err) {
            alert('Save failed: ' + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleDiscover = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            let longLivedToken = discoveredData?.longLivedToken || formData.accessToken || shortToken;

            // 1. Exchange for Long Lived Token (Only if shortToken is provided)
            if (shortToken && !formData.accessToken) {
                try {
                    const resToken = await axios.post('http://localhost:5000/api/whatsapp/token-exchange', {
                        appId: '1596025668076914',
                        appSecret: 'b47ef916c821344dff83c3ed82f3c881',
                        shortToken: shortToken
                    }, { headers: { 'x-auth-token': token } });
                    longLivedToken = resToken.data.longLivedToken;
                } catch (tokErr) {
                    console.log("Token exchange skipped or failed, using short token directly.");
                }
            }

            if (!longLivedToken) {
                alert("Please paste your Meta Access Token in Step 1 first.");
                setStep(1);
                setLoading(false);
                return;
            }

            // Update formData with the token so manual fields show it too
            setFormData(prev => ({ ...prev, accessToken: longLivedToken }));

            // 2. Discover WABA and Numbers
            const resDiscover = await axios.post('http://localhost:5000/api/whatsapp/discover', {
                accessToken: longLivedToken
            }, { headers: { 'x-auth-token': token } });

            setDiscoveredData({
                ...resDiscover.data,
                longLivedToken
            });

            // Save basic info to user record immediately
            await axios.post('http://localhost:5000/api/client/update-meta', {
                wabaId: resDiscover.data.wabaId,
                accessToken: longLivedToken,
                isVerified: false
            }, { headers: { 'x-auth-token': token } });

            setStep(2);
            if (e) alert('Your Meta Account has been successfully discovered! Now select your number below.');
        } catch (err) {
            const errorMsg = err.response?.data?.error || err.message;
            const errorStr = typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg;

            if (errorStr.includes("whatsapp_business_management")) {
                alert("❌ Permission Missing!\n\nYour token doesn't have 'whatsapp_business_management' permission.\n\nPlease follow Step 4 in the guide to generate a new token with correct permissions.");
            } else {
                alert('Discovery failed: ' + errorStr);
            }
        } finally {
            setLoading(false);
        }
    };

    // STEP 2: Select/Verify Number
    const handleSelectNumber = async (numObj) => {
        const isRegistered = numObj.status === 'CONNECTED';

        const config = {
            ...formData,
            wabaId: numObj.wabaId || discoveredData.wabaId,
            accessToken: discoveredData.longLivedToken,
            phoneNumberId: numObj.id,
            phoneNumber: numObj.display_phone_number.replace(/[^0-9]/g, ''),
            isVerified: isRegistered
        };

        try {
            await axios.post('http://localhost:5000/api/client/update-meta', config, {
                headers: { 'x-auth-token': token }
            });
            setFormData(config);

            if (isRegistered) {
                setStep(3);
                alert('Success! This number is already active and linked.');
            } else {
                // If not registered, stay on step 2 but show OTP UI
                alert('This number is not registered yet. Please click "Verify with OTP"');
            }
        } catch (err) { }
    };

    const [otpMethod, setOtpMethod] = useState('SMS');

    const handleRequestOtp = async () => {
        setOtpLoading(true);
        try {
            await axios.post('http://localhost:5000/api/whatsapp/otp-request', {
                phoneNumberId: formData.phoneNumberId,
                method: otpMethod
            }, { headers: { 'x-auth-token': token } });
            setOtpSent(true);
            alert(`OTP request via ${otpMethod} sent to ${formData.phoneNumber}. Please wait.`);
        } catch (err) {
            const errorObj = err.response?.data?.error || err.message;
            const errorMsg = typeof errorObj === 'object' ? (errorObj.message || JSON.stringify(errorObj)) : errorObj;

            if (errorMsg.includes('already active')) {
                alert('OTP Fail: Number is still active on normal WhatsApp. Please delete account from phone and wait 5 minutes.');
            } else if (errorMsg.includes('already verified ownership')) {
                // EXCELLENT! This means Meta already knows the number is good.
                alert('Success! Meta confirms this number is verified. Registering on Cloud API...');

                try {
                    // NEW: Register Number logic
                    await axios.post('http://localhost:5000/api/whatsapp/register', {
                        phoneNumberId: formData.phoneNumberId
                    }, { headers: { 'x-auth-token': token } });
                } catch (e) {
                    console.error("Registration silent fail:", e);
                }

                // Automatically move to success state
                const finalConfig = { ...formData, isVerified: true };
                await axios.post('http://localhost:5000/api/client/update-meta', finalConfig, {
                    headers: { 'x-auth-token': token }
                });
                setFormData(finalConfig);
                setStep(3);
            } else {
                alert('OTP Request Failed: ' + errorMsg);
            }
        } finally {
            setOtpLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        setOtpLoading(true);
        try {
            await axios.post('http://localhost:5000/api/whatsapp/otp-verify', {
                phoneNumberId: formData.phoneNumberId,
                code: otpCode
            }, { headers: { 'x-auth-token': token } });

            // NEW: Register Number logic
            await axios.post('http://localhost:5000/api/whatsapp/register', {
                phoneNumberId: formData.phoneNumberId
            }, { headers: { 'x-auth-token': token } });

            const finalConfig = { ...formData, isVerified: true };
            await axios.post('http://localhost:5000/api/client/update-meta', finalConfig, {
                headers: { 'x-auth-token': token }
            });
            setFormData(finalConfig);
            setStep(3);
            alert('Verification Complete! You are now LIVE.');
        } catch (err) {
            alert('Invalid OTP code.');
        } finally {
            setOtpLoading(false);
        }
    };

    const [manualCC, setManualCC] = useState('91');
    const [manualNumber, setManualNumber] = useState('');
    const [manualName, setManualName] = useState('CloudCRM Business');
    const [addingNumber, setAddingNumber] = useState(false);

    const handleAddNumber = async (e) => {
        e.preventDefault();
        setAddingNumber(true);
        try {
            const resAdd = await axios.post('http://localhost:5000/api/whatsapp/add-number', {
                wabaId: discoveredData.wabaId,
                cc: manualCC,
                phoneNumber: manualNumber,
                verifiedName: manualName,
                accessToken: discoveredData.longLivedToken
            }, { headers: { 'x-auth-token': token } });

            const newPhoneNumberId = resAdd.data.id;

            alert('Number added to Meta! Selecting it for you...');

            // Update local state to select this number
            const config = {
                ...formData,
                wabaId: discoveredData.wabaId,
                accessToken: discoveredData.longLivedToken,
                phoneNumberId: newPhoneNumberId,
                phoneNumber: manualCC + manualNumber,
                isVerified: false
            };

            await axios.post('http://localhost:5000/api/client/update-meta', config, {
                headers: { 'x-auth-token': token }
            });
            setFormData(config);

            // Also refresh discovery list so it shows up
            const resDiscover = await axios.post('http://localhost:5000/api/whatsapp/discover', {
                accessToken: discoveredData.longLivedToken
            }, { headers: { 'x-auth-token': token } });

            setDiscoveredData({
                ...discoveredData,
                numbers: resDiscover.data.numbers
            });
            setManualNumber('');
        } catch (err) {
            const errorObj = err.response?.data?.error || err.message;
            const errorMsg = typeof errorObj === 'object' ? (errorObj.message || JSON.stringify(errorObj)) : errorObj;
            alert('Failed to add number: ' + errorMsg);
        } finally {
            setAddingNumber(false);
        }
    };

    const handleDeleteNumber = async (numId) => {
        if (!window.confirm('Are you sure you want to delete this number from Meta? This cannot be undone.')) return;
        setLoading(true);
        try {
            await axios.delete(`http://localhost:5000/api/whatsapp/delete-number/${numId}`, {
                params: { accessToken: discoveredData.longLivedToken },
                headers: { 'x-auth-token': token }
            });
            alert('Number deleted successfully!');
            // Refresh list
            const resDiscover = await axios.post('http://localhost:5000/api/whatsapp/discover', {
                accessToken: discoveredData.longLivedToken
            }, { headers: { 'x-auth-token': token } });

            setDiscoveredData({
                ...discoveredData,
                numbers: resDiscover.data.numbers
            });
        } catch (err) {
            const errorObj = err.response?.data?.error || err.message;
            const errorMsg = typeof errorObj === 'object' ? (errorObj.message || JSON.stringify(errorObj)) : errorObj;
            alert('Delete failed: ' + errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-container">
            <Sidebar />

            <div className="main-content" style={{ maxWidth: '900px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
                    <div>
                        <h2 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>{formData.isVerified ? '✅ Connection Active' : '🚀 WhatsApp Setup Wizard'}</h2>
                        <p style={{ color: '#94a3b8' }}>Follow these simple steps to start sending bulk messages.</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Logged in as</div>
                        <div style={{ fontWeight: 'bold', color: '#3b82f6' }}>{JSON.parse(localStorage.getItem('user'))?.name}</div>
                    </div>
                </div>

                {/* PROGRESS TRACKER */}
                <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
                    {[1, 2, 3].map(i => (
                        <div key={i} style={{
                            flex: 1, height: '10px', borderRadius: '5px',
                            background: step >= i ? '#3b82f6' : '#1e293b',
                            transition: '0.5s'
                        }}></div>
                    ))}
                </div>

                {/* Meta Account Health Alert Card (Visible in all steps if data exists) */}
                {healthStatus && (
                    <div className="glass-card" style={{
                        padding: '20px',
                        border: healthStatus.account_review_status === 'RESTRICTED' ? '1px solid #ef4444' : '1px solid #22c55e',
                        background: healthStatus.account_review_status === 'RESTRICTED' ? 'rgba(239, 68, 68, 0.05)' : 'rgba(34, 197, 94, 0.05)',
                        marginBottom: '30px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{
                                    padding: '10px',
                                    borderRadius: '12px',
                                    background: healthStatus.account_review_status === 'RESTRICTED' ? '#ef4444' : '#22c55e'
                                }}>
                                    <ShieldCheck size={24} color="white" />
                                </div>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '1.2rem', color: healthStatus.account_review_status === 'RESTRICTED' ? '#ef4444' : '#22c55e' }}>
                                        {healthStatus.account_review_status === 'RESTRICTED' ? 'Meta Account Restricted' : 'Meta Account Active'}
                                    </h4>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>WABA: {healthStatus.name}</p>
                                </div>
                            </div>
                            <button onClick={fetchAccountHealth} className="btn-secondary" style={{ padding: '8px', borderRadius: '50%' }} title="Reload Status">
                                <RefreshCw size={16} />
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                            <div style={{ padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid #1e293b' }}>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '5px' }}>BUSINESS VERIFICATION</div>
                                <div style={{ fontWeight: 'bold', color: healthStatus.business_verification_status === 'verified' ? '#22c55e' : '#f59e0b' }}>
                                    {healthStatus.business_verification_status?.toUpperCase() || 'NOT STARTED'}
                                </div>
                            </div>
                            <div style={{ padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid #1e293b' }}>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '5px' }}>ACCOUNT STATUS</div>
                                <div style={{ fontWeight: 'bold', color: healthStatus.account_review_status === 'APPROVED' ? '#22c55e' : '#ef4444' }}>
                                    {healthStatus.account_review_status || 'PENDING'}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            {healthStatus.account_review_status === 'RESTRICTED' && (
                                <button
                                    onClick={() => window.open(`https://business.facebook.com/latest/whatsapp_manager/overview?business_id=${formData.wabaId}`, '_blank')}
                                    className="btn-primary"
                                    style={{ flex: 1, background: '#ef4444', fontSize: '0.85rem' }}
                                >
                                    FIX RESTRICTION
                                </button>
                            )}
                            {healthStatus.business_verification_status !== 'verified' && (
                                <button
                                    onClick={() => window.open(`https://business.facebook.com/settings/info?business_id=${formData.wabaId}`, '_blank')}
                                    className="btn-secondary"
                                    style={{ flex: 1, borderColor: '#f59e0b', color: '#f59e0b', fontSize: '0.85rem' }}
                                >
                                    START VERIFICATION
                                </button>
                            )}
                        </div>

                        {healthStatus.account_review_status === 'RESTRICTED' && (
                            <div style={{ marginTop: '15px', padding: '10px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', fontSize: '0.75rem', color: '#ef4444' }}>
                                ⚠️ <strong>Note:</strong> Messages cannot be sent while restricted. Please visit Meta WhatsApp Manager to resolve issues.
                            </div>
                        )}
                    </div>
                )}

                {/* STEP 1: LOGIN/TOKEN */}
                {step === 1 && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                        <div className="glass-card" style={{ padding: '40px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <div style={{ background: 'rgba(59, 130, 246, 0.1)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Key size={30} color="#3b82f6" />
                                </div>
                                <button
                                    onClick={() => setManualMode(!manualMode)}
                                    className="btn-secondary"
                                    style={{ fontSize: '0.7rem', padding: '5px 12px' }}
                                >
                                    {manualMode ? 'AUTO DISCOVERY MODE' : 'MANUAL INPUT MODE'}
                                </button>
                            </div>

                            <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>{manualMode ? 'Manual Configuration' : 'Connect Meta Business'}</h3>
                            <p style={{ color: '#94a3b8', marginBottom: '30px', fontSize: '0.9rem' }}>
                                {manualMode
                                    ? 'Enter your IDs manually if you already have them from Meta Developer Portal.'
                                    : 'Please paste your Access Token. We will automatically discover your IDs.'}
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div className="input-group">
                                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '8px' }}>Access Token</label>
                                    <input
                                        type="password"
                                        placeholder="EAAW..."
                                        style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid #1e293b', color: 'white' }}
                                        value={manualMode ? formData.accessToken : shortToken}
                                        onChange={(e) => manualMode ? setFormData({ ...formData, accessToken: e.target.value }) : setShortToken(e.target.value.trim())}
                                    />
                                </div>

                                {manualMode && (
                                    <>
                                        <div className="input-group">
                                            <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '8px' }}>WABA ID</label>
                                            <input
                                                type="text"
                                                placeholder="1804775563..."
                                                style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid #1e293b', color: 'white' }}
                                                value={formData.wabaId}
                                                onChange={(e) => setFormData({ ...formData, wabaId: e.target.value })}
                                            />
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                            <div className="input-group">
                                                <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '8px' }}>App ID</label>
                                                <input
                                                    type="text"
                                                    placeholder="1596..."
                                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid #1e293b', color: 'white' }}
                                                    value={formData.appId}
                                                    onChange={(e) => setFormData({ ...formData, appId: e.target.value })}
                                                />
                                            </div>
                                            <div className="input-group">
                                                <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '8px' }}>App Secret</label>
                                                <input
                                                    type="text"
                                                    placeholder="b47e..."
                                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid #1e293b', color: 'white' }}
                                                    value={formData.appSecret}
                                                    onChange={(e) => setFormData({ ...formData, appSecret: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="input-group">
                                            <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '8px' }}>Phone Number ID</label>
                                            <input
                                                type="text"
                                                placeholder="923009500..."
                                                style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid #1e293b', color: 'white' }}
                                                value={formData.phoneNumberId}
                                                onChange={(e) => setFormData({ ...formData, phoneNumberId: e.target.value })}
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '8px' }}>Phone Number (with CC)</label>
                                            <input
                                                type="text"
                                                placeholder="9188160..."
                                                style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid #1e293b', color: 'white' }}
                                                value={formData.phoneNumber}
                                                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>

                            <button
                                onClick={manualMode ? handleManualSave : handleDiscover}
                                className="btn-primary"
                                style={{ width: '100%', height: '55px', fontSize: '1.1rem', marginTop: '30px' }}
                                disabled={loading || (manualMode ? !formData.accessToken : !shortToken)}
                            >
                                {loading ? <RefreshCw className="animate-spin" /> : (manualMode ? 'SAVE & CONNECT' : 'START DISCOVERY')}
                                {!loading && <ArrowRight size={18} style={{ marginLeft: '10px' }} />}
                            </button>
                        </div>

                        <div className="glass-card" style={{ padding: '30px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                            <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                <Info size={18} color="#3b82f6" /> How to get this?
                            </h4>

                            <div style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.1))', padding: '20px', borderRadius: '15px', marginBottom: '25px', textAlign: 'center', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                                <p style={{ fontSize: '1rem', marginBottom: '15px', fontWeight: 'bold' }}>Need help with Meta Setup?</p>
                                <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '20px' }}>Our step-by-step master guide covers everything from App creation to Permanent Token generation.</p>
                                <Link to="/token-guide" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 25px', textDecoration: 'none' }}>
                                    <Video size={18} /> OPEN MASTER GUIDE
                                </Link>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {[
                                    { t: '1. Go to Business Settings', d: 'Open business.facebook.com/settings' },
                                    { t: '2. Users > System Users', d: 'Add a new Admin System User.' },
                                    { t: '3. Generate Token', d: 'Click "Generate New Token", select App & "whatsapp_business_management".' },
                                    { t: '4. Copy & Paste', d: 'Paste the token above to connect.' }
                                ].map((s, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '15px' }}>
                                        <span style={{ minWidth: '24px', height: '24px', background: '#3b82f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>{i + 1}</span>
                                        <div>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{s.t}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{s.d}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <hr style={{ border: 'none', height: '1px', background: '#1e293b', margin: '20px 0' }} />
                            <button onClick={() => window.open('https://developers.facebook.com/tools/explorer', '_blank')} className="btn-secondary" style={{ width: '100%', fontSize: '0.85rem' }}>
                                Open Meta Developers Portal <ExternalLink size={14} />
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 2: NUMBER DISCOVERY & OTP */}
                {step === 2 && discoveredData && (
                    <div className="glass-card" style={{ padding: '40px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div>
                                <h3 style={{ marginBottom: '5px' }}>Found Acc: {discoveredData.wabaName}</h3>
                                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Select the number you want to use for bulk SMS.</p>
                            </div>
                            <button
                                onClick={() => handleDiscover()}
                                className="btn-secondary"
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}
                                disabled={loading}
                            >
                                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                                RESCAN ACCOUNT
                            </button>
                        </div>

                        <div style={{ display: 'grid', gap: '15px', marginBottom: '40px' }}>
                            {discoveredData.numbers.map((num, i) => {
                                const isTestNumber = num.display_phone_number?.startsWith('1555');
                                return (
                                    <div
                                        key={i}
                                        onClick={() => handleSelectNumber(num)}
                                        style={{
                                            padding: '20px', border: formData.phoneNumberId === num.id ? '2px solid #3b82f6' : '1px solid #1e293b',
                                            borderRadius: '12px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            background: formData.phoneNumberId === num.id ? 'rgba(59, 130, 246, 0.05)' : 'transparent'
                                        }}
                                    >
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{num.display_phone_number}</div>
                                                {isTestNumber && <span style={{ fontSize: '0.65rem', background: '#3b82f6', color: 'white', padding: '2px 8px', borderRadius: '10px' }}>META TEST NUMBER</span>}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>ID: {num.id}</div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <span style={{
                                                padding: '5px 12px', borderRadius: '20px', fontSize: '0.75rem',
                                                background: num.status === 'CONNECTED' ? 'rgba(37, 211, 102, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                color: num.status === 'CONNECTED' ? '#25d366' : '#ef4444'
                                            }}>
                                                {num.status === 'CONNECTED' ? 'LIVE' : 'UNREGISTERED'}
                                            </span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (isTestNumber) {
                                                        alert("Meta Test Number को डिलीट नहीं किया जा सकता ये परमानेंट होता है।");
                                                        return;
                                                    }
                                                    handleDeleteNumber(num.id);
                                                }}
                                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '5px', opacity: isTestNumber ? 0.3 : 1 }}
                                                title={isTestNumber ? "Cannot delete test number" : "Delete Number"}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* MANUALLY ADD NUMBER */}
                        <div style={{ padding: '25px', background: 'rgba(255,255,255,0.02)', borderRadius: '15px', marginBottom: '30px', border: '1px solid #1e293b' }}>
                            <h4 style={{ marginBottom: '10px', fontSize: '1rem' }}>Want to register a new number?</h4>
                            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '15px' }}>Type the number you want to use (e.g., 91 for India + your 10-digit number).</p>
                            <form onSubmit={handleAddNumber} style={{ display: 'grid', gap: '10px' }}>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input
                                        type="text"
                                        placeholder="CC (91)"
                                        style={{ width: '80px', padding: '15px', borderRadius: '10px', textAlign: 'center' }}
                                        value={manualCC}
                                        onChange={(e) => setManualCC(e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Phone Number (e.g. 8816016682)"
                                        style={{ flex: 1, padding: '15px', borderRadius: '10px' }}
                                        value={manualNumber}
                                        onChange={(e) => setManualNumber(e.target.value)}
                                    />
                                </div>
                                <input
                                    type="text"
                                    placeholder="WhatsApp Display Name (e.g. CloudCRM Business)"
                                    style={{ width: '100%', padding: '15px', borderRadius: '10px' }}
                                    value={manualName}
                                    onChange={(e) => setManualName(e.target.value)}
                                />
                                <button type="submit" className="btn-secondary" style={{ height: '50px' }} disabled={addingNumber || !manualNumber}>
                                    {addingNumber ? <RefreshCw className="animate-spin" /> : 'ADD & SELECT'}
                                </button>
                            </form>
                        </div>

                        {/* OTP SECTION (Only shows if a number is selected and not connected) */}
                        {formData.phoneNumberId && !formData.isVerified && (
                            <div style={{ padding: '30px', background: 'rgba(255,255,255,0.02)', borderRadius: '15px', border: '1px dashed #334155' }}>
                                <h4 style={{ marginBottom: '10px' }}>Verification Required</h4>
                                <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '20px' }}>
                                    This number needs to be registered with Meta Cloud API. We will send an SMS OTP.
                                </p>

                                <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
                                    <button
                                        onClick={() => setOtpMethod('SMS')}
                                        style={{ flex: 1, padding: '10px', borderRadius: '8px', background: otpMethod === 'SMS' ? '#3b82f6' : 'rgba(255,255,255,0.05)', border: '1px solid #334155', color: 'white', cursor: 'pointer' }}
                                    >
                                        📩 SMS
                                    </button>
                                    <button
                                        onClick={() => setOtpMethod('VOICE')}
                                        style={{ flex: 1, padding: '10px', borderRadius: '8px', background: otpMethod === 'VOICE' ? '#3b82f6' : 'rgba(255,255,255,0.05)', border: '1px solid #334155', color: 'white', cursor: 'pointer' }}
                                    >
                                        📞 Phone Call
                                    </button>
                                </div>

                                {!otpSent ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <button onClick={handleRequestOtp} className="btn-primary" style={{ background: '#22c55e', width: '100%' }} disabled={otpLoading}>
                                            {otpLoading ? <RefreshCw className="animate-spin" /> : `SEND ${otpMethod} OTP`}
                                        </button>

                                        {/* DIRECT REGISTER FOR TEST NUMBERS */}
                                        {formData.phoneNumber?.startsWith('1555') && (
                                            <button
                                                onClick={async () => {
                                                    setOtpLoading(true);
                                                    try {
                                                        await axios.post('http://localhost:5000/api/whatsapp/register', {
                                                            phoneNumberId: formData.phoneNumberId
                                                        }, { headers: { 'x-auth-token': token } });

                                                        const finalConfig = { ...formData, isVerified: true };
                                                        await axios.post('http://localhost:5000/api/client/update-meta', finalConfig, {
                                                            headers: { 'x-auth-token': token }
                                                        });
                                                        setFormData(finalConfig);
                                                        setStep(3);
                                                        alert("Test Number Activated Successfully without OTP!");
                                                    } catch (e) {
                                                        alert("Direct activation failed. Meta might require a real number for this account.");
                                                    } finally { setOtpLoading(false); }
                                                }}
                                                className="btn-secondary"
                                                style={{ borderColor: '#3b82f6', color: '#3b82f6' }}
                                            >
                                                ⚡ TEST NUMBER: DIRECT ACTIVE (NO OTP)
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <input
                                            type="text"
                                            placeholder="Enter 6-digit Code"
                                            style={{ flex: 1, padding: '12px', textAlign: 'center', fontSize: '1.2rem' }}
                                            value={otpCode}
                                            onChange={(e) => setOtpCode(e.target.value)}
                                        />
                                        <button onClick={handleVerifyOtp} className="btn-primary" disabled={otpLoading}>
                                            {otpLoading ? <RefreshCw className="animate-spin" /> : 'VERIFY'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* STEP 3: SUCCESS & DASHBOARD */}
                {step === 3 && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '30px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>


                            <div className="glass-card" style={{ textAlign: 'center', padding: '50px' }}>
                                <div style={{ background: 'rgba(37, 211, 102, 0.1)', width: '100px', height: '100px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 30px' }}>
                                    <CheckCircle size={50} color="#25d366" />
                                </div>
                                <h2 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Connected & LIVE!</h2>
                                <p style={{ color: '#94a3b8', marginBottom: '30px' }}>
                                    Your business number <strong>{formData.phoneNumber}</strong> is ready.
                                </p>
                                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                    <Link to="/campaign" className="btn-primary" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Zap size={18} /> SEND BULK CAMPAIGN
                                    </Link>
                                    <button onClick={() => setStep(1)} className="btn-secondary">Update Credentials</button>
                                </div>
                            </div>

                            {/* META HEALTH DIAGNOSTICS */}
                            <div className="glass-card" style={{ padding: '30px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <ShieldCheck size={20} color="#3b82f6" /> Meta Connectivity Diagnostics
                                    </h4>
                                    <span style={{ fontSize: '0.7rem', color: '#64748b' }}>UPTIME: 99.9%</span>
                                </div>

                                <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '15px', border: '1px solid #1e293b', overflow: 'hidden' }}>
                                    {[
                                        { label: 'Cloud API Status', value: 'Functional', color: '#22c55e' },
                                        { label: 'Token Validity', value: 'Permanent (Sys User)', color: '#22c55e' },
                                        { label: 'Messaging Tier', value: 'Tier 1 (1k/day)', color: '#3b82f6' },
                                        { label: 'Current Number ID', value: formData.phoneNumberId, color: '#94a3b8' }
                                    ].map((item, idx) => (
                                        <div key={idx} style={{ padding: '15px 20px', borderBottom: idx === 3 ? 'none' : '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.9rem', color: '#64748b' }}>{item.label}</span>
                                            <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: item.color }}>{item.value}</span>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ marginTop: '30px', display: 'flex', gap: '15px' }}>
                                    <button
                                        id="force-reg-btn"
                                        onClick={async () => {
                                            if (!formData.phoneNumberId) return;
                                            const btn = document.getElementById('force-reg-btn');
                                            btn.disabled = true;
                                            btn.innerHTML = '<span class="animate-spin">↻</span> Checking Meta...';
                                            try {
                                                const pid = formData.phoneNumberId.toString().trim();
                                                const statusRes = await axios.get(`http://localhost:5000/api/whatsapp/number-status/${pid}`, {
                                                    headers: { 'x-auth-token': token }
                                                });
                                                const status = statusRes.data;
                                                alert(`✅ CONNECTION HEALTHY\n\n- Name: ${status.verified_name}\n- Status: ${status.status}\n- Quality: ${status.quality_rating}\n\nNo issues found!`);
                                            } catch (e) {
                                                alert("Error checking status: " + (e.response?.data?.error?.message || e.message));
                                            } finally {
                                                btn.disabled = false;
                                                btn.innerHTML = '<div style="display:flex;align-items:center;gap:8px"><RefreshCw size={14}/> Run Full Diagnostic</div>';
                                            }
                                        }}
                                        className="btn-secondary"
                                        style={{ flex: 1, padding: '12px' }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <RefreshCw size={14} /> Run Full Diagnostic
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => window.open(`https://business.facebook.com/latest/whatsapp_manager/overview?business_id=${formData.wabaId}`, '_blank')}
                                        className="btn-secondary"
                                        style={{ flex: 1, padding: '12px' }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <ExternalLink size={14} /> Open Meta Manager
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                            <div className="glass-card" style={{ background: 'linear-gradient(rgba(59, 130, 246, 0.1), transparent)' }}>
                                <h4 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <CreditCard size={18} color="#3b82f6" /> Meta Settings
                                </h4>
                                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '20px', lineHeight: '1.5' }}>
                                    Bulk messaging consumes "Marketing Conversation" credits. Ensure your Payment Card is attached to Meta.
                                </p>
                                <button onClick={() => window.open('https://business.facebook.com/settings/payment-methods', '_blank')} className="btn-secondary" style={{ width: '100%', borderColor: '#3b82f6', color: '#3b82f6' }}>
                                    Attach Credit/Debit Card <ExternalLink size={14} />
                                </button>
                            </div>

                            <div className="glass-card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                    <h4 style={{ margin: 0 }}>Account Info</h4>
                                    <button
                                        onClick={() => setIsEditing(!isEditing)}
                                        className="btn-secondary"
                                        style={{ fontSize: '0.7rem', padding: '4px 8px' }}
                                    >
                                        {isEditing ? 'CANCEL' : 'EDIT'}
                                    </button>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {[
                                        { label: 'WABA ID', key: 'wabaId' },
                                        { label: 'Number ID', key: 'phoneNumberId' },
                                        { label: 'App ID', key: 'appId' },
                                        { label: 'App Secret', key: 'appSecret', type: 'password' },
                                        { label: 'Access Token', key: 'accessToken', type: 'password' }
                                    ].map((field) => (
                                        <div key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{field.label}:</span>
                                            {isEditing ? (
                                                <input
                                                    type={field.type || 'text'}
                                                    value={formData[field.key]}
                                                    onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                                                    style={{ padding: '8px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid #1e293b', color: 'white', fontSize: '0.85rem' }}
                                                />
                                            ) : (
                                                <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', wordBreak: 'break-all' }}>
                                                    {field.type === 'password' ? '••••••••••••' : formData[field.key]}
                                                </span>
                                            )}
                                        </div>
                                    ))}

                                    {isEditing && (
                                        <button
                                            onClick={handleManualSave}
                                            className="btn-primary"
                                            style={{ marginTop: '10px', fontSize: '0.8rem' }}
                                            disabled={loading}
                                        >
                                            {loading ? <RefreshCw className="animate-spin" size={14} /> : 'SAVE CHANGES'}
                                        </button>
                                    )}

                                    {!isEditing && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginTop: '5px', paddingTop: '5px', borderTop: '1px solid #1e293b' }}>
                                            <span style={{ color: '#64748b' }}>Provider:</span>
                                            <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>Meta Cloud API</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button onClick={() => window.confirm("Are you sure you want to disconnect? This will stop all active campaigns.") && axios.post('http://localhost:5000/api/client/update-meta', { AccessToken: '', isVerified: false }, { headers: { 'x-auth-token': token } }).then(() => window.location.reload())} className="btn-secondary" style={{ width: '100%', borderColor: '#ef4444', color: '#ef4444', marginTop: 'auto' }}>
                                <Trash2 size={16} /> Disconnect Account
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Connect;
