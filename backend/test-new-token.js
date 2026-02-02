const axios = require('axios');

const token = 'EAAVqLaG7pX4BQvUFKtozs5Lio89akM7bGY8D1UN0FukO08TL4d2FZCve55HeeURaDcaeJfBcOI3ZA9QRr9rabnPZBaOYiJg0waIyh6HwsZAz7aAf19YIUAaBkwLaONmuBjAQe4qSFAmDbrlJBnB5Bf9RYHZACtcOITVgWpClcmEx9X9s0PIXrxWuGPYsyAAZDZD';
const API_VERSION = 'v19.0';

async function test() {
    try {
        console.log('Testing NEW token via /me endpoint...');
        const response = await axios.get(
            `https://graph.facebook.com/${API_VERSION}/me`,
            {
                params: {
                    access_token: token
                }
            }
        );
        console.log('Success!', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.log('Error:', error.response?.data || error.message);
    }
}

test();
