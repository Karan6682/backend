const axios = require('axios');

const token = 'EAAVqLaG7pX4BQvUFKtozs5Lio89akM7bGY8D1UN0FukO08TL4d2FZCve55HeeURaDcaeJfBcOI3ZA9QRr9rabnPZBaOYiJg0waIyh6HwsZAz7aAf19YIUAaBkwLaONmuBjAQe4qSFAmDbrlJBnB5Bf9RYHZACtcOITVgWpClcmEx9X9s0PIXrxWuGPYsyAAZDZD';
const API_VERSION = 'v19.0';

async function discover() {
    try {
        console.log('Discovering accounts...');

        // 1. Get WABAs
        const wabaRes = await axios.get(
            `https://graph.facebook.com/${API_VERSION}/me/client_whatsapp_business_accounts`,
            { params: { access_token: token } }
        );
        console.log('WABA Accounts:', JSON.stringify(wabaRes.data, null, 2));

        if (wabaRes.data.data.length > 0) {
            const wabaId = wabaRes.data.data[0].id;

            // 2. Get Phone Numbers for the first WABA
            const phoneRes = await axios.get(
                `https://graph.facebook.com/${API_VERSION}/${wabaId}/phone_numbers`,
                { params: { access_token: token } }
            );
            console.log('Phone Numbers:', JSON.stringify(phoneRes.data, null, 2));
        }

    } catch (error) {
        console.log('Error:', error.response?.data || error.message);
    }
}

discover();
