import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import Sidebar from '../components/Sidebar';
import { Send, Phone, MessageSquare, Search, MoreVertical, CheckCheck, Sparkles } from 'lucide-react';

const Chat = () => {
    const [contacts, setContacts] = useState([]);
    const [messages, setMessages] = useState([]);
    const [activeContact, setActiveContact] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const socket = useRef(null);
    const messagesEndRef = useRef(null);
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        socket.current = io('http://localhost:5000');
        if (user) socket.current.emit('join', user.id);

        socket.current.on('new_message', (msg) => {
            setMessages(prev => [...prev, msg]);
            fetchContacts(); // Refresh contact list order
        });

        fetchContacts();

        return () => socket.current.disconnect();
    }, []);

    useEffect(scrollToBottom, [messages]);

    const fetchContacts = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/chat/contacts', {
                headers: { 'x-auth-token': token }
            });
            setContacts(res.data);
        } catch (err) { }
    };

    const fetchMessages = async (number) => {
        setLoading(true);
        setActiveContact(number);
        try {
            const res = await axios.get(`http://localhost:5000/api/chat/messages/${number}`, {
                headers: { 'x-auth-token': token }
            });
            setMessages(res.data);
            fetchContacts(); // Update unread markers
        } catch (err) { }
        setLoading(false);
    };

    const handleAISuggest = async () => {
        if (!activeContact || messages.length === 0) return;
        setAiLoading(true);
        try {
            const lastMsg = messages[messages.length - 1];
            if (lastMsg.direction === 'outgoing') {
                alert("AI already replied or waiting for customer.");
                setAiLoading(false);
                return;
            }

            const res = await axios.post('http://localhost:5000/api/chat/ai-suggest', {
                text: lastMsg.text,
                number: activeContact
            }, { headers: { 'x-auth-token': token } });

            setNewMessage(res.data.suggestion);
        } catch (err) {
            console.error("AI Suggestion failed");
        }
        setAiLoading(false);
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeContact) return;

        const sentMsg = newMessage;
        setNewMessage('');
        try {
            const res = await axios.post('http://localhost:5000/api/chat/send', {
                to: activeContact,
                text: sentMsg
            }, { headers: { 'x-auth-token': token } });
            setMessages(prev => [...prev, res.data.msg]);
        } catch (err) {
            alert('Failed to send message');
        }
    };

    return (
        <div className="dashboard-container" style={{ height: '100vh', overflow: 'hidden' }}>
            <Sidebar />

            <div className="main-content" style={{ display: 'flex', padding: 0, height: '100%' }}>

                {/* CONTACT LIST */}
                <div style={{ width: '350px', borderRight: '1px solid #1e293b', background: 'rgba(15, 23, 42, 0.5)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '20px', borderBottom: '1px solid #1e293b' }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Chats</h2>
                        <div style={{ position: 'relative' }}>
                            <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
                            <input
                                type="text"
                                placeholder="Search customers..."
                                style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: 'none' }}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {contacts.filter(c => c._id.includes(search)).map((contact, i) => (
                            <div
                                key={i}
                                onClick={() => fetchMessages(contact._id)}
                                style={{
                                    padding: '15px 20px',
                                    cursor: 'pointer',
                                    borderBottom: '1px solid #1e293b',
                                    background: activeContact === contact._id ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                    display: 'flex',
                                    gap: '15px',
                                    transition: '0.2s'
                                }}
                            >
                                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}>
                                    {contact._id.slice(-1)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                        <span style={{ fontWeight: '600' }}>+{contact._id}</span>
                                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{new Date(contact.lastTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', width: '200px' }}>
                                            {contact.lastMessage}
                                        </p>
                                        {contact.unreadCount > 0 && (
                                            <span style={{ background: '#22c55e', color: 'white', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold' }}>
                                                {contact.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CHAT WINDOW */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(2, 6, 23, 0.8)' }}>
                    {activeContact ? (
                        <>
                            {/* Chat Header */}
                            <div style={{ padding: '15px 30px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(15, 23, 42, 0.8)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>+{activeContact}</div>
                                    <span style={{ color: '#22c55e', fontSize: '0.8rem' }}>● Online (API)</span>
                                </div>
                                <div style={{ display: 'flex', gap: '20px', color: '#94a3b8' }}>
                                    <Phone size={20} className="hover-icon" />
                                    <MoreVertical size={20} className="hover-icon" />
                                </div>
                            </div>

                            {/* Messages area */}
                            <div style={{ flex: 1, overflowY: 'auto', padding: '30px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {messages.map((msg, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            alignSelf: msg.direction === 'incoming' ? 'flex-start' : 'flex-end',
                                            maxWidth: '70%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: msg.direction === 'incoming' ? 'flex-start' : 'flex-end'
                                        }}
                                    >
                                        <div style={{
                                            padding: '12px 18px',
                                            borderRadius: msg.direction === 'incoming' ? '0 15px 15px 15px' : '15px 15px 0 15px',
                                            background: msg.direction === 'incoming' ? '#1e293b' : '#3b82f6',
                                            color: 'white',
                                            fontSize: '0.95rem',
                                            border: '1px solid rgba(255,255,255,0.05)',
                                            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                                        }}>
                                            {msg.text}
                                            <div style={{ fontSize: '0.65rem', marginTop: '5px', textAlign: 'right', opacity: 0.7, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '4px' }}>
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                {msg.direction === 'outgoing' && <CheckCheck size={12} />}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Input */}
                            <div style={{ padding: '20px 30px', background: 'rgba(15, 23, 42, 0.8)' }}>
                                {aiLoading && (
                                    <div style={{ marginBottom: '10px', padding: '10px', background: 'rgba(139,92,246,0.1)', borderRadius: '8px', border: '1px solid rgba(139,92,246,0.3)', fontSize: '0.85rem', color: '#c4b5fd' }}>
                                        ✨ AI is analyzing chat history and generating smart reply...
                                    </div>
                                )}
                                <form onSubmit={handleSend} style={{ display: 'flex', gap: '10px' }}>
                                    <input
                                        type="text"
                                        placeholder="Type a message..."
                                        style={{ flex: 1, padding: '15px 25px', borderRadius: '30px', background: '#1e293b', border: '1px solid #334155', color: 'white' }}
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAISuggest}
                                        disabled={aiLoading || !activeContact}
                                        style={{
                                            width: '50px',
                                            height: '50px',
                                            borderRadius: '50%',
                                            background: aiLoading ? '#64748b' : 'linear-gradient(45deg, #8b5cf6, #ec4899)',
                                            border: 'none',
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: aiLoading ? 'not-allowed' : 'pointer',
                                            transition: '0.2s',
                                            position: 'relative'
                                        }}
                                        title="AI Smart Reply - Click to get intelligent suggestion based on chat history"
                                        className="btn-ai"
                                    >
                                        {aiLoading ? <div className="animate-spin">⌛</div> : <Sparkles size={20} />}
                                    </button>
                                    <button
                                        type="submit"
                                        style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#3b82f6', border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.2s' }}
                                        className="btn-send"
                                    >
                                        <Send size={20} />
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                            <div style={{ background: 'rgba(59, 130, 246, 0.05)', padding: '50px', borderRadius: '50%', marginBottom: '20px' }}>
                                <MessageSquare size={80} color="#1e293b" />
                            </div>
                            <h2 style={{ color: '#94a3b8' }}>WhatsApp Web for Cloud API</h2>
                            <p>Select a contact to start chatting in real-time.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Chat;
