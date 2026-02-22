import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Building, ArrowRight } from 'lucide-react';

const Signup = ({ setUser }) => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', company: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await axios.post('http://localhost:5000/api/auth/signup', formData);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            setUser(res.data.user);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.msg || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="glass-card auth-card animate-fade">
                <h2 style={{ marginBottom: '10px', fontSize: '1.8rem' }}>Create Account</h2>
                <p style={{ color: '#94a3b8', marginBottom: '30px' }}>Start scaling your WhatsApp communication</p>

                {error && <div style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem' }}>{error}</div>}

                <form onSubmit={handleSignup}>
                    <div className="input-group">
                        <label>Full Name</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: '#64748b' }} />
                            <input
                                type="text"
                                placeholder="John Doe"
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                style={{ paddingLeft: '40px' }}
                            />
                        </div>
                    </div>
                    <div className="input-group">
                        <label>Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: '#64748b' }} />
                            <input
                                type="email"
                                placeholder="name@company.com"
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                style={{ paddingLeft: '40px' }}
                            />
                        </div>
                    </div>
                    <div className="input-group">
                        <label>Company Name</label>
                        <div style={{ position: 'relative' }}>
                            <Building size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: '#64748b' }} />
                            <input
                                type="text"
                                placeholder="MetaCorp Inc."
                                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                required
                                style={{ paddingLeft: '40px' }}
                            />
                        </div>
                    </div>
                    <div className="input-group">
                        <label>Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: '#64748b' }} />
                            <input
                                type="password"
                                placeholder="••••••••"
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                style={{ paddingLeft: '40px' }}
                            />
                        </div>
                    </div>
                    <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px' }} disabled={loading}>
                        {loading ? 'Creating account...' : 'Create Account'} <ArrowRight size={20} />
                    </button>
                </form>

                {/* Demo preview button: open dashboard in a new tab with demo data */}
                <div style={{ marginTop: '14px' }}>
                    <button
                        type="button"
                        className="btn-outline"
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', cursor: 'pointer' }}
                        onClick={() => window.open('/dashboard?demo=true', '_blank')}
                    >
                        Preview Demo Dashboard
                    </button>
                </div>

                <p style={{ marginTop: '25px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                    Already have an account? <Link to="/login" style={{ color: '#25d366', textDecoration: 'none', fontWeight: '600' }}>Log in</Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;
