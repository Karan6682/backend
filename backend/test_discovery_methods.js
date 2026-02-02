const axios = require('axios');
const fs = require('fs');

// Read token from file if possible, or use the one we know
const token = fs.readFileSync('token.txt', 'utf8').trim();

const appId = '1596025668076914';
const appSecret = 'b47ef916c821344dff83c3ed82f3c881';

async function testMethods() {
    console.log("Token:", token.substring(0, 10) + "...");

    // Method 1: debug_token (Current Backend Logic)
    console.log("\n--- Method 1: debug_token ---");
    try {
        const res = await axios.get(`https://graph.facebook.com/debug_token`, {
            params: {
                input_token: token,
                access_token: `${appId}|${appSecret}`
            }
        });
        console.log("Full Debug Res:", JSON.stringify(res.data, null, 2));
        console.log("SUCCESS. Granular Scopes:", JSON.stringify(res.data.data.granular_scopes, null, 2));
        if (res.data.data.scopes) {
            console.log("All Scopes:", res.data.data.scopes);
        }
        if (res.data.data.granular_scopes) {
            const wabaScope = res.data.data.granular_scopes.find(s => s.scope === 'whatsapp_business_management');
            console.log("Target IDs:", wabaScope ? wabaScope.target_ids : "Scope not found");

            if (wabaScope && wabaScope.target_ids && wabaScope.target_ids.length > 0) {
                // Hardcode force to see if this ID works
                const wabaId = wabaScope.target_ids[0];
                // Or try the one from logs: '373024889230558' if above is undefined
                console.log(`\n--- Inspecting WABA: ${wabaId} ---`);
                try {
                    const numRes = await axios.get(`https://graph.facebook.com/v19.0/${wabaId}/phone_numbers`, {
                        params: { access_token: token }
                    });
                    console.log("Phone Numbers:", JSON.stringify(numRes.data, null, 2));
                } catch (e) {
                    console.log("Phone Number Fetch FAILED:", JSON.stringify(e.response?.data || e.message));
                }
            }
        }
    } catch (e) {
        console.log("FAILED:", JSON.stringify(e.response?.data || e.message));
    }

    // Method 2: client_whatsapp_business_accounts
    console.log("\n--- Method 2: client_whatsapp_business_accounts ---");
    try {
        const res = await axios.get(`https://graph.facebook.com/v19.0/me/client_whatsapp_business_accounts`, {
            params: { access_token: token }
        });
        console.log("SUCCESS. Data:", JSON.stringify(res.data, null, 2));
    } catch (e) {
        console.log("FAILED:", JSON.stringify(e.response?.data || e.message));
    }

    // Method 3: businesses
    console.log("\n--- Method 3: me/businesses ---");
    try {
        const res = await axios.get(`https://graph.facebook.com/v19.0/me/businesses`, {
            params: { access_token: token }
        });
        console.log("SUCCESS. Data:", JSON.stringify(res.data, null, 2));
    } catch (e) {
        console.log("FAILED:", JSON.stringify(e.response?.data || e.message));
    }
}

testMethods();
