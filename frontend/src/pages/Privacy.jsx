import React from 'react';

const Privacy = () => {
    return (
        <div style={{ padding: '80px 10%', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '30px' }} className="gradient-text">Privacy Policy</h1>
            <p style={{ color: '#94a3b8', marginBottom: '20px' }}>Last Updated: January 14, 2026</p>

            <div className="glass-card" style={{ padding: '40px', lineHeight: '1.8' }}>
                <section style={{ marginBottom: '30px' }}>
                    <h3>1. Information We Collect</h3>
                    <p>We collect information you provide directly to us when you create an account, connect your WhatsApp Business API, or use our services. This includes your name, email address, company details, and Meta API credentials.</p>
                </section>

                <section style={{ marginBottom: '30px' }}>
                    <h3>2. How We Use Your Information</h3>
                    <p>We use the information we collect to provide, maintain, and improve our services, specifically to facilitate the sending of WhatsApp messages via the official Meta Cloud API on your behalf.</p>
                </section>

                <section style={{ marginBottom: '30px' }}>
                    <h3>3. Data Security</h3>
                    <p>We implement industry-standard security measures to protect your data. Your Meta Access Tokens are encrypted before being stored in our database. We do not store the content of your messages beyond what is necessary for campaign logging.</p>
                </section>

                <section style={{ marginBottom: '30px' }}>
                    <h3>4. Third-Party Services</h3>
                    <p>Our service integrates with Meta (Facebook) Cloud API. By using our service, you also agree to Meta's Business Terms and Privacy Policy. We do not sell your personal information to third parties.</p>
                </section>

                <section style={{ marginBottom: '30px' }}>
                    <h3>5. Contact Us</h3>
                    <p>If you have any questions about this Privacy Policy, please contact us at support@pathostar.com.</p>
                </section>
            </div>
        </div>
    );
};

export default Privacy;
