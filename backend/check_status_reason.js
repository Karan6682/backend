const axios = require('axios');
const fs = require('fs');

// Try to read token
let token = '';
try {
    token = fs.readFileSync('token.txt', 'utf8').trim();
} catch (e) {
    // If file missing, use the one from previous context for safety, though it might be old. 
    // Best effort.
    console.log("Token file missing, using manual token");
    token = "EAAL..."; // I will avoid hardcoding the huge string here to keep it clean, relying on read if possible.
}

// User's Phone Number ID (from previous screenshot/logs if possible, or we search)
// From screenshot: WABA ID: 13712188... 
// We need PhoneNumberID. 
// I'll reuse the discovery logic quickly.

async function checkStatus() {
    try {
        console.log("Using Token:", token.substring(0, 10) + "...");

        // 1. Get WABA and Phone Numbers
        console.log("Fetching Phone Numbers...");
        let wabaId = null;

        // Try Method 1: client_whatsapp_business_accounts
        try {
            const clientRes = await axios.get(
                `https://graph.facebook.com/v19.0/me/client_whatsapp_business_accounts`,
                { params: { access_token: token } }
            );
            if (clientRes.data.data && clientRes.data.data.length > 0) {
                wabaId = clientRes.data.data[0].id;
            }
        } catch (e) {
            console.log("Method 1 failed, trying fallback...");
        }

        // Method 2: Debug Token
        if (!wabaId) {
            const appId = '1596025668076914';
            const appSecret = 'b47ef916c821344dff83c3ed82f3c881';
            const debugRes = await axios.get(`https://graph.facebook.com/debug_token`, {
                params: { input_token: token, access_token: `${appId}|${appSecret}` }
            });
            const scopes = debugRes.data.data.granular_scopes || [];
            const wabaScope = scopes.find(s => s.scope === 'whatsapp_business_management');
            if (wabaScope && wabaScope.target_ids) {
                wabaId = wabaScope.target_ids[0];
            }
        }

        if (!wabaId) {
            // Hardcode from user screenshot logic if everything else fails
            wabaId = '373024889230558';
            console.log("Using Hardcoded/Fallback WABA ID");
        }

        console.log(`Checking WABA: ${wabaId}`);

        const numRes = await axios.get(`https://graph.facebook.com/v19.0/${wabaId}/phone_numbers`, {
            params: { access_token: token }
        });

        const numbers = numRes.data.data;
        console.log(`Found ${numbers.length} numbers.`);

        for (const num of numbers) {
            console.log(`\n--- Checking Number: ${num.display_phone_number} (ID: ${num.id}) ---`);
            // Check Status
            try {
                const statusRes = await axios.get(`https://graph.facebook.com/v19.0/${num.id}`, {
                    params: {
                        fields: 'verified_name,code_verification_status,quality_rating,name_status,status',
                        access_token: token
                    }
                });
                console.log("STATUS:", JSON.stringify(statusRes.data, null, 2));
            } catch (e) {
                console.log("Status Check Failed:", e.message);
            }
        }

    } catch (e) {
        console.error("Error:", e.response?.data || e.message);
    }
}

checkStatus();
