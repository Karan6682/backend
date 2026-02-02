const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyD_TEST_KEY");

/**
 * Get AI Suggested Reply for a message
 */
exports.getAISuggestion = async (messageText, context = []) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const history = context.map(msg => ({
            role: msg.direction === 'incoming' ? 'user' : 'model',
            parts: [{ text: msg.text }],
        }));

        const chat = model.startChat({
            history: history.slice(-10), // Send last 10 messages for context
            generationConfig: {
                maxOutputTokens: 200,
            },
        });

        const prompt = `Assistant: You are a helpful WhatsApp customer support agent. 
        Current Customer Message: "${messageText}"
        Provide a professional, concise, and helpful reply in the same language as the customer. 
        If it's a sales lead, be encouraging. If it's a complaint, be empathetic.`;

        const result = await chat.sendMessage(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini AI Error:", error.message);
        return "I'm sorry, I'm having trouble thinking of a reply right now. How can I help you?";
    }
};

/**
 * Analyze sentiment or categorize message
 */
exports.analyzeMessage = async (text) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = `Analyze this message: "${text}". Return only a JSON with: { "category": "sales|support|billing|other", "sentiment": "positive|neutral|negative", "urgency": "high|medium|low" }`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return JSON.parse(response.text().replace(/```json|```/g, ""));
    } catch (e) {
        return { category: "other", sentiment: "neutral", urgency: "medium" };
    }
};
