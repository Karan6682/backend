const axios = require('axios');

const token = 'EAAVqLaG7pX4BQi7yP5Myt4MUuBX7kY5dhjxtdVsPmNNBgclUep2AXrXWlQrf9iDxkZB5DhhBtGZCJ15wBJ0TSMxWg7rKYEyiiRDpZCG4i0BkUr6td23qwfK2PZCZClEz7CAJA2mDvfS2j6V6cOu9mqMdYL86nqfymJqt0uiHZCdf3zdPP6NVSasZA8W3WOOLeAZDZD';
const API_VERSION = 'v19.0';

async function test() {
    try {
        console.log('Testing token via /me endpoint...');
        const response = await axios.get(
            `https://graph.facebook.com/${API_VERSION}/me`,
            {
                params: {
                    access_token: token
                }
            }
        );
        console.log('Success!', response.data);
    } catch (error) {
        console.log('Error:', error.response?.data || error.message);
    }
}

test();
