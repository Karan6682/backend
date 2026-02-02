import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Zap, BarChart3, MessageCircle, Send, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Landing = () => {
    return (
        <div style={{ padding: '80px 5%' }}>
            <section style={{ textAlign: 'center', maxWidth: '900px', margin: '0 auto' }}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 style={{ fontSize: '4.5rem', fontWeight: '800', lineHeight: '1.1', marginBottom: '24px' }}>
                        Next-Gen <span className="gradient-text">WhatsApp Cloud</span> CRM for Business
                    </h1>
                    <p style={{ fontSize: '1.25rem', color: '#94a3b8', marginBottom: '40px' }}>
                        Scale your business with the official Meta Cloud API. No number blocking,
                        unlimited templates, and real-time CRM dashboard.
                    </p>
                    <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                        <Link to="/signup" className="btn-primary" style={{ padding: '16px 40px', fontSize: '1.1rem', textDecoration: 'none' }}>
                            Start for Free <Zap size={20} />
                        </Link>
                        <button className="btn-secondary" style={{ padding: '16px 40px', fontSize: '1.1rem' }}>
                            Watch Demo
                        </button>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                    className="glass-card"
                    style={{ marginTop: '80px', padding: '10px', height: '400px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <div style={{ background: '#0f172a', width: '100%', height: '100%', borderRadius: '12px', display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                        <div style={{ padding: '15px 20px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '12px', height: '12px', background: '#ff5f56', borderRadius: '50%' }}></div>
                            <div style={{ width: '12px', height: '12px', background: '#ffbd2e', borderRadius: '50%' }}></div>
                            <div style={{ width: '12px', height: '12px', background: '#27c93f', borderRadius: '50%' }}></div>
                            <span style={{ marginLeft: '10px', fontSize: '0.8rem', color: '#64748b' }}>CloudCRM - Dashboard Preview</span>
                        </div>
                        <div style={{ padding: '30px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                            <div className="glass-card" style={{ padding: '20px', background: 'rgba(37, 211, 102, 0.05)' }}>
                                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Total Sent</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>128,430</div>
                            </div>
                            <div className="glass-card" style={{ padding: '20px', background: 'rgba(59, 130, 246, 0.05)' }}>
                                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Active Templates</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>42</div>
                            </div>
                            <div className="glass-card" style={{ padding: '20px', background: 'rgba(168, 85, 247, 0.05)' }}>
                                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Revenue (MTD)</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>$4,250</div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>

            <section style={{ marginTop: '150px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                <div className="glass-card animate-fade">
                    <Shield color="#25d366" size={32} style={{ marginBottom: '20px' }} />
                    <h3>100% Legal & Safe</h3>
                    <p style={{ color: '#94a3b8' }}>Direct integration with official Meta infrastructure. No more WhatsApp number bans.</p>
                </div>
                <div className="glass-card animate-fade">
                    <Zap color="#3b82f6" size={32} style={{ marginBottom: '20px' }} />
                    <h3>Embedded Signup</h3>
                    <p style={{ color: '#94a3b8' }}>Self-service WhatsApp connection flow for your clients. Set up in under 5 minutes.</p>
                </div>
                <div className="glass-card animate-fade">
                    <BarChart3 color="#a855f7" size={32} style={{ marginBottom: '20px' }} />
                    <h3>Rich Analytics</h3>
                    <p style={{ color: '#94a3b8' }}>Monitor delivery rates, read statuses, and conversation costs in real-time.</p>
                </div>
            </section>

            <footer style={{ marginTop: '100px', borderTop: '1px solid #1e293b', paddingTop: '40px', paddingBottom: '20px', textAlign: 'center' }}>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '5px' }}>Powered by</p>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#f8fafc', letterSpacing: '1px' }}>STARNEXT TECHNOLOGIES</div>
                <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '20px' }}>&copy; {new Date().getFullYear()} CloudCRM API. All rights reserved.</p>
            </footer>
        </div >
    );
};

export default Landing;
