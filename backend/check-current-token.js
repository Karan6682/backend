const axios = require('axios');
const fs = require('fs');
const path = require('path');

const appId = '1596025668076914';
const appSecret = 'b47ef916c821344dff83c3ed82f3c881';
const token = fs.readFileSync(path.join(__dirname, 'token.txt'), 'utf8').trim();

async function test() {
    try {
        console.log('Inspecting token from token.txt...');
        const response = await axios.get(
            `https://graph.facebook.com/debug_token`,
            {
                params: {
                    input_token: token,
                    access_token: `${appId}|${appSecret}`
                }
            }
        );
        console.log('Token Info:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.log('Error:', error.response?.data || error.message);
    }
}

test();
