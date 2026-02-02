const axios = require('axios');

const token = "EAAWrk67ZChXIBQbhM5ZC1y6am9iIA45tg46na4wWHT5xzXzAZCifMlCBuPveZBcAfoaynQdJ4t9S4bYFoRT9TsXREvST3SaEjPinlOh7TyP4mrj0iJThZBnZAQZCZBNVFMdoXoP1lt0ZC2Gv5zbCH2cvkZB8amU7IvZB0LLpfMM9FFixPMwXXiLLoXON6IMepT8";

async function check() {
    try {
        console.log("Checking token...");
        const res = await axios.get(`https://graph.facebook.com/v19.0/me?access_token=${token}`);
        console.log("Token Valid:", res.data);

        // Get Businesses
        console.log("Fetching Businesses...");
        try {
            const res2 = await axios.get(`https://graph.facebook.com/v19.0/me/accounts?access_token=${token}`);
            console.log("Accounts:", JSON.stringify(res2.data, null, 2));

            // If manual check needed, try to see if we can access the WABA directly
            const wabaIdToTest = '373024889230558'; // From your previous screenshot or logs if available
            await checkWaba(wabaIdToTest);

        } catch (e) {
            console.log("Failed to fetch businesses:", e.response?.data || e.message);
        }

    } catch (e) {
        console.error("Error:", e.response ? e.response.data : e.message);
    }
}

async function checkWaba(wabaId) {
    console.log(`Checking Phone Numbers for WABA ${wabaId}...`);
    try {
        const res4 = await axios.get(`https://graph.facebook.com/v19.0/${wabaId}/phone_numbers?access_token=${token}`);
        console.log("Phone Numbers:", JSON.stringify(res4.data, null, 2));

        if (res4.data.data && res4.data.data.length > 0) {
            const numId = res4.data.data[0].id; // Just check the first one
            console.log(`Checking Status for Phone ID ${numId}...`);

            try {
                const res5 = await axios.get(`https://graph.facebook.com/v19.0/${numId}?fields=verified_name,code_verification_status,quality_rating,name_status,status&access_token=${token}`);
                console.log("Status:", res5.data);
            } catch (err) {
                console.error("Status Check Failed:", err.response ? err.response.data : err.message);
            }
        }
    } catch (e) {
        console.log("Failed to fetch phone numbers:", e.response?.data || e.message);
    }
}

check();
