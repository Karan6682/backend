import React, { useState } from 'react';
import {
    ArrowLeft,
    Smartphone,
    Globe,
    ShieldCheck,
    Key,
    CheckCircle,
    AlertTriangle,
    Info,
    ExternalLink,
    ChevronRight,
    Wifi,
    Lock,
    CreditCard,
    Zap,
    BookOpen
} from 'lucide-react';
import { Link } from 'react-router-dom';

const TokenGuide = () => {
    const [activeSection, setActiveSection] = useState('prereq');

    const sections = {
        prereq: {
            title: "पढ़ें (जरूरी जानकारी)",
            icon: <Info className="text-blue-400" />,
            content: (
                <div className="space-y-6">
                    <div className="glass-card p-6 border-l-4 border-blue-500">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Smartphone size={24} /> शुरू करने से पहले:
                        </h3>
                        <ul className="space-y-3 text-slate-300">
                            <li className="flex gap-2"><span>1.</span> आपके पास एक <strong>नया सिम कार्ड</strong> होना चाहिए जिस पर व्हाट्सएप न बना हो।</li>
                            <li className="flex gap-2"><span>2.</span> अगर उस नंबर पर पहले से व्हाट्सएप है, तो उसे <strong>Delete Account</strong> कर दें (सिर्फ Uninstall करने से काम नहीं चलेगा)।</li>
                            <li className="flex gap-2"><span>3.</span> एक बार Cloud API पर नंबर जुड़ने के बाद, आप उसे फोन के व्हाट्सएप ऐप में इस्तेमाल नहीं कर पाएंगे।</li>
                        </ul>
                    </div>
                </div>
            )
        },
        meta_app: {
            title: "Step 1: Meta App बनाना",
            icon: <Globe className="text-purple-400" />,
            content: (
                <div className="space-y-6">
                    <div className="glass-card p-6">
                        <p className="mb-4 text-slate-300">सबसे पहले आपको फेसबुक का 'डेवलपर पोर्टफोलियो' सेटअप करना होगा:</p>
                        <ol className="space-y-4 text-slate-300">
                            <li className="flex gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:border-blue-500/50 transition-all">
                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold">1</span>
                                <div>
                                    <p className="font-bold text-white">Open Meta Developers</p>
                                    <p className="text-sm">ब्राउज़र में <strong>developers.facebook.com</strong> खोलें और लॉगिन करें।</p>
                                    <a href="https://developers.facebook.com/apps" target="_blank" className="text-blue-400 text-xs mt-2 inline-flex items-center gap-1 hover:underline">
                                        Open My Apps <ExternalLink size={12} />
                                    </a>
                                </div>
                            </li>
                            <li className="flex gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:border-blue-500/50 transition-all">
                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold">2</span>
                                <div>
                                    <p className="font-bold text-white">Create App</p>
                                    <p className="text-sm"><strong>Create App</strong> बटन दबाएँ {'>'} <strong>Other</strong> चुनें {'>'} <strong>Business</strong> चुनें।</p>
                                </div>
                            </li>
                            <li className="flex gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:border-blue-500/50 transition-all">
                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold">3</span>
                                <div>
                                    <p className="font-bold text-white">App Details</p>
                                    <p className="text-sm">ऐप का नाम लिखें (जैसे MyCRM) और अपना बिजनेस अकाउंट चुनें।</p>
                                </div>
                            </li>
                        </ol>
                    </div>
                </div>
            )
        },
        whatsapp_setup: {
            title: "Step 2: नंबर जोड़ना",
            icon: <Zap className="text-green-400" />,
            content: (
                <div className="space-y-6">
                    <div className="glass-card p-6">
                        <ol className="space-y-4 text-slate-300">
                            <li className="flex gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center font-bold">1</span>
                                <div>
                                    <p className="font-bold text-white">Add WhatsApp Product</p>
                                    <p className="text-sm">ऐप डैशबोर्ड में <strong>WhatsApp</strong> खोजें और <strong>Set Up</strong> बटन दबाएँ।</p>
                                </div>
                            </li>
                            <li className="flex gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center font-bold">2</span>
                                <div>
                                    <p className="font-bold text-white">API Setup</p>
                                    <p className="text-sm">बाएं मेनू में <strong>API Setup</strong> पर जाएँ।</p>
                                </div>
                            </li>
                            <li className="flex gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center font-bold">3</span>
                                <div>
                                    <p className="font-bold text-white">Add Phone Number</p>
                                    <p className="text-sm">नीचे स्क्रॉल करें और <strong>Add Phone Number</strong> बटन दबाएँ। अपनी प्रोफाइल भरें और नया नंबर डालकर OTP से वेरिफाई करें।</p>
                                </div>
                            </li>
                        </ol>
                    </div>
                </div>
            )
        },
        permanent_token: {
            title: "Step 3: Permanent Token",
            icon: <Key className="text-yellow-400" />,
            content: (
                <div className="space-y-6">
                    <div className="glass-card p-6 border-l-4 border-yellow-500">
                        <p className="text-sm mb-4 bg-yellow-500/10 text-yellow-400 p-3 rounded-lg flex gap-2 items-center">
                            <AlertTriangle size={16} /> यह सबसे ज़रूरी स्टेप है। इसके बिना आपका व्हाट्सएप हर 24 घंटे में बंद हो जाएगा।
                        </p>
                        <ol className="space-y-4 text-slate-300">
                            <li className="flex gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center font-bold text-slate-900">1</span>
                                <div>
                                    <p className="font-bold text-white">System Users</p>
                                    <p className="text-sm"><strong>Business Settings {">"} Users {">"} System Users</strong> में जाएँ। एक नया यूजर बनाएँ (नाम: Admin, Role: Admin)।</p>
                                </div>
                            </li>
                            <li className="flex gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center font-bold text-slate-900">2</span>
                                <div>
                                    <p className="font-bold text-white">Assign Assets</p>
                                    <p className="text-sm"><strong>Assign Assets</strong> बटन दबाएँ {'>'} <strong>Apps</strong> चुनें {'>'} अपना ऐप चुनें {'>'} <strong>Full Control</strong> ऑन करें।</p>
                                </div>
                            </li>
                            <li className="flex gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center font-bold text-slate-900">3</span>
                                <div>
                                    <p className="font-bold text-white">Generate Token</p>
                                    <p className="text-sm"><strong>Generate Token</strong> दबाएँ {'>'} अपना ऐप चुनें {'>'} <strong>Never Expire</strong> चुनें {'>'} <strong>whatsapp_business_messaging</strong> और <strong>whatsapp_business_management</strong> टिक करें।</p>
                                </div>
                            </li>
                        </ol>
                    </div>
                </div>
            )
        },
        upi_setup: {
            title: "UPI Payment Setup",
            icon: <CreditCard className="text-pink-400" />,
            content: (
                <div className="space-y-6">
                    <div className="glass-card p-6">
                        <p className="mb-4 text-slate-300">अपने वॉलेट को 'Razorpay' जैसा ऑटोमेटेड बनाने के लिए:</p>
                        <div className="space-y-4">
                            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                <h4 className="font-bold text-white mb-2 flex items-center gap-2"><Smartphone size={16} /> Android Phone Setup</h4>
                                <p className="text-sm text-slate-400">अपने एंड्रॉइड फोन में <strong>MacroDroid</strong> ऐप इनस्टॉल करें और एक नियम (Macro) बनाएँ जो बैंक के SMS को इस लिंक पर भेजे:</p>
                                <code className="block mt-2 p-3 bg-black/50 rounded text-blue-300 text-xs break-all">
                                    http://localhost:5000/api/wallet/webhook/bank-sms
                                </code>
                            </div>
                            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                <h4 className="font-bold text-white mb-2 flex items-center gap-2"><CheckCircle size={16} /> कैसे काम करेगा?</h4>
                                <p className="text-sm text-slate-400">जैसे ही कोई आपको UPI पैसे भेजेगा, आपके फोन पर बैंक का मैसेज आएगा। MacroDroid उसे तुरंत आपके CRM को भेजेगा और यूजर का बैलेंस अपने आप बढ़ जाएगा।</p>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-[#0f172a]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link to="/connect" className="p-2 hover:bg-white/5 rounded-full transition-colors">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Setup Master Guide</h1>
                            <p className="text-xs text-slate-500">Step-by-step complete documentation</p>
                        </div>
                    </div>
                    <Link to="/connect" className="btn-primary py-2 text-sm flex items-center gap-2">
                        Get Started <ChevronRight size={16} />
                    </Link>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Sidebar Navigation */}
                <aside className="lg:col-span-3 space-y-2">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest px-4 mb-4">Configuration</p>
                    {Object.keys(sections).map((key) => (
                        <button
                            key={key}
                            onClick={() => setActiveSection(key)}
                            className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${activeSection === key
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]'
                                : 'hover:bg-white/5 border border-transparent'
                                }`}
                        >
                            {sections[key].icon}
                            <span className="font-medium">{sections[key].title}</span>
                        </button>
                    ))}

                    <div className="mt-10 p-4 rounded-2xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/5">
                        <BookOpen className="text-blue-400 mb-3" size={24} />
                        <h4 className="font-bold text-sm mb-1">Need help?</h4>
                        <p className="text-xs text-slate-400 mb-4">Our support team is available 24/7 for account validation.</p>
                        <button className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold transition-colors">
                            Contact Support
                        </button>
                    </div>
                </aside>

                {/* Content Area */}
                <section className="lg:col-span-9">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-white/5 rounded-2xl">
                            {sections[activeSection].icon}
                        </div>
                        <h2 className="text-3xl font-bold">{sections[activeSection].title}</h2>
                    </div>

                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {sections[activeSection].content}
                    </div>

                    {/* Footer Navigation within content */}
                    <div className="mt-20 pt-10 border-t border-white/5 flex justify-between items-center">
                        <div className="flex items-center gap-4 text-slate-500">
                            <Lock size={16} />
                            <span className="text-xs italic">Secure & Encrypted Configuration</span>
                        </div>
                        <div className="flex gap-4">
                            {activeSection !== 'prereq' && (
                                <button
                                    onClick={() => {
                                        const keys = Object.keys(sections);
                                        const idx = keys.indexOf(activeSection);
                                        setActiveSection(keys[idx - 1]);
                                    }}
                                    className="px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors flex items-center gap-2"
                                >
                                    Previous Step
                                </button>
                            )}
                            {activeSection !== 'upi_setup' ? (
                                <button
                                    onClick={() => {
                                        const keys = Object.keys(sections);
                                        const idx = keys.indexOf(activeSection);
                                        setActiveSection(keys[idx + 1]);
                                    }}
                                    className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20"
                                >
                                    Next Step <ChevronRight size={18} />
                                </button>
                            ) : (
                                <Link
                                    to="/connect"
                                    className="px-6 py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold transition-all flex items-center gap-2 shadow-lg shadow-green-600/20"
                                >
                                    Start Integration <Zap size={18} />
                                </Link>
                            )}
                        </div>
                    </div>
                </section>
            </main>

            {/* Design Elements */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/5 blur-[100px] rounded-full" />
            </div>
        </div>
    );
};

export default TokenGuide;
