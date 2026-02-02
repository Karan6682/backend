const axios = require('axios');

const TOKEN = 'EAAcM7XwZA28UBQhvO7ZBaq5WzEDHf8ZBy3XFRZBkBS27xhZA9ZBOer20CCYJlXBZCokIxzZBIRjnxbARVosqEMEZBVFElmZA3nT0jhYvdpMsVxwOZAZBJVcLKDrdDarb3IOZB4CSTSteG6v3W0oMqNGsL8ni72iKvkZCD1Y6opdEKZA3v7jyk03gp2biEFJUFIWp3g5zdZBRDwZDZD';
const PHONE_ID = '923009500898609';
const TO = '918683916682';

async function sendTest() {
    console.log(`Attempting to send Hello World template to ${TO}...`);
    try {
        const res = await axios.post(
            `https://graph.facebook.com/v19.0/${PHONE_ID}/messages`,
            {
                messaging_product: 'whatsapp',
                to: TO,
                type: 'template',
                template: {
                    name: 'hello_world',
                    language: { code: 'en_US' }
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        console.log('SUCCESS:', JSON.stringify(res.data, null, 2));
    } catch (e) {
        console.log('FAILED:', JSON.stringify(e.response?.data || e.message, null, 2));
    }
}

sendTest();
