const waService = require('./services/whatsapp.service');
require('dotenv').config();

const phoneNumberId = '923009500898609';
const token = 'EAAVqLaG7pX4BQvUFKtozs5Lio89akM7bGY8D1UN0FukO08TL4d2FZCve55HeeURaDcaeJfBcOI3ZA9QRr9rabnPZBaOYiJg0waIyh6HwsZAz7aAf19YIUAaBkwLaONmuBjAQe4qSFAmDbrlJBnB5Bf9RYHZACtcOITVgWpClcmEx9X9s0PIXrxWuGPYsyAAZDZD';
const to = '918053284078';
const text = 'Hello from CloudCRM Agent!';

async function send() {
    try {
        console.log(`Sending text to ${to}...`);
        const result = await waService.sendTextMessage(phoneNumberId, token, to, text);
        console.log('Success!', result);
    } catch (error) {
        console.log('Error:', JSON.stringify(error, null, 2));
    }
}

send();
