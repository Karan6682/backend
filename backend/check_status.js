const axios = require('axios');

const TOKEN = 'EAAcM7XwZA28UBQhvO7ZBaq5WzEDHf8ZBy3XFRZBkBS27xhZA9ZBOer20CCYJlXBZCokIxzZBIRjnxbARVosqEMEZBVFElmZA3nT0jhYvdpMsVxwOZAZBJVcLKDrdDarb3IOZB4CSTSteG6v3W0oMqNGsL8ni72iKvkZCD1Y6opdEKZA3v7jyk03gp2biEFJUFIWp3g5zdZBRDwZDZD';
const PHONE_ID = '923009500898609';

async function checkPhone() {
    try {
        const res = await axios.get(`https://graph.facebook.com/v19.0/${PHONE_ID}?fields=status,quality_rating,name_status`, {
            headers: { Authorization: `Bearer ${TOKEN}` }
        });
        console.log('PHONE_DETAILS:', JSON.stringify(res.data, null, 2));

        const appRes = await axios.get(`https://graph.facebook.com/v19.0/1984538965826501?fields=id,name,status`, {
            headers: { Authorization: `Bearer ${TOKEN}` }
        });
        console.log('APP_DETAILS:', JSON.stringify(appRes.data, null, 2));

    } catch (e) {
        console.log('ERROR:', JSON.stringify(e.response?.data || e.message, null, 2));
    }
}

checkPhone();
