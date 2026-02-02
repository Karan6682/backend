# 🚀 WhatsApp Cloud CRM - Enterprise Edition

> **The Most Advanced Open-Source WhatsApp Business CRM with AI Integration**

[![Production Ready](https://img.shields.io/badge/Status-Production%20Ready-success)]()
[![AI Powered](https://img.shields.io/badge/AI-Gemini%20Powered-blue)]()
[![Open Source](https://img.shields.io/badge/License-Open%20Source-green)]()

---

## 🌟 **What Makes This Special?**

This isn't just another WhatsApp CRM. It's a **complete business automation platform** that rivals (and beats) paid solutions like Wati, Interakt, and AiSensy.

### **Key Differentiators:**
- 🤖 **AI-Powered** - Gemini AI integration for smart replies
- 🆓 **100% Free** - No monthly fees, no limits
- 🎨 **Premium UI** - Glassmorphism design
- 🌐 **Multi-Language** - English & Hindi (more coming)
- 📊 **Google Sheets** - Direct import (usually a paid feature)
- ⚡ **Real-time** - Socket.IO for instant updates

---

## ✨ **Features**

### **Core Capabilities**
- ✅ WhatsApp Cloud API Integration (Official Meta API)
- ✅ Real-time Chat with AI Smart Replies
- ✅ Customer Segmentation & Tags
- ✅ Visual Automation Builder
- ✅ Bulk Campaign Management
- ✅ Advanced Analytics & Reports
- ✅ Team Management
- ✅ Click-to-Call Integration
- ✅ Multi-Language Support
- ✅ Google Sheets Integration

### **Advanced Features**
- ✅ AI-Powered Smart Replies (Gemini)
- ✅ Keyword-Based Automation
- ✅ Visual Chatbot Builder
- ✅ Excel/CSV Bulk Upload
- ✅ Real-time Delivery Tracking
- ✅ Chart.js Analytics
- ✅ Wallet & Billing System
- ✅ External API for Integrations

[📄 See Complete Feature List](./FEATURES_COMPLETE.md)

---

## 🎯 **Perfect For**

- 📱 **E-commerce Stores** - Automated order updates
- 🏪 **Retail Businesses** - Customer engagement
- 💼 **Marketing Agencies** - Client campaigns
- 🎓 **Educational Institutes** - Student communication
- 🏥 **Healthcare** - Appointment reminders
- 🍕 **Restaurants** - Order notifications

---

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 16+
- MongoDB
- Meta Business Account
- Google Gemini API Key (free)

### **Installation**

```bash
# Clone repository
git clone https://github.com/yourusername/whatsapp-crm.git
cd whatsapp-crm

# Backend Setup
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm start

# Frontend Setup (new terminal)
cd frontend
npm install
npm run dev
```

### **Environment Variables**

```env
# Backend (.env)
MONGODB_URI=mongodb://localhost:27017/whatsapp-crm
JWT_SECRET=your_super_secret_key_here
PORT=5000

# Meta WhatsApp
META_APP_ID=your_app_id
META_APP_SECRET=your_app_secret

# AI Integration
GEMINI_API_KEY=your_gemini_api_key

# Webhook
WEBHOOK_VERIFY_TOKEN=your_webhook_token
```

---

## 📖 **Documentation**

- [📋 Complete Features List](./FEATURES_COMPLETE.md)
- [🎬 Demo Guide](./DEMO_GUIDE.md)
- [🔧 How to Get Meta Token](./HowToGetToken.md)

---

## 🎨 **Screenshots**

### Dashboard
![Dashboard](./screenshots/dashboard.png)

### Smart Inbox with AI
![Inbox](./screenshots/inbox.png)

### Customer Segmentation
![Contacts](./screenshots/contacts.png)

### Automation Builder
![Automation](./screenshots/automation.png)

---

## 🛠️ **Tech Stack**

### **Backend**
- Node.js + Express.js
- MongoDB (Mongoose)
- Socket.IO
- JWT Authentication
- Meta Graph API v19.0
- Google Gemini AI

### **Frontend**
- React.js 18
- React Router v6
- Axios
- Chart.js
- Lucide Icons
- Socket.IO Client

---

## 📊 **Comparison with Paid Tools**

| Feature | This CRM | Wati | Interakt | AiSensy |
|---------|:--------:|:----:|:--------:|:-------:|
| AI Smart Reply | ✅ | ❌ | ❌ | ❌ |
| Google Sheets | ✅ | 💰 | 💰 | 💰 |
| Visual Automation | ✅ | ✅ | ✅ | ✅ |
| Customer Tags | ✅ | ✅ | ✅ | ✅ |
| Team Management | ✅ | ✅ | ✅ | ✅ |
| Multi-Language | ✅ | ❌ | ❌ | ✅ |
| Click-to-Call | ✅ | 💰 | 💰 | 💰 |
| Open Source | ✅ | ❌ | ❌ | ❌ |
| **Monthly Cost** | **$0** | **$49** | **$79** | **$59** |

---

## 🎯 **Use Cases**

### **E-commerce**
```
1. Import customers from Google Sheets
2. Tag them as "Hot Lead", "VIP", etc.
3. Create automation: "PRICE" → Send catalog
4. Launch targeted campaigns
5. Track delivery in real-time
```

### **Customer Support**
```
1. Receive customer messages
2. AI suggests smart reply
3. Send with one click
4. Tag as "Resolved"
5. Track in analytics
```

---

## 🔧 **Configuration**

### **Meta WhatsApp Setup**
1. Create Meta Business Account
2. Create App in Meta Developers
3. Add WhatsApp Product
4. Get Access Token
5. Configure Webhook

[Detailed Guide](./HowToGetToken.md)

### **Gemini AI Setup**
1. Go to [Google AI Studio](https://makersuite.google.com/)
2. Create API Key (Free)
3. Add to `.env`

---

## 🌐 **Multi-Language**

Currently Supported:
- 🇬🇧 English
- 🇮🇳 Hindi (हिंदी)

Easy to add more languages - just edit `translations.js`!

---

## 🤝 **Contributing**

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 **License**

This project is open source and available under the [MIT License](LICENSE).

---

## 🙏 **Acknowledgments**

- Meta for WhatsApp Cloud API
- Google for Gemini AI
- All open-source contributors

---

## 📞 **Support**

- 📧 Email: support@starnext.tech
- 💬 WhatsApp: [Contact Us](https://wa.me/your_number)
- 🌐 Website: [www.starnext.tech](https://starnext.tech)

---

## 🚀 **Roadmap**

### Coming Soon:
- [ ] Payment Gateway Integration (Razorpay)
- [ ] Advanced Drag-Drop Chatbot Builder
- [ ] Mobile App (React Native)
- [ ] Zapier Integration
- [ ] Voice Message Transcription
- [ ] Image OCR
- [ ] More Languages (Tamil, Telugu, etc.)

---

## ⭐ **Star This Repo**

If you find this project useful, please consider giving it a star! It helps others discover it.

---

**Built with ❤️ by STARNEXT TECHNOLOGIES**

*Making Enterprise Software Accessible to Everyone*

---

## 📈 **Stats**

- 15+ Core Features
- 15 Main Pages
- 60+ API Endpoints
- 2 Languages
- 100% Production Ready

---

**Version:** 2.0  
**Status:** Production Ready 🚀  
**Last Updated:** January 28, 2026
