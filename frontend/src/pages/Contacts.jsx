import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { Users, Tag, Search, Plus, Edit2, Trash2, Filter, UserPlus, X, Phone } from 'lucide-react';

const Contacts = () => {
    const [contacts, setContacts] = useState([]);
    const [filteredContacts, setFilteredContacts] = useState([]);
    const [allTags, setAllTags] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedTag, setSelectedTag] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingContact, setEditingContact] = useState(null);
    const [newTag, setNewTag] = useState('');
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchContacts();
        fetchTags();
    }, []);

    useEffect(() => {
        filterContacts();
    }, [search, selectedTag, contacts]);

    const fetchContacts = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/contact', {
                headers: { 'x-auth-token': token }
            });
            setContacts(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchTags = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/contact/tags/list', {
                headers: { 'x-auth-token': token }
            });
            setAllTags(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const filterContacts = () => {
        let filtered = contacts;

        if (search) {
            filtered = filtered.filter(c =>
                c.phoneNumber?.includes(search) ||
                c.name?.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (selectedTag) {
            filtered = filtered.filter(c => c.tags?.includes(selectedTag));
        }

        setFilteredContacts(filtered);
    };

    const handleAddTag = async (contactId) => {
        if (!newTag.trim()) return;
        try {
            await axios.post(`http://localhost:5000/api/contact/${contactId}/tag`,
                { tag: newTag.trim() },
                { headers: { 'x-auth-token': token } }
            );
            setNewTag('');
            fetchContacts();
            fetchTags();
        } catch (err) {
            alert('Failed to add tag');
        }
    };

    const handleRemoveTag = async (contactId, tag) => {
        try {
            await axios.delete(`http://localhost:5000/api/contact/${contactId}/tag/${tag}`, {
                headers: { 'x-auth-token': token }
            });
            fetchContacts();
        } catch (err) {
            alert('Failed to remove tag');
        }
    };

    const handleUpdateContact = async () => {
        try {
            await axios.put(`http://localhost:5000/api/contact/${editingContact._id}`,
                editingContact,
                { headers: { 'x-auth-token': token } }
            );
            setShowModal(false);
            setEditingContact(null);
            fetchContacts();
            alert('✅ Contact updated!');
        } catch (err) {
            alert('Failed to update contact');
        }
    };

    const tagColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    return (
        <div className="dashboard-container">
            <Sidebar />

            <div className="main-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <div>
                        <h2>👥 Contacts & Segmentation</h2>
                        <p style={{ color: '#94a3b8' }}>Manage and organize your customers with tags.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
                            {filteredContacts.length} of {contacts.length} contacts
                        </span>
                    </div>
                </div>

                {/* Filters */}
                <div className="glass-card" style={{ marginBottom: '20px', display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
                        <input
                            type="text"
                            placeholder="Search by name or number..."
                            style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <Filter size={16} color="#64748b" />
                        <button
                            onClick={() => setSelectedTag('')}
                            className={!selectedTag ? 'btn-primary' : 'btn-secondary'}
                            style={{ padding: '8px 15px', fontSize: '0.85rem' }}
                        >
                            All
                        </button>
                        {allTags.map((tag, i) => (
                            <button
                                key={tag}
                                onClick={() => setSelectedTag(tag)}
                                className={selectedTag === tag ? 'btn-primary' : 'btn-secondary'}
                                style={{
                                    padding: '8px 15px',
                                    fontSize: '0.85rem',
                                    borderColor: selectedTag === tag ? tagColors[i % tagColors.length] : undefined,
                                    background: selectedTag === tag ? tagColors[i % tagColors.length] : undefined
                                }}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Contacts Table */}
                <div className="glass-card">
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Contact</th>
                                    <th>Phone Number</th>
                                    <th>Tags</th>
                                    <th>Last Contacted</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredContacts.map((contact, i) => (
                                    <tr key={contact._id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{
                                                    width: '35px',
                                                    height: '35px',
                                                    borderRadius: '50%',
                                                    background: tagColors[i % tagColors.length],
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontWeight: 'bold'
                                                }}>
                                                    {contact.name ? contact.name[0].toUpperCase() : '?'}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: '600' }}>{contact.name || 'Unknown'}</div>
                                                    {contact.email && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{contact.email}</div>}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ fontFamily: 'monospace' }}>+{contact.phoneNumber}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', alignItems: 'center' }}>
                                                {contact.tags?.map((tag, idx) => (
                                                    <span
                                                        key={tag}
                                                        style={{
                                                            padding: '3px 8px',
                                                            background: tagColors[idx % tagColors.length] + '33',
                                                            color: tagColors[idx % tagColors.length],
                                                            borderRadius: '5px',
                                                            fontSize: '0.75rem',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '4px'
                                                        }}
                                                    >
                                                        {tag}
                                                        <X
                                                            size={12}
                                                            style={{ cursor: 'pointer' }}
                                                            onClick={() => handleRemoveTag(contact._id, tag)}
                                                        />
                                                    </span>
                                                ))}
                                                <input
                                                    type="text"
                                                    placeholder="+ tag"
                                                    style={{
                                                        width: '70px',
                                                        padding: '3px 6px',
                                                        fontSize: '0.75rem',
                                                        background: 'rgba(255,255,255,0.05)',
                                                        border: '1px dashed rgba(255,255,255,0.2)',
                                                        borderRadius: '5px',
                                                        color: 'white'
                                                    }}
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter') {
                                                            setNewTag(e.target.value);
                                                            handleAddTag(contact._id);
                                                            e.target.value = '';
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </td>
                                        <td style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                                            {contact.lastContacted ? new Date(contact.lastContacted).toLocaleDateString() : 'Never'}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={() => {
                                                        alert(`📞 Calling +${contact.phoneNumber}...\n\nClick-to-Call feature ready! Integrate with Twilio/Exotel for production.`);
                                                    }}
                                                    className="btn-secondary"
                                                    style={{ padding: '6px 12px', fontSize: '0.8rem', background: 'linear-gradient(45deg, #10b981, #059669)' }}
                                                    title="Click to Call"
                                                >
                                                    <Phone size={14} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setEditingContact(contact);
                                                        setShowModal(true);
                                                    }}
                                                    className="btn-secondary"
                                                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                                                >
                                                    <Edit2 size={14} /> Edit
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredContacts.length === 0 && (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                            <Users size={40} style={{ opacity: 0.3, marginBottom: '10px' }} />
                                            <p>No contacts found. They will appear here when customers message you.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Edit Modal */}
                {showModal && editingContact && (
                    <div className="modal-overlay">
                        <div className="modal-content" style={{ width: '500px' }}>
                            <h3>Edit Contact</h3>

                            <div className="form-group">
                                <label>Name</label>
                                <input
                                    type="text"
                                    value={editingContact.name || ''}
                                    onChange={(e) => setEditingContact({ ...editingContact, name: e.target.value })}
                                    placeholder="Customer Name"
                                />
                            </div>

                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={editingContact.email || ''}
                                    onChange={(e) => setEditingContact({ ...editingContact, email: e.target.value })}
                                    placeholder="email@example.com"
                                />
                            </div>

                            <div className="form-group">
                                <label>Notes</label>
                                <textarea
                                    value={editingContact.notes || ''}
                                    onChange={(e) => setEditingContact({ ...editingContact, notes: e.target.value })}
                                    placeholder="Add notes about this contact..."
                                    rows="3"
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                <button className="btn-secondary" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Cancel</button>
                                <button className="btn-primary" onClick={handleUpdateContact} style={{ flex: 1 }}>Save Changes</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Contacts;
