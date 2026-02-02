import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { Wallet, Plus, ArrowUpCircle, ArrowDownCircle, Clock, CheckCircle, Smartphone, Loader, Upload, Image as ImageIcon } from 'lucide-react';

const WalletPage = () => {
    const [wallet, setWallet] = useState({ balance: 0, perMessageCost: 0.50, transactions: [], isAdmin: false });
    const [rechargeAmount, setRechargeAmount] = useState('');
    const [newPricing, setNewPricing] = useState('');
    const [loading, setLoading] = useState(false);

    // Recharge Steps: 'amount' -> 'qr' -> 'verifying' -> 'success'
    const [step, setStep] = useState('amount');
    const [txnId, setTxnId] = useState('');
    const [screenshot, setScreenshot] = useState(null);
    const [adminUpi, setAdminUpi] = useState({ upiId: '', receiverName: '' });

    // Admin States
    const [pendingRequests, setPendingRequests] = useState([]);
    const [auditLog, setAuditLog] = useState([]);
    const [revenueStats, setRevenueStats] = useState({});
    const [upiSettings, setUpiSettings] = useState({ upiId: '', receiverName: '' });
    const [activeOrder, setActiveOrder] = useState(null);

    const [isPolling, setIsPolling] = useState(false);
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchWallet();
        fetchAdminUpi();

        let pollInterval;
        if (step === 'qr') {
            // Start Polling every 5 seconds like Razorpay
            pollInterval = setInterval(() => {
                fetchWalletSilent();
            }, 5000);
        }

        return () => clearInterval(pollInterval);
    }, [step]);

    const fetchWalletSilent = async () => {
        if (step !== 'qr' || !activeOrder) return;

        try {
            // Trigger Backend to check bank status for this specific order
            const res = await axios.post('http://localhost:5000/api/wallet/verify-auto-order', {
                orderId: activeOrder.orderId,
                amount: parseFloat(rechargeAmount)
            }, { headers: { 'x-auth-token': token } });

            if (res.data.success) {
                setStep('success');
                fetchWallet();
            }
        } catch (e) {
            // Silent error during polling to keep the UI clean
        }
    };

    const fetchWallet = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/wallet/balance', {
                headers: { 'x-auth-token': token }
            });
            setWallet(res.data);
            setNewPricing(res.data.perMessageCost);

            if (res.data.isAdmin) {
                fetchPendingRequests();
                fetchAuditLog();
                fetchRevenueStats();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchAdminUpi = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/wallet/admin/upi-info', {
                headers: { 'x-auth-token': token }
            });
            setAdminUpi(res.data);
            setUpiSettings(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchPendingRequests = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/wallet/pending-requests', {
                headers: { 'x-auth-token': token }
            });
            setPendingRequests(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchAuditLog = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/wallet/admin/history', {
                headers: { 'x-auth-token': token }
            });
            setAuditLog(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchRevenueStats = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/wallet/admin/stats', {
                headers: { 'x-auth-token': token }
            });
            setRevenueStats(res.data);
        } catch (err) { console.error(err); }
    };

    const handleGenerateQR = async (e) => {
        e.preventDefault();
        if (!rechargeAmount || rechargeAmount <= 0) return alert('Enter valid amount');

        setLoading(true);
        try {
            // STEP 1: Ask backend to create an automated order
            const res = await axios.post('http://localhost:5000/api/wallet/create-order',
                { amount: rechargeAmount },
                { headers: { 'x-auth-token': token } }
            );

            if (res.data.success) {
                setActiveOrder(res.data);
                setStep('qr');
            } else {
                alert(res.data.msg || "Failed to create order");
            }
        } catch (err) {
            const msg = err.response?.data?.error || err.response?.data?.msg || err.message;
            alert("Payment Error: " + msg);
        } finally {
            setLoading(false);
        }
    };

    // This function is no longer used in the new automated flow, but kept as per instruction
    const handleSubmitPayment = async () => {
        if (!txnId && !screenshot) return alert("Please enter UTR or upload a screenshot");

        setStep('verifying');

        try {
            const formData = new FormData();
            formData.append('amount', rechargeAmount);
            formData.append('referenceId', txnId || 'SCREENSHOT_PROOOF');
            if (screenshot) formData.append('screenshot', screenshot);

            await axios.post('http://localhost:5000/api/wallet/recharge', formData, {
                headers: {
                    'x-auth-token': token,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setStep('success');
            fetchWallet();
        } catch (err) {
            alert('Submission Failed: ' + (err.response?.data?.msg || err.message));
            setStep('qr');
        }
    };

    const handleMobilePay = () => {
        if (activeOrder?.upiUrl) {
            window.location.href = activeOrder.upiUrl;
        }
    };

    const handleAdminApprove = async (userId, transactionId, action) => {
        if (!window.confirm(`Are you sure you want to ${action} this transaction?`)) return;
        try {
            await axios.post('http://localhost:5000/api/wallet/approve-request', {
                userId, transactionId, action
            }, { headers: { 'x-auth-token': token } });

            alert(`Transaction ${action} successfully!`);
            fetchPendingRequests();
            fetchWallet();
        } catch (err) {
            alert('Action failed: ' + err.message);
        }
    };

    const updateUpiSettings = async () => {
        try {
            await axios.post('http://localhost:5000/api/wallet/admin/upi', upiSettings, { headers: { 'x-auth-token': token } });
            alert("UPI Details Updated Successfully!");
            fetchAdminUpi();
        } catch (err) {
            alert("Update failed");
        }
    };

    const updatePricing = async () => {
        setLoading(true);
        try {
            await axios.post('http://localhost:5000/api/wallet/update-pricing',
                { perMessageCost: parseFloat(newPricing) },
                { headers: { 'x-auth-token': token } }
            );
            alert(`Updated to ₹${newPricing}!`);
            fetchWallet();
        } catch (err) {
            alert('Failed: ' + (err.response?.data?.msg || err.message));
        } finally {
            setLoading(false);
        }
    };

    const resetRecharge = () => {
        setStep('amount');
        setRechargeAmount('');
        setActiveOrder(null);
    };

    const qrUrl = activeOrder ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(activeOrder.upiUrl)}` : '';

    return (
        <div className="dashboard-container">
            <Sidebar />

            <div className="main-content">
                <div style={{ maxWidth: '1000px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                        <div>
                            <h2>Wallet & Billing</h2>
                            <p style={{ color: '#94a3b8' }}>Secure payments and automated billing.</p>
                        </div>
                    </div>

                    {/* Balance Card */}
                    <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(16, 185, 129, 0.1))', marginBottom: '30px', padding: '30px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <p style={{ fontSize: '1rem', color: '#94a3b8', marginBottom: '10px' }}>Current Balance</p>
                                <h1 style={{ fontSize: '4rem', color: '#10b981', marginBottom: '5px' }}>₹{wallet.balance?.toFixed(2) || '0.00'}</h1>
                            </div>
                            <Wallet size={80} color="#10b981" style={{ opacity: 0.2 }} />
                        </div>

                        {wallet.isAdmin && (
                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '20px', paddingTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                                <div>
                                    <p style={{ fontSize: '0.85rem', color: '#f59e0b', marginBottom: '10px', fontWeight: 'bold' }}>👑 Set Service Charge</p>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <input
                                            type="number"
                                            value={newPricing}
                                            onChange={(e) => setNewPricing(e.target.value)}
                                            style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid #334155', borderRadius: '8px' }}
                                        />
                                        <button onClick={updatePricing} className="btn-secondary">Save</button>
                                    </div>
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.85rem', color: '#f59e0b', marginBottom: '10px', fontWeight: 'bold' }}>👑 Admin UPI Settings</p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <input
                                            type="text"
                                            placeholder="UPI ID"
                                            value={upiSettings.upiId}
                                            onChange={(e) => setUpiSettings({ ...upiSettings, upiId: e.target.value })}
                                            style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid #334155', borderRadius: '8px' }}
                                        />
                                        <button onClick={updateUpiSettings} className="btn-secondary">Update UPI</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ADMIN: PENDING REQUESTS */}
                    {wallet.isAdmin && pendingRequests.length > 0 && (
                        <div className="glass-card" style={{ marginBottom: '30px', border: '1px solid #f59e0b' }}>
                            <h3 style={{ color: '#f59e0b', marginBottom: '20px' }}>⚠️ Pending Manual Approvals</h3>
                            <div style={{ display: 'grid', gap: '15px' }}>
                                {pendingRequests.map(req => (
                                    <div key={req.transactionId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                            {req.screenshot ? (
                                                <a href={`http://localhost:5000${req.screenshot}`} target="_blank" rel="noreferrer">
                                                    <img src={`http://localhost:5000${req.screenshot}`} alt="Proof" style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover', border: '2px solid #3b82f6' }} title="Click to view full image" />
                                                </a>
                                            ) : (
                                                <div style={{ width: '60px', height: '60px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <ImageIcon size={24} color="#64748b" />
                                                </div>
                                            )}
                                            <div>
                                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#10b981' }}>₹{req.amount}</div>
                                                <div style={{ fontSize: '0.9rem', color: '#fff' }}>{req.userName} <span style={{ color: '#64748b' }}>({req.userEmail})</span></div>
                                                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>UTR: {req.referenceId} | {new Date(req.date).toLocaleString()}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button onClick={() => handleAdminApprove(req.userId, req.transactionId, 'reject')} className="btn-secondary" style={{ color: '#ef4444' }}>Reject</button>
                                            <button onClick={() => handleAdminApprove(req.userId, req.transactionId, 'approve')} className="btn-primary" style={{ background: '#10b981' }}>Approve</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px' }}>
                        {/* RECHARGE PANEL */}
                        <div className="glass-card">
                            <h3 style={{ marginBottom: '20px' }}>Add Funds to Wallet</h3>

                            {step === 'amount' && (
                                <form onSubmit={handleGenerateQR}>
                                    <div className="input-group">
                                        <label>Recharge Amount (₹)</label>
                                        <input
                                            type="number"
                                            placeholder="Min ₹1"
                                            value={rechargeAmount}
                                            onChange={(e) => setRechargeAmount(e.target.value)}
                                            style={{ fontSize: '1.5rem', padding: '15px' }}
                                            required
                                        />
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                                        {[10, 100, 500, 1000].map(amt => (
                                            <button key={amt} type="button" onClick={() => setRechargeAmount(amt)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #334155', background: 'transparent', color: '#94a3b8', cursor: 'pointer' }}>₹{amt}</button>
                                        ))}
                                    </div>
                                    <button type="submit" className="btn-primary" style={{ width: '100%', padding: '15px', fontSize: '1.1rem' }}>
                                        Continue to Payment
                                    </button>
                                </form>
                            )}

                            {step === 'qr' && (
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ marginBottom: '20px' }}>
                                        <p style={{ color: '#94a3b8', marginBottom: '5px' }}>Scan & Pay <b>₹{rechargeAmount}</b></p>

                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#3b82f6', fontSize: '0.85rem', marginBottom: '15px' }}>
                                            <Loader size={14} className="animate-spin" />
                                            Waiting for payment confirmation...
                                        </div>

                                        <div style={{ background: 'white', padding: '15px', borderRadius: '15px', display: 'inline-block', marginBottom: '15px' }}>
                                            <img src={qrUrl} alt="UPI QR" width="220" />
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                                            <button onClick={handleMobilePay} className="btn-primary" style={{ background: '#6d28d9', gap: '10px' }}>
                                                <Smartphone size={18} /> Open UPI App
                                            </button>
                                        </div>
                                    </div>

                                    <div style={{ textAlign: 'left', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
                                        <details style={{ textAlign: 'center', cursor: 'pointer' }}>
                                            <summary style={{ color: '#64748b', fontSize: '0.85rem' }}>Payment not updating? Upload proof manually</summary>
                                            <div style={{ marginTop: '20px', textAlign: 'left' }}>
                                                <p style={{ fontSize: '0.9rem', color: '#f59e0b', marginBottom: '15px' }}>Manual Verification</p>

                                                <div className="input-group">
                                                    <label>UTR Number</label>
                                                    <input type="text" placeholder="12 Digit UTR" value={txnId} onChange={(e) => setTxnId(e.target.value)} />
                                                </div>

                                                <div className="input-group">
                                                    <label>Payment Screenshot</label>
                                                    <input type="file" accept="image/*" onChange={(e) => setScreenshot(e.target.files[0])} />
                                                </div>

                                                <button onClick={handleSubmitPayment} className="btn-secondary" style={{ width: '100%', marginTop: '10px' }}>Submit Manually</button>
                                            </div>
                                        </details>

                                        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                            <button onClick={() => setStep('amount')} className="btn-secondary" style={{ flex: 1 }}>Cancel & Go Back</button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 'verifying' && (
                                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                                    <Loader className="animate-spin" size={50} color="#3b82f6" style={{ margin: '0 auto 20px' }} />
                                    <h3>Uploading Proof...</h3>
                                    <p style={{ color: '#94a3b8' }}>Please do not refresh the page.</p>
                                </div>
                            )}

                            {step === 'success' && (
                                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                                    <CheckCircle size={70} color="#10b981" style={{ margin: '0 auto 20px' }} />
                                    <h2 style={{ color: '#10b981' }}>Submitted Successfully!</h2>
                                    <p style={{ color: '#94a3b8', marginBottom: '30px' }}>Admin will verify your payment within 15-30 mins.</p>
                                    <button onClick={resetRecharge} className="btn-primary" style={{ padding: '12px 30px' }}>Got it</button>
                                </div>
                            )}
                        </div>

                        {/* HISTORY */}
                        <div className="glass-card">
                            <h3 style={{ marginBottom: '20px' }}>Transaction History</h3>
                            <div style={{ display: 'grid', gap: '12px' }}>
                                {wallet.transactions.length > 0 ? wallet.transactions.map((t, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '10px' }}>
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                            {t.type === 'credit' ? <ArrowUpCircle color={t.status === 'pending' ? '#f59e0b' : '#10b981'} size={24} /> : <ArrowDownCircle color="#ef4444" size={24} />}
                                            <div>
                                                <div style={{ fontSize: '0.9rem' }}>{t.description}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{new Date(t.timestamp).toLocaleString()}</div>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: 'bold', color: t.type === 'credit' ? '#10b981' : '#ef4444' }}>{t.type === 'credit' ? '+' : '-'}₹{t.amount}</div>
                                            {t.status === 'pending' && <span style={{ fontSize: '0.7rem', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>PENDING</span>}
                                        </div>
                                    </div>
                                )) : (
                                    <div style={{ textAlign: 'center', color: '#64748b', padding: '40px' }}>No transactions found</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx="true">{`
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default WalletPage;
