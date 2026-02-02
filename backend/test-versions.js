const axios = require('axios');

const token = 'EAAVqLaG7pX4BQvUFKtozs5Lio89akM7bGY8D1UN0FukO08TL4d2FZCve55HeeURaDcaeJfBcOI3ZA9QRr9rabnPZBaOYiJg0waIyh6HwsZAz7aAf19YIUAaBkwLaONmuBjAQe4qSFAmDbrlJBnB5Bf9RYHZACtcOITVgWpClcmEx9X9s0PIXrxWuGPYsyAAZDZD';
const phoneNumberId = '923009500898609';
const to = '918053284078';

async function testVersions() {
    const versions = ['v19.0', 'v20.0', 'v21.0'];
    for (const v of versions) {
        try {
            console.log(`Testing version ${v}...`);
            const res = await axios.post(
                `https://graph.facebook.com/${v}/${phoneNumberId}/messages`,
                {
                    messaging_product: "whatsapp",
                    recipient_type: "individual",
                    to: to,
                    type: "text",
                    text: { body: "Test from " + v }
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log(`Version ${v} Success!`, res.data);
            break;
        } catch (error) {
            console.log(`Version ${v} Error:`, error.response?.data?.error?.message || error.message);
        }
    }
}

testVersions();
