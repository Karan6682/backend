const waService = require('./services/whatsapp.service');
require('dotenv').config();

const phoneNumberId = '923009500898609';
const token = 'EAAVqLaG7pX4BQvUFKtozs5Lio89akM7bGY8D1UN0FukO08TL4d2FZCve55HeeURaDcaeJfBcOI3ZA9QRr9rabnPZBaOYiJg0waIyh6HwsZAz7aAf19YIUAaBkwLaONmuBjAQe4qSFAmDbrlJBnB5Bf9RYHZACtcOITVgWpClcmEx9X9s0PIXrxWuGPYsyAAZDZD';
const to = '918053284078'; // User's number
const templateName = 'simple_hello_v1';

async function send() {
    try {
        console.log(`Sending template '${templateName}' to ${to}...`);
        const result = await waService.sendTemplateMessage(phoneNumberId, token, to, templateName);
        console.log('Success!', result);
    } catch (error) {
        console.log('Error:', error);
    }
}

send();
