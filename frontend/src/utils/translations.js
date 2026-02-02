// Language translations
export const translations = {
    en: {
        dashboard: "Dashboard",
        inbox: "Inbox",
        contacts: "Contacts",
        flows: "Flows",
        campaigns: "Campaigns",
        reports: "Reports",
        templates: "Templates",
        team: "Team",
        wallet: "Wallet",
        profile: "Profile",
        logout: "Logout",
        search: "Search",
        filter: "Filter",
        all: "All",
        active: "Active",
        inactive: "Inactive",
        save: "Save",
        cancel: "Cancel",
        delete: "Delete",
        edit: "Edit",
        create: "Create",
        send: "Send",
        // Messages
        welcome: "Welcome to WhatsApp CRM",
        loading: "Loading...",
        noData: "No data available",
        success: "Success!",
        error: "Error occurred",
        // Features
        aiSmartReply: "AI Smart Reply",
        googleSheetsImport: "Import from Google Sheets",
        bulkUpload: "Bulk Upload",
        automation: "Automation",
        analytics: "Analytics"
    },
    hi: {
        dashboard: "डैशबोर्ड",
        inbox: "इनबॉक्स",
        contacts: "संपर्क",
        flows: "फ्लो",
        campaigns: "कैंपेन",
        reports: "रिपोर्ट",
        templates: "टेम्पलेट",
        team: "टीम",
        wallet: "वॉलेट",
        profile: "प्रोफाइल",
        logout: "लॉगआउट",
        search: "खोजें",
        filter: "फ़िल्टर",
        all: "सभी",
        active: "सक्रिय",
        inactive: "निष्क्रिय",
        save: "सेव करें",
        cancel: "रद्द करें",
        delete: "डिलीट करें",
        edit: "एडिट करें",
        create: "बनाएं",
        send: "भेजें",
        // Messages
        welcome: "WhatsApp CRM में आपका स्वागत है",
        loading: "लोड हो रहा है...",
        noData: "कोई डेटा उपलब्ध नहीं",
        success: "सफल!",
        error: "त्रुटि हुई",
        // Features
        aiSmartReply: "AI स्मार्ट रिप्लाई",
        googleSheetsImport: "Google Sheets से इम्पोर्ट करें",
        bulkUpload: "बल्क अपलोड",
        automation: "ऑटोमेशन",
        analytics: "एनालिटिक्स"
    }
};

export const getTranslation = (key, lang = 'en') => {
    return translations[lang]?.[key] || translations.en[key] || key;
};
