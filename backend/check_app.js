const axios = require('axios');

const TOKEN = 'EAAcM7XwZA28UBQhvO7ZBaq5WzEDHf8ZBy3XFRZBkBS27xhZA9ZBOer20CCYJlXBZCokIxzZBIRjnxbARVosqEMEZBVFElmZA3nT0jhYvdpMsVxwOZAZBJVcLKDrdDarb3IOZB4CSTSteG6v3W0oMqNGsL8ni72iKvkZCD1Y6opdEKZA3v7jyk03gp2biEFJUFIWp3g5zdZBRDwZDZD';
const APP_ID = '1984538965826501';

async function checkApp() {
    try {
        // Checking app mode (Development vs Live)
        const res = await axios.get(`https://graph.facebook.com/v19.0/${APP_ID}?fields=id,name,category,app_type,auth_method`, {
            headers: { Authorization: `Bearer ${TOKEN}` }
        });
        console.log('APP_DETAILS:', JSON.stringify(res.data, null, 2));

    } catch (e) {
        console.log('ERROR:', JSON.stringify(e.response?.data || e.message, null, 2));
    }
}

checkApp();
