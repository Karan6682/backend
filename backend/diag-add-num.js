const axios = require('axios');

const wabaId = '1810299923005208';
const accessToken = 'EAAWrk67ZChXIBQbhM5ZC1y6am9iIA45tg46na4wWHT5xzXzAZCifMlCBuPveZBcAfoaynQdJ4t9S4bYFoRT9TsXREvST3SaEjPinlOh7TyP4mrj0iJJThZBnZAQZCZBNVFMdoXoP1lt0ZC2Gv5zbCH2cvkZB8amU7IvZB0LLpfMM9FFixPMwXXiLLoXON6IMepT8';
const API_VERSION = 'v19.0';

async function diagnose() {
    console.log("Checking current numbers...");
    try {
        const res = await axios.get(`https://graph.facebook.com/${API_VERSION}/${wabaId}/phone_numbers`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        console.log("Current Numbers:", JSON.stringify(res.data, null, 2));

        console.log("\nAttempting to add 91 8168625627...");
        try {
            const addRes = await axios.post(`https://graph.facebook.com/${API_VERSION}/${wabaId}/phone_numbers`, {
                cc: '91',
                phone_number: '8168625627'
            }, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            console.log("Add Success!", addRes.data);
        } catch (err) {
            console.log("Add Failed!");
            console.log("Status:", err.response?.status);
            console.log("Error Data:", JSON.stringify(err.response?.data, null, 2));
        }
    } catch (err) {
        console.error("Diagnosis failed:", err.response?.data || err.message);
    }
}

diagnose();
