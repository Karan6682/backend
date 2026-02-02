import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { Calendar, RefreshCw } from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title as ChartTitle,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ChartTitle,
    Tooltip,
    Legend,
    Filler
);

const ReportsPage = () => {
    const [stats, setStats] = useState({
        campaignsCount: 0,
        messages: { sent: 0, delivered: 0, read: 0, failed: 0 },
        cost: 0,
        campaignData: []
    });
    const [dates, setDates] = useState({ start: '', end: '' });
    const [loading, setLoading] = useState(false);
    const token = localStorage.getItem('token');

    useEffect(() => {
        // Default: Last 30 days
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 30);

        setDates({
            start: start.toISOString().split('T')[0],
            end: end.toISOString().split('T')[0]
        });
    }, []);

    useEffect(() => {
        if (dates.start && dates.end) {
            fetchReports();
        }
    }, [dates]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:5000/api/reports/summary?startDate=${dates.start}&endDate=${dates.end}`, {
                headers: { 'x-auth-token': token }
            });
            setStats(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const [metaStats, setMetaStats] = useState(null);
    const [metaLoading, setMetaLoading] = useState(false);

    const fetchMetaAnalytics = async () => {
        setMetaLoading(true);
        try {
            const startTs = Math.floor(new Date(dates.start).getTime() / 1000);
            const endTs = Math.floor(new Date(dates.end).getTime() / 1000);

            const res = await axios.get(`http://localhost:5000/api/whatsapp/analytics?start=${startTs}&end=${endTs}`, {
                headers: { 'x-auth-token': token }
            });
            setMetaStats(res.data.data);
            alert("Meta Analytics Synced!");
        } catch (err) {
            alert("External Analytics Fetch Failed: " + (err.response?.data?.error || err.message));
        } finally {
            setMetaLoading(false);
        }
    };

    // Chart Data Preparation
    const lineChartData = {
        labels: stats.campaignData.map(c => new Date(c.createdAt).toLocaleDateString()),
        datasets: [
            {
                fill: true,
                label: 'Delivered',
                data: stats.campaignData.map(c => c.deliveredCount),
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4
            },
            {
                fill: true,
                label: 'Read',
                data: stats.campaignData.map(c => c.readCount),
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4
            }
        ]
    };

    return (
        <div className="dashboard-container">
            <Sidebar />

            <div className="main-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <div>
                        <h2>Analytics & Reports</h2>
                        <p style={{ color: '#94a3b8' }}>Track performance and costs.</p>
                    </div>
                    <button
                        onClick={fetchMetaAnalytics}
                        className="btn-secondary"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', borderColor: '#25d366', color: '#25d366' }}
                        disabled={metaLoading}
                    >
                        <RefreshCw size={16} className={metaLoading ? 'animate-spin' : ''} />
                        {metaLoading ? 'Syncing...' : 'Sync Meta Real-time'}
                    </button>
                </div>

                {/* Filters */}
                <div className="glass-card" style={{ marginBottom: '30px', display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div className="input-with-icon">
                        <Calendar size={18} color="#94a3b8" />
                        <input
                            type="date"
                            value={dates.start}
                            onChange={(e) => setDates({ ...dates, start: e.target.value })}
                        />
                    </div>
                    <span style={{ color: '#64748b' }}>to</span>
                    <div className="input-with-icon">
                        <Calendar size={18} color="#94a3b8" />
                        <input
                            type="date"
                            value={dates.end}
                            onChange={(e) => setDates({ ...dates, end: e.target.value })}
                        />
                    </div>
                    <button onClick={fetchReports} className="btn-primary" disabled={loading}>
                        {loading ? 'Loading...' : 'Filter Data'}
                    </button>
                </div>

                {/* Stats Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                    <div className="glass-card">
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Total Spend</p>
                        <h2 style={{ fontSize: '2rem', color: '#f59e0b' }}>₹{stats.cost.toFixed(2)}</h2>
                    </div>
                    <div className="glass-card">
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Delivered Msgs</p>
                        <h2 style={{ fontSize: '2rem', color: '#10b981' }}>{stats.messages.delivered.toLocaleString()}</h2>
                    </div>
                    <div className="glass-card">
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Read Rate</p>
                        <h2 style={{ fontSize: '2rem', color: '#3b82f6' }}>
                            {stats.messages.delivered > 0 ? ((stats.messages.read / stats.messages.delivered) * 100).toFixed(1) : 0}%
                        </h2>
                    </div>
                    <div className="glass-card">
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Failed Msgs</p>
                        <h2 style={{ fontSize: '2rem', color: '#ef4444' }}>{stats.messages.failed.toLocaleString()}</h2>
                    </div>
                </div>

                {/* Main Visuals */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '40px' }}>
                    <div className="glass-card" style={{ height: '400px' }}>
                        <h3 style={{ marginBottom: '20px' }}>Engagement Trend</h3>
                        <div style={{ height: '300px' }}>
                            <Line data={lineChartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: true, position: 'bottom' } } }} />
                        </div>
                    </div>

                    <div className="glass-card">
                        <h3 style={{ marginBottom: '20px' }}>Quick Stats</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div style={{ padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                                <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Total Campaigns</p>
                                <h4 style={{ fontSize: '1.5rem' }}>{stats.campaignsCount}</h4>
                            </div>
                            <div style={{ padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                                <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Avg. Cost per Message</p>
                                <h4 style={{ fontSize: '1.5rem' }}>₹{(stats.cost / (stats.messages.sent || 1)).toFixed(2)}</h4>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="glass-card">
                    <h3 style={{ marginBottom: '20px' }}>Campaign Performance Log</h3>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Campaign Name</th>
                                    <th>Sent</th>
                                    <th>Delivered</th>
                                    <th>Read</th>
                                    <th>Failed</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.campaignData.length > 0 ? (
                                    stats.campaignData.map(c => (
                                        <tr key={c._id}>
                                            <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                                            <td>{c.name}</td>
                                            <td>{c.sentCount}</td>
                                            <td style={{ color: '#10b981' }}>{c.deliveredCount}</td>
                                            <td style={{ color: '#3b82f6' }}>{c.readCount}</td>
                                            <td style={{ color: '#ef4444' }}>{c.failedCount}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>No data found for selected range</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;
