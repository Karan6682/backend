const axios = require('axios');

const token = 'EAAVqLaG7pX4BQvUFKtozs5Lio89akM7bGY8D1UN0FukO08TL4d2FZCve55HeeURaDcaeJfBcOI3ZA9QRr9rabnPZBaOYiJg0waIyh6HwsZAz7aAf19YIUAaBkwLaONmuBjAQe4qSFAmDbrlJBnB5Bf9RYHZACtcOITVgWpClcmEx9X9s0PIXrxWuGPYsyAAZDZD';
const wabaId = '1804775563567759';
const API_VERSION = 'v19.0';

async function checkTemplates() {
    try {
        console.log(`Checking templates for WABA ${wabaId}...`);
        const res = await axios.get(
            `https://graph.facebook.com/${API_VERSION}/${wabaId}/message_templates`,
            { params: { access_token: token } }
        );
        console.log('Templates:', JSON.stringify(res.data, null, 2));
    } catch (error) {
        console.log('Error:', error.response?.data || error.message);
    }
}

checkTemplates();
