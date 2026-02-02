import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Send, FileSpreadsheet, Plus, AlertCircle, Trash2, Upload, HelpCircle, Link as LinkIcon } from 'lucide-react';
import Sidebar from '../components/Sidebar';

import * as XLSX from 'xlsx';

const Campaign = () => {
    const [name, setName] = useState('');
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [contacts, setContacts] = useState('');
    const [loading, setLoading] = useState(false);
    const [scheduleType, setScheduleType] = useState('immediate');
    const [scheduleTime, setScheduleTime] = useState('');
    const [showHelp, setShowHelp] = useState(false);
    const [sheetsUrl, setSheetsUrl] = useState('');

    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    React.useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/whatsapp/templates', {
                    headers: { 'x-auth-token': token }
                });
                setTemplates(res.data.data || []);
                if (res.data.data?.length > 0) {
                    setSelectedTemplate(res.data.data[0]);
                }
            } catch (err) {
                console.error("Failed to fetch templates");
            }
        };
        fetchTemplates();
    }, []);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        // Handle Excel Files
        if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
            reader.onload = (event) => {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                // Extract phone numbers from first column
                const numbers = jsonData
                    .slice(1) // Skip header
                    .map(row => row[0])
                    .filter(num => num && num.toString().trim())
                    .map(num => num.toString().replace(/[^0-9]/g, ''))
                    .join('\n');

                setContacts(numbers);
                alert(`✅ ${numbers.split('\n').length} numbers imported from Excel!`);
            };
            reader.readAsArrayBuffer(file);
        }
        // Handle CSV Files
        else if (file.name.endsWith('.csv')) {
            reader.onload = (event) => {
                const text = event.target.result;
                const lines = text.split('\n');
                const numbers = lines
                    .slice(1) // Skip header
                    .map(line => line.split(',')[0])
                    .filter(num => num && num.trim())
                    .map(num => num.replace(/[^0-9]/g, ''))
                    .join('\n');

                setContacts(numbers);
                alert(`✅ ${numbers.split('\n').length} numbers imported from CSV!`);
            };
            reader.readAsText(file);
        }
    };

    const handleGoogleSheetsImport = async () => {
        if (!sheetsUrl) {
            alert("Please enter Google Sheets URL!");
            return;
        }

        try {
            // Extract Sheet ID from URL
            const match = sheetsUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
            if (!match) {
                alert("Invalid Google Sheets URL!");
                return;
            }

            const sheetId = match[1];
            const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;

            // Fetch CSV data
            const response = await fetch(csvUrl);
            const text = await response.text();

            const lines = text.split('\n');
            const numbers = lines
                .slice(1)
                .map(line => line.split(',')[0])
                .filter(num => num && num.trim())
                .map(num => num.replace(/[^0-9]/g, ''))
                .join('\n');

            setContacts(numbers);
            setSheetsUrl('');
            alert(`✅ ${numbers.split('\n').length} numbers imported from Google Sheets!`);
        } catch (err) {
            alert("Failed to import from Google Sheets. Make sure the sheet is publicly accessible!");
        }
    };

    const handleStart = async (e) => {
        e.preventDefault();
        setLoading(true);

        const contactList = contacts.split('\n').filter(n => n.trim() !== '').map(number => {
            const cleanNumber = number.toString().replace(/[^0-9]/g, '');
            return {
                number: cleanNumber,
                params: []
            };
        });

        if (contactList.length === 0) {
            alert('Please enter at least one contact');
            setLoading(false);
            return;
        }

        if (!selectedTemplate) {
            alert('Please select a template');
            setLoading(false);
            return;
        }

        try {
            await axios.post('http://localhost:5000/api/campaign/start', {
                name,
                templateName: selectedTemplate.name,
                contacts: contactList,
                schedule: scheduleType === 'schedule' ? scheduleTime : null
            }, {
                headers: { 'x-auth-token': token }
            });
            navigate('/dashboard');
        } catch (err) {
            alert(err.response?.data?.msg || 'Failed to start campaign');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-container">
            <Sidebar />

            <div className="main-content">
                <div style={{ maxWidth: '900px' }}>
                    <h2>Launch a New Campaign</h2>
                    <p style={{ color: '#94a3b8', marginBottom: '30px' }}>Reach thousands of customers instantly with Meta approved templates.</p>

                    <form onSubmit={handleStart} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>

                        {/* LEFT COLUMN */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                            <div className="glass-card">
                                <label style={{ display: 'block', marginBottom: '10px', color: '#94a3b8' }}>Campaign Schedule</label>
                                <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <input
                                            type="radio"
                                            name="schedule"
                                            checked={scheduleType === 'immediate'}
                                            onChange={() => setScheduleType('immediate')}
                                        /> Immediate
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <input
                                            type="radio"
                                            name="schedule"
                                            checked={scheduleType === 'schedule'}
                                            onChange={() => setScheduleType('schedule')}
                                        /> Schedule Later
                                    </label>
                                </div>
                                {scheduleType === 'schedule' && (
                                    <input
                                        type="datetime-local"
                                        className="input-field"
                                        value={scheduleTime}
                                        onChange={(e) => setScheduleTime(e.target.value)}
                                        style={{ width: '100%' }}
                                    />
                                )}
                            </div>

                            <div className="glass-card">
                                <div className="input-group">
                                    <label>Campaign Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Winter Sale 2024"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="input-group">
                                    <label>Select Template</label>
                                    <select
                                        value={selectedTemplate?.name || ''}
                                        onChange={(e) => setSelectedTemplate(templates.find(t => t.name === e.target.value))}
                                    >
                                        {templates.length > 0 ? templates.map(t => (
                                            <option key={t.id} value={t.name}>{t.name} ({t.category})</option>
                                        )) : (
                                            <option disabled>No templates found. Please sync.</option>
                                        )}
                                    </select>
                                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '8px' }}>
                                        <AlertCircle size={12} /> Only Meta-approved templates are listed here.
                                    </p>
                                </div>

                                {selectedTemplate && (
                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Template Preview</label>
                                        <div className="glass-card" style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.03)', marginTop: '5px' }}>
                                            {selectedTemplate.components?.find(c => c.type === 'BODY')?.text}
                                        </div>
                                    </div>
                                )}

                                <div className="glass-card" style={{ background: 'rgba(59, 130, 246, 0.05)', padding: '20px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                                    <h4 style={{ fontSize: '0.9rem', marginBottom: '10px' }}>Campaign Cost Calculation</h4>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                        <span>Estimated Cost:</span>
                                        <span>₹0.72 / Conv</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginTop: '5px', fontWeight: 'bold' }}>
                                        <span>Contacts selected:</span>
                                        <span>{contacts.split('\n').filter(n => n.trim()).length}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="glass-card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                    <label style={{ fontSize: '0.9rem', color: '#94a3b8' }}>📋 Contact Numbers</label>
                                    <button type="button" onClick={() => setShowHelp(true)} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'flex', gap: '5px', alignItems: 'center' }}>
                                        <HelpCircle size={14} /> Import Guide
                                    </button>
                                </div>

                                {/* Import Options */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                                    <button type="button" className="btn-secondary" style={{ padding: '10px', fontSize: '0.85rem', display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }} onClick={() => document.getElementById('excel-file').click()}>
                                        <FileSpreadsheet size={16} /> Upload Excel/CSV
                                    </button>
                                    <input
                                        type="file"
                                        id="excel-file"
                                        accept=".csv,.xlsx,.xls"
                                        style={{ display: 'none' }}
                                        onChange={handleFileUpload}
                                    />
                                    <button type="button" className="btn-secondary" style={{ padding: '10px', fontSize: '0.85rem', display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }} onClick={() => {
                                        const url = prompt("Paste Google Sheets URL:\n\n1. Open your Google Sheet\n2. Click Share > Anyone with link can view\n3. Copy the URL and paste here");
                                        if (url) {
                                            setSheetsUrl(url);
                                            handleGoogleSheetsImport();
                                        }
                                    }}>
                                        <LinkIcon size={16} /> Import from Google Sheets
                                    </button>
                                </div>

                                <textarea
                                    style={{
                                        width: '100%',
                                        height: '250px',
                                        background: 'var(--glass)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '12px',
                                        color: 'white',
                                        padding: '15px',
                                        outline: 'none',
                                        fontFamily: 'monospace'
                                    }}
                                    placeholder="91XXXXXXXXXX&#10;91XXXXXXXXXX&#10;&#10;Or use import buttons above"
                                    value={contacts}
                                    onChange={(e) => setContacts(e.target.value)}
                                    required
                                ></textarea>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                    <button type="button" onClick={() => setContacts('')} className="btn-secondary" style={{ flex: 1, padding: '12px' }}>
                                        <Trash2 size={18} /> Clear
                                    </button>
                                    <button type="submit" className="btn-primary" style={{ flex: 2, padding: '12px' }} disabled={loading}>
                                        {loading ? 'Starting...' : 'Launch Campaign'} <Send size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN - Preview/Stats */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                            <div className="glass-card">
                                <h4 style={{ marginBottom: '15px' }}>Campaign Preview</h4>
                                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                                    Your campaign will be sent to {contacts.split('\n').filter(n => n.trim()).length} contacts using the selected template.
                                </p>
                            </div>
                        </div>
                    </form>

                    {/* HELP MODAL */}
                    {showHelp && (
                        <div className="modal-overlay">
                            <div className="modal-content" style={{ width: '650px', maxHeight: '90vh', overflowY: 'auto' }}>
                                <h3 style={{ marginBottom: '20px' }}>📊 Import Contacts Guide</h3>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px' }}>
                                        <h4 style={{ color: '#3b82f6', marginBottom: '10px' }}>📁 Excel/CSV Format</h4>
                                        <p style={{ color: '#cbd5e1', lineHeight: '1.6', marginBottom: '10px' }}>
                                            Your file should have phone numbers in the <strong>first column</strong>:
                                        </p>
                                        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                                            <div style={{ color: '#64748b', marginBottom: '5px' }}>A1: Phone Number</div>
                                            <div style={{ color: '#10b981' }}>A2: 919876543210</div>
                                            <div style={{ color: '#10b981' }}>A3: 919123456789</div>
                                            <div style={{ color: '#10b981' }}>A4: 918765432109</div>
                                        </div>
                                        <small style={{ color: '#94a3b8', marginTop: '10px', display: 'block' }}>
                                            ✅ Supported formats: .xlsx, .xls, .csv
                                        </small>
                                    </div>

                                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px' }}>
                                        <h4 style={{ color: '#10b981', marginBottom: '10px' }}>🔗 Google Sheets Import</h4>
                                        <ol style={{ color: '#cbd5e1', lineHeight: '1.8', paddingLeft: '20px' }}>
                                            <li>Open your Google Sheet</li>
                                            <li>Click <strong>Share</strong> button (top-right)</li>
                                            <li>Change to <strong>"Anyone with the link can view"</strong></li>
                                            <li>Copy the sheet URL</li>
                                            <li>Click "Import from Google Sheets" button</li>
                                            <li>Paste the URL when prompted</li>
                                        </ol>
                                        <div style={{ background: 'rgba(239,68,68,0.1)', padding: '10px', borderRadius: '8px', marginTop: '10px', border: '1px solid rgba(239,68,68,0.3)' }}>
                                            <small style={{ color: '#fca5a5', fontSize: '0.85rem' }}>
                                                ⚠️ Make sure the sheet is publicly accessible, otherwise import will fail!
                                            </small>
                                        </div>
                                    </div>

                                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px' }}>
                                        <h4 style={{ color: '#facc15', marginBottom: '10px' }}>📝 Phone Number Format</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span style={{ color: '#10b981', fontSize: '1.2rem' }}>✓</span>
                                                <span style={{ color: '#cbd5e1' }}>919876543210 (with country code)</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span style={{ color: '#10b981', fontSize: '1.2rem' }}>✓</span>
                                                <span style={{ color: '#cbd5e1' }}>91 9876543210 (spaces allowed)</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span style={{ color: '#ef4444', fontSize: '1.2rem' }}>✗</span>
                                                <span style={{ color: '#64748b' }}>9876543210 (missing country code)</span>
                                            </div>
                                        </div>
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
        </div>
    );
};

export default Campaign;
