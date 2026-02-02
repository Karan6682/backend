const axios = require("axios");

const API_VERSION = process.env.META_API_VERSION || "v19.0";

/**
 * Send a template message using Meta Cloud API
 */
exports.sendTemplateMessage = async (phoneNumberId, accessToken, to, templateName, components = []) => {
    try {
        const response = await axios.post(
            `https://graph.facebook.com/${API_VERSION}/${phoneNumberId}/messages`,
            {
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: to,
                type: "template",
                template: {
                    name: templateName,
                    language: { code: "en_US" },
                    ...(components.length > 0 && { components })
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json"
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error("Meta Send Error:", error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

/**
 * Send a media message (Image/Document)
 */
exports.sendMediaMessage = async (phoneNumberId, accessToken, to, type, link, caption) => {
    try {
        const data = {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: to,
            type: type,
            [type]: { link, caption }
        };

        const response = await axios.post(
            `https://graph.facebook.com/${API_VERSION}/${phoneNumberId}/messages`,
            data,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json"
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error("Meta Media Send Error:", error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

/**
 * Fetch Message Templates from Meta
 */
exports.getTemplates = async (wabaId, accessToken) => {
    try {
        const response = await axios.get(
            `https://graph.facebook.com/${API_VERSION}/${wabaId}/message_templates`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error("Meta Get Templates Error:", error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

/**
 * Create a new message template on Meta
 */
exports.createTemplate = async (wabaId, accessToken, templateData) => {
    try {
        const response = await axios.post(
            `https://graph.facebook.com/${API_VERSION}/${wabaId}/message_templates`,
            templateData,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json"
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error("Meta Create Template Error:", error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

/**
 * Delete a message template on Meta
 */
exports.deleteTemplate = async (wabaId, accessToken, templateName) => {
    try {
        const response = await axios.delete(
            `https://graph.facebook.com/${API_VERSION}/${wabaId}/message_templates`,
            {
                params: { name: templateName },
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error("Meta Delete Template Error:", error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

/**
 * Exchange short-lived token for long-lived token (60 days)
 */
exports.exchangeToken = async (appId, appSecret, shortToken) => {
    try {
        const response = await axios.get(
            `https://graph.facebook.com/${API_VERSION}/oauth/access_token`,
            {
                params: {
                    grant_type: 'fb_exchange_token',
                    client_id: appId,
                    client_secret: appSecret,
                    fb_exchange_token: shortToken
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error("Token Exchange Error:", error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

/**
 * Send a simple text message (Free-form within 24h window)
 */
exports.sendTextMessage = async (phoneNumberId, accessToken, to, text) => {
    try {
        const response = await axios.post(
            `https://graph.facebook.com/${API_VERSION}/${phoneNumberId}/messages`,
            {
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: to,
                type: "text",
                text: { body: text }
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json"
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error("Meta Text Send Error:", error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

/**
 * Fetch WABA Accounts associated with the token (Comprehensive Discovery)
 */
exports.getWabaAccounts = async (accessToken, appId, appSecret) => {
    try {
        console.log("Starting WABA Discovery...");

        // Strategy 1: me/client_whatsapp_business_accounts (Most common for System Users)
        try {
            console.log("Attempting Strategy 1: me/client_whatsapp_business_accounts");
            const res = await axios.get(
                `https://graph.facebook.com/${API_VERSION}/me/client_whatsapp_business_accounts`,
                { params: { access_token: accessToken } }
            );
            if (res.data.data && res.data.data.length > 0) {
                console.log("Strategy 1 SUCCESS");
                return res.data;
            }
        } catch (e) {
            console.log("Strategy 1 failed:", e.response?.data?.error?.message || e.message);
        }

        // Strategy 2: me/whatsapp_business_accounts (Common for Standard/User tokens)
        try {
            console.log("Attempting Strategy 2: me/whatsapp_business_accounts");
            const res = await axios.get(
                `https://graph.facebook.com/${API_VERSION}/me/whatsapp_business_accounts`,
                { params: { access_token: accessToken } }
            );
            if (res.data.data && res.data.data.length > 0) {
                console.log("Strategy 2 SUCCESS");
                return res.data;
            }
        } catch (e) {
            console.log("Strategy 2 failed:", e.response?.data?.error?.message || e.message);
        }

        // Strategy 3: debug_token (Fall back to inspection if direct endpoints failed)
        // We try both self-inspection and app-level inspection
        try {
            console.log("Attempting Strategy 3: debug_token (Self-inspection)");
            const inspectRes = await axios.get(
                `https://graph.facebook.com/debug_token`,
                {
                    params: {
                        input_token: accessToken,
                        access_token: accessToken
                    }
                }
            );

            const data = inspectRes.data.data;
            const wabaScope = data.granular_scopes?.find(s => s.scope === 'whatsapp_business_management');
            if (wabaScope && wabaScope.target_ids && wabaScope.target_ids.length > 0) {
                console.log("Strategy 3 SUCCESS");
                return {
                    data: wabaScope.target_ids.map(id => ({ id, name: "WhatsApp Business Account" }))
                };
            }
        } catch (e) {
            console.log("Strategy 3 failed:", e.response?.data?.error?.message || e.message);
        }

        // Strategy 4: debug_token (App-level inspection using App IDs)
        if (appId && appSecret) {
            try {
                console.log("Attempting Strategy 4: debug_token (App-level)");
                const inspectRes = await axios.get(
                    `https://graph.facebook.com/debug_token`,
                    {
                        params: {
                            input_token: accessToken,
                            access_token: `${appId}|${appSecret}`
                        }
                    }
                );

                const data = inspectRes.data.data;
                const wabaScope = data.granular_scopes?.find(s => s.scope === 'whatsapp_business_management');
                if (wabaScope && wabaScope.target_ids && wabaScope.target_ids.length > 0) {
                    console.log("Strategy 4 SUCCESS");
                    return {
                        data: wabaScope.target_ids.map(id => ({ id, name: "WhatsApp Business Account" }))
                    };
                }
            } catch (e) {
                console.log("Strategy 4 failed:", e.response?.data?.error?.message || e.message);
            }
        }

        // Strategy 5: Hardcoded Fallback (Reliable for specific setups)
        console.log("Attempting Strategy 5: known WABA IDs");
        const fallbackIds = ['1804775563567759', '157876370731618', '749082614915775'];
        let foundWABAs = [];

        for (const id of fallbackIds) {
            try {
                // Verify if this token can at least see this WABA
                const checkRes = await axios.get(
                    `https://graph.facebook.com/${API_VERSION}/${id}`,
                    { params: { access_token: accessToken, fields: 'id,name' } }
                );
                if (checkRes.data && checkRes.data.id) {
                    foundWABAs.push({ id: checkRes.data.id, name: checkRes.data.name || "WhatsApp Business Account" });
                }
            } catch (e) {
                // Silently skip if not accessible
            }
        }

        if (foundWABAs.length > 0) {
            console.log("Strategy 5 SUCCESS");
            return { data: foundWABAs };
        }

        throw new Error("No WhatsApp Accounts found. Even though your token is valid, it looks like no WhatsApp accounts are assigned to this System User in Meta Business Settings. Please go to 'WhatsApp Accounts' -> 'Add People' and assign this user.");

    } catch (error) {
        console.error("WABA Discovery Error:", error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

/**
 * Fetch all phone numbers associated with a WABA ID
 */
exports.getPhoneNumbers = async (wabaId, accessToken) => {
    try {
        const response = await axios.get(
            `https://graph.facebook.com/${API_VERSION}/${wabaId}/phone_numbers`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error("Fetch Phone Numbers Error:", error.response?.data || error.message);
        throw error.response?.data || error;
    }
};
/**
 * Request OTP Code for a phone number
 */
exports.requestCode = async (phoneNumberId, accessToken, method = 'SMS') => {
    try {
        const response = await axios.post(
            `https://graph.facebook.com/${API_VERSION}/${phoneNumberId}/request_code`,
            {
                code_method: method,
                language: 'en'
            },
            {
                headers: { Authorization: `Bearer ${accessToken}` }
            }
        );
        return response.data;
    } catch (error) {
        console.error("Request OTP Error:", error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

/**
 * Verify OTP Code
 */
exports.verifyCode = async (phoneNumberId, accessToken, code) => {
    try {
        const response = await axios.post(
            `https://graph.facebook.com/${API_VERSION}/${phoneNumberId}/verify_code`,
            { code },
            {
                headers: { Authorization: `Bearer ${accessToken}` }
            }
        );
        return response.data;
    } catch (error) {
        console.error("Verify OTP Error:", error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

/**
 * Add a new phone number to WABA
 */
exports.addPhoneNumber = async (wabaId, accessToken, cc, phoneNumber, verifiedName = 'CloudCRM Business') => {
    try {
        const response = await axios.post(
            `https://graph.facebook.com/${API_VERSION}/${wabaId}/phone_numbers`,
            {
                cc: cc,
                phone_number: phoneNumber,
                verified_name: verifiedName
            },
            {
                headers: { Authorization: `Bearer ${accessToken}` }
            }
        );
        return response.data;
    } catch (error) {
        console.error("Add Number Error:", error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

/**
 * Delete a phone number from WABA
 */
exports.deletePhoneNumber = async (phoneNumberId, accessToken) => {
    try {
        const response = await axios.delete(
            `https://graph.facebook.com/${API_VERSION}/${phoneNumberId}`,
            {
                headers: { Authorization: `Bearer ${accessToken}` }
            }
        );
        return response.data;
    } catch (error) {
        console.error("Delete Number Error:", error.response?.data || error.message);
        throw error.response?.data || error;
    }
};
/**
 * Final registration of a phone number (Required to send messages after OTP)
 */
exports.registerNumber = async (phoneNumberId, accessToken) => {
    try {
        const response = await axios.post(
            `https://graph.facebook.com/${API_VERSION}/${phoneNumberId}/register`,
            { messaging_product: 'whatsapp', pin: '000000' }, // Standard registration
            {
                headers: { Authorization: `Bearer ${accessToken}` }
            }
        );
        return response.data;
    } catch (error) {
        console.error("Number Registration Error:", error.response?.data || error.message);
        throw error.response?.data || error;
    }
};
/**
 * Fetch detailed WABA account health/status
 */
exports.getAccountHealth = async (wabaId, accessToken) => {
    try {
        const response = await axios.get(
            `https://graph.facebook.com/${API_VERSION}/${wabaId}`,
            {
                params: {
                    fields: 'id,name,account_review_status,business_verification_status,currency,timezone_id'
                },
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error("Meta Get Health Error:", error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

/**
 * Update WhatsApp Business Profile
 */
exports.updateBusinessProfile = async (phoneNumberId, accessToken, profileData) => {
    try {
        const response = await axios.post(
            `https://graph.facebook.com/${API_VERSION}/${phoneNumberId}/whatsapp_business_profile`,
            {
                messaging_product: "whatsapp",
                ...profileData
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json"
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error("Update Profile Error:", error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

/**
 * Get WhatsApp Business Profile
 */
exports.getBusinessProfile = async (phoneNumberId, accessToken) => {
    try {
        const response = await axios.get(
            `https://graph.facebook.com/${API_VERSION}/${phoneNumberId}/whatsapp_business_profile`,
            {
                params: {
                    fields: 'about,address,description,email,profile_picture_url,websites,vertical',
                    access_token: accessToken
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error("Get Profile Error:", error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

/**
 * Get Messaging Analytics
 */
exports.getMessagingAnalytics = async (wabaId, accessToken, start, end, granularity = 'DAY') => {
    try {
        const response = await axios.get(
            `https://graph.facebook.com/${API_VERSION}/${wabaId}`,
            {
                params: {
                    fields: `analytics.start(${start}).end(${end}).granularity(${granularity})`,
                    access_token: accessToken
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error("Get Analytics Error:", error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

/**
 * Set Two-Step Verification PIN
 */
exports.setTwoStepVerification = async (phoneNumberId, accessToken, pin) => {
    try {
        const response = await axios.post(
            `https://graph.facebook.com/${API_VERSION}/${phoneNumberId}`,
            { pin },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json"
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error("Set 2FA PIN Error:", error.response?.data || error.message);
        throw error.response?.data || error;
    }
};
