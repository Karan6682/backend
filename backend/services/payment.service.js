const axios = require('axios');

/**
 * Payment Service - Handles integration with the Automated UPI Gateway.
 * Note: To go live, the user needs to provide their API Key from a provider like upigateway.com or similar.
 */
class PaymentService {
    constructor() {
        // These would normally come from your Admin Settings in DB
        this.apiKey = process.env.UPI_GATEWAY_KEY || "YOUR_GATEWAY_KEY";
    }

    /**
     * Step 1: Create a payment order with a unique tracking ID
     */
    async createOrder(amount, userId, userName) {
        try {
            // In a real scenario, you'd call the Gateway API here.
            // For now, we generate a unique tracking ID that helps our backend recognize the payment.
            const orderId = `ORD_${Date.now()}_${userId.toString().slice(-4)}`;

            // We return a specialized UPI string that the bank can track
            return {
                orderId,
                status: 'created'
            };
        } catch (error) {
            console.error("Order Creation Error:", error);
            throw error;
        }
    }

    /**
     * Step 2: Verify the payment (REAL API Check)
     */
    async verifyWithAggregator(orderId, amount) {
        try {
            // IF NO API KEY: Always return false (Safety first!)
            if (!this.apiKey || this.apiKey === "YOUR_GATEWAY_KEY") {
                console.log("⚠️ No UPI Gateway API Key found. Payment stays PENDING.");
                return false;
            }

            // REAL CALL (Example for upigateway.com or similar)
            /*
            const response = await axios.post(`https://upigateway.com/api/check-status`, {
                key: this.apiKey,
                client_txn_id: orderId
            });
            return response.data.status === 'success';
            */

            return false; // Default to fail if not configured
        } catch (error) {
            console.error("Aggregation Check Failed:", error);
            return false;
        }
    }
}

module.exports = new PaymentService();
