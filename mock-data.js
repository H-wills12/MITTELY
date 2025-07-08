// Mock data for development
const mockUIs = [
    {
        uiId: "ui-12345",
        title: "Creative Dashboard Kit",
        desc: "A modern dashboard UI kit with creative elements for your next project.",
        image: "https://via.placeholder.com/400x300/4a6bff/ffffff?text=Dashboard+UI",
        category: "dashboards",
        notes: "Includes light and dark mode variants. Fully responsive design.",
        price: {
            ghc: 150,
            usd: 25,
            usdt: 25,
            eth: 0.01,
            bnb: 0.05
        },
        verified: true
    },
    {
        uiId: "ui-12346",
        title: "E-commerce Product Page",
        desc: "Beautiful product page design for e-commerce websites.",
        image: "https://via.placeholder.com/400x300/ff6b6b/ffffff?text=E-commerce+UI",
        category: "ecommerce",
        notes: "Includes product gallery, variants selector, and checkout section.",
        price: {
            ghc: 120,
            usd: 20,
            usdt: 20,
            eth: 0.008,
            bnb: 0.04
        },
        verified: true
    },
    {
        uiId: "ui-12347",
        title: "Mobile App Onboarding",
        desc: "Clean onboarding screens for mobile applications.",
        image: "https://via.placeholder.com/400x300/6bffb4/ffffff?text=Mobile+UI",
        category: "mobile",
        notes: "Designed for iOS and Android. Includes 5 screens.",
        price: {
            ghc: 90,
            usd: 15,
            usdt: 15,
            eth: 0.006,
            bnb: 0.03
        },
        verified: true
    },
    {
        uiId: "ui-12348",
        title: "Landing Page Template",
        desc: "Conversion-focused landing page for SaaS products.",
        image: "https://via.placeholder.com/400x300/ffb46b/ffffff?text=Landing+Page",
        category: "landing",
        notes: "Includes hero section, features, testimonials, and CTA sections.",
        price: {
            ghc: 180,
            usd: 30,
            usdt: 30,
            eth: 0.012,
            bnb: 0.06
        },
        verified: false
    },
    {
        uiId: "ui-12349",
        title: "UI Component Library",
        desc: "Collection of reusable UI components for React projects.",
        image: "https://via.placeholder.com/400x300/b46bff/ffffff?text=Components",
        category: "components",
        notes: "Includes buttons, forms, modals, cards, and navigation components.",
        price: {
            ghc: 210,
            usd: 35,
            usdt: 35,
            eth: 0.014,
            bnb: 0.07
        },
        verified: true
    },
    {
        uiId: "ui-12350",
        title: "Analytics Dashboard",
        desc: "Data visualization dashboard with charts and metrics.",
        image: "https://via.placeholder.com/400x300/6bd5ff/ffffff?text=Analytics+Dash",
        category: "dashboards",
        notes: "Includes line, bar, and pie charts. Dark mode supported.",
        price: {
            ghc: 240,
            usd: 40,
            usdt: 40,
            eth: 0.016,
            bnb: 0.08
        },
        verified: true
    },
    {
        uiId: "ui-12351",
        title: "Shopping Cart Flow",
        desc: "Complete shopping cart and checkout flow for e-commerce.",
        image: "https://via.placeholder.com/400x300/ff6bd5/ffffff?text=Shopping+Cart",
        category: "ecommerce",
        notes: "Includes cart, shipping, payment, and confirmation screens.",
        price: {
            ghc: 150,
            usd: 25,
            usdt: 25,
            eth: 0.01,
            bnb: 0.05
        },
        verified: false
    },
    {
        uiId: "ui-12352",
        title: "Mobile Navigation Patterns",
        desc: "Collection of modern mobile navigation designs.",
        image: "https://via.placeholder.com/400x300/6bff6b/ffffff?text=Mobile+Nav",
        category: "mobile",
        notes: "Bottom nav, hamburger menus, tab bars, and more.",
        price: {
            ghc: 90,
            usd: 15,
            usdt: 15,
            eth: 0.006,
            bnb: 0.03
        },
        verified: true
    },
    {
        uiId: "ui-12353",
        title: "Portfolio Landing Page",
        desc: "Elegant portfolio page for designers and creatives.",
        image: "https://via.placeholder.com/400x300/ff6b6b/ffffff?text=Portfolio",
        category: "landing",
        notes: "Showcase your work with this clean and modern design.",
        price: {
            ghc: 120,
            usd: 20,
            usdt: 20,
            eth: 0.008,
            bnb: 0.04
        },
        verified: true
    },
    {
        uiId: "ui-12354",
        title: "Form Elements Pack",
        desc: "Collection of styled form elements and inputs.",
        image: "https://via.placeholder.com/400x300/6bffb4/ffffff?text=Form+Elements",
        category: "components",
        notes: "Text inputs, selects, checkboxes, radios, and more.",
        price: {
            ghc: 90,
            usd: 15,
            usdt: 15,
            eth: 0.006,
            bnb: 0.03
        },
        verified: true
    }
];

// Assign to global variable to be used in app.js
window.mockUIs = mockUIs;