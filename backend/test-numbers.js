const axios = require('axios');

const wabaId = '15786370731618';
const accessToken = 'EAAWrk67ZChXIBQav8QZAZC6ZC9JZAxiwVy6Y5LBzJnEP8CmgJQpi40bLYw8zHHtJmZCZCwCZCk2MGKtN2VNnkJM2NzrbZCc9VfMP4rE0kjBmlmdSwVk8XNxJBoyTYJy0DDGuzAe5KgeXrTaNyty7yM1VbTh29Q4MrZBrtxdjzDtYCET9ZZBnNzJ7X6Yre9BSdWPj';
const API_VERSION = 'v19.0';

async function test() {
    try {
        const response = await axios.get(
            `https://graph.facebook.com/${API_VERSION}/${wabaId}/phone_numbers`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        );
        console.log('Success:', response.data);
    } catch (error) {
        console.log('Error:', error.response?.data || error.message);
    }
}

test();
