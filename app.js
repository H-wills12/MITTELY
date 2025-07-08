// Main Application Script
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Firebase
    initializeFirebase();
    
    // Initialize the application
    initApp();
});

// Firebase configuration (loaded from firebase-config.js)
let firebaseConfig = {};
let app, auth, db;

// Initialize Firebase
function initializeFirebase() {
    // Configuration is loaded from firebase-config.js
    app = firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
    
    // Enable offline persistence
    enableFirestoreOffline();
}

// Enable Firestore offline persistence
function enableFirestoreOffline() {
    db.enablePersistence()
        .catch((err) => {
            if (err.code === 'failed-precondition') {
                console.log("Offline persistence can only be enabled in one tab at a time.");
            } else if (err.code === 'unimplemented') {
                console.log("The current browser does not support offline persistence.");
            }
        });
}

// Application state
const state = {
    currentUser: null,
    currentPage: 'home',
    currentTab: 'purchased',
    categories: [],
    uis: [],
    cart: [],
    bookmarks: [],
    purchases: [],
    payments: [],
    users: [],
    isAdmin: false,
    theme: localStorage.getItem('theme') || 'light'
};

// Initialize the application
function initApp() {
    // Set theme
    setTheme(state.theme);
    
    // Set up event listeners
    setupEventListeners();
    
    // Load mock data if in development
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
        loadMockData();
    }
    
    // Load categories
    loadCategories();
    
    // Set up auth state listener
    setupAuthStateListener();
    
    // Start banner animation
    startBannerAnimation();
}

// Set up event listeners
function setupEventListeners() {
    // Theme toggle
    document.querySelector('.theme-toggle').addEventListener('click', toggleTheme);
    
    // Navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.target.getAttribute('data-page');
            navigateTo(page);
        });
    });
    
    // Dashboard tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tab = e.target.getAttribute('data-tab');
            switchTab(tab);
        });
    });
    
    // Auth button
    document.getElementById('auth-button').addEventListener('click', handleAuth);
    
    // Logout button
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    
    // Search input
    document.getElementById('search-input').addEventListener('input', handleSearch);
    
    // Cart icon
    document.querySelector('.cart-icon-container').addEventListener('click', () => {
        showCartModal();
    });
    
    // Save Telegram username
    document.getElementById('save-telegram').addEventListener('click', saveTelegramUsername);
    
    // UI upload form
    const uploadForm = document.getElementById('upload-ui-form');
    if (uploadForm) {
        uploadForm.addEventListener('submit', handleUIUpload);
    }
}

// Set up auth state listener
function setupAuthStateListener() {
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            // User is signed in
            state.currentUser = user;
            document.getElementById('auth-button').innerHTML = `
                <span class="material-icons">account_circle</span>
                <span>Logout</span>
            `;
            
            // Load user data from Firestore
            await loadUserData(user.uid);
            
            // Check if user is admin
            await checkAdminStatus(user.uid);
            
            // Update UI based on auth state
            updateAuthUI();
            
            // Show Telegram username modal if not set
            if (!state.userData?.telegramUsername) {
                showTelegramModal();
            }
        } else {
            // User is signed out
            state.currentUser = null;
            state.userData = null;
            state.isAdmin = false;
            document.getElementById('auth-button').innerHTML = `
                <span class="material-icons">account_circle</span>
                <span>Login</span>
            `;
            
            // Update UI based on auth state
            updateAuthUI();
        }
    });
}

// Load user data from Firestore
async function loadUserData(uid) {
    try {
        const userDoc = await db.collection('Users').doc(uid).get();
        if (userDoc.exists) {
            state.userData = userDoc.data();
            
            // Load user-specific data
            await Promise.all([
                loadUserCart(uid),
                loadUserBookmarks(uid),
                loadUserPurchases(uid),
                loadUserPayments(uid)
            ]);
            
            // Update UI
            updateProfileUI();
            updateCartCount();
        } else {
            // Create new user document
            await db.collection('Users').doc(uid).set({
                uid: uid,
                name: state.currentUser.displayName,
                email: state.currentUser.email,
                telegramUsername: '',
                bookmarks: [],
                cart: [],
                purchases: [],
                verified: false
            });
            
            state.userData = {
                uid: uid,
                name: state.currentUser.displayName,
                email: state.currentUser.email,
                telegramUsername: '',
                bookmarks: [],
                cart: [],
                purchases: [],
                verified: false
            };
        }
    } catch (error) {
        console.error("Error loading user data:", error);
        showError("Failed to load user data. Please try again.");
    }
}

// Load user cart
async function loadUserCart(uid) {
    try {
        const userDoc = await db.collection('Users').doc(uid).get();
        if (userDoc.exists) {
            state.cart = userDoc.data().cart || [];
        }
    } catch (error) {
        console.error("Error loading user cart:", error);
    }
}

// Load user bookmarks
async function loadUserBookmarks(uid) {
    try {
        const userDoc = await db.collection('Users').doc(uid).get();
        if (userDoc.exists) {
            state.bookmarks = userDoc.data().bookmarks || [];
        }
    } catch (error) {
        console.error("Error loading user bookmarks:", error);
    }
}

// Load user purchases
async function loadUserPurchases(uid) {
    try {
        const userDoc = await db.collection('Users').doc(uid).get();
        if (userDoc.exists) {
            state.purchases = userDoc.data().purchases || [];
        }
    } catch (error) {
        console.error("Error loading user purchases:", error);
    }
}

// Load user payments
async function loadUserPayments(uid) {
    try {
        const paymentsSnapshot = await db.collection('Payments')
            .where('userId', '==', uid)
            .orderBy('timestamp', 'desc')
            .get();
            
        state.payments = paymentsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error loading user payments:", error);
    }
}

// Check if user is admin
async function checkAdminStatus(uid) {
    try {
        const adminDoc = await db.collection('Admins').doc(uid).get();
        state.isAdmin = adminDoc.exists;
        
        // Show/hide admin link
        document.getElementById('admin-link').style.display = state.isAdmin ? 'block' : 'none';
    } catch (error) {
        console.error("Error checking admin status:", error);
        state.isAdmin = false;
    }
}

// Update UI based on auth state
function updateAuthUI() {
    // Show/hide profile and dashboard links
    const authLinks = document.querySelectorAll('.nav-link[data-page="profile"], .nav-link[data-page="dashboard"]');
    authLinks.forEach(link => {
        link.style.display = state.currentUser ? 'block' : 'none';
    });
    
    // Update profile page if active
    if (state.currentPage === 'profile') {
        updateProfileUI();
    }
    
    // Update dashboard if active
    if (state.currentPage === 'dashboard') {
        updateDashboardUI();
    }
}

// Update profile UI
function updateProfileUI() {
    if (state.currentPage !== 'profile') return;
    
    if (state.currentUser && state.userData) {
        document.getElementById('profile-name').textContent = state.userData.name || state.currentUser.displayName;
        document.getElementById('profile-email').textContent = state.userData.email || state.currentUser.email;
        document.getElementById('profile-uid').textContent = state.currentUser.uid;
        document.getElementById('profile-telegram').textContent = state.userData.telegramUsername || 'Not set';
        document.getElementById('profile-verified').textContent = state.userData.verified ? 'Yes' : 'No';
    }
}

// Update dashboard UI
function updateDashboardUI() {
    if (state.currentPage !== 'dashboard') return;
    
    // Purchased UIs
    const purchasedContainer = document.querySelector('#purchased-tab .purchased-items');
    if (purchasedContainer) {
        purchasedContainer.innerHTML = state.purchases.length > 0 
            ? state.purchases.map(uiId => {
                const ui = state.uis.find(u => u.uiId === uiId);
                if (!ui) return '';
                return `
                    <div class="ui-card">
                        <img src="${ui.image}" alt="${ui.title}" class="ui-card-image">
                        <div class="ui-card-content">
                            <h3 class="ui-card-title">${ui.title}</h3>
                            <p class="ui-card-desc">${ui.desc}</p>
                            <div class="ui-card-footer">
                                <span class="ui-card-price">$${ui.price.usd}</span>
                                <button class="detail-btn btn-primary" data-ui="${ui.uiId}">
                                    <span class="material-icons">download</span>
                                    Download
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('')
            : '<p>No purchased UIs yet.</p>';
        
        // Add event listeners to download buttons
        document.querySelectorAll('#purchased-tab .detail-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const uiId = e.target.closest('button').getAttribute('data-ui');
                downloadUI(uiId);
            });
        });
    }
    
    // Bookmarks
    const bookmarksContainer = document.querySelector('#bookmarks-tab .bookmarked-items');
    if (bookmarksContainer) {
        bookmarksContainer.innerHTML = state.bookmarks.length > 0 
            ? state.bookmarks.map(uiId => {
                const ui = state.uis.find(u => u.uiId === uiId);
                if (!ui) return '';
                return `
                    <div class="ui-card">
                        <img src="${ui.image}" alt="${ui.title}" class="ui-card-image">
                        <div class="ui-card-content">
                            <h3 class="ui-card-title">${ui.title}</h3>
                            <p class="ui-card-desc">${ui.desc}</p>
                            <div class="ui-card-footer">
                                <span class="ui-card-price">$${ui.price.usd}</span>
                                <div class="ui-card-actions">
                                    <span class="material-icons bookmark-icon ${state.bookmarks.includes(ui.uiId) ? 'active' : ''}" 
                                          data-ui="${ui.uiId}">bookmark</span>
                                    <button class="detail-btn btn-secondary" data-ui="${ui.uiId}">
                                        View
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('')
            : '<p>No bookmarked UIs yet.</p>';
        
        // Add event listeners
        addUICardEventListeners(bookmarksContainer);
    }
    
    // Payments
    const paymentsContainer = document.querySelector('#payments-tab .payment-status');
    if (paymentsContainer) {
        paymentsContainer.innerHTML = state.payments.length > 0 
            ? state.payments.map(payment => {
                const ui = state.uis.find(u => u.uiId === payment.uiId);
                return `
                    <div class="payment-item">
                        <div class="payment-info">
                            <h4 class="payment-title">${ui?.title || payment.uiTitle}</h4>
                            <p class="payment-meta">
                                ${new Date(payment.timestamp?.toDate()).toLocaleString()} | 
                                ${payment.method} | 
                                $${payment.uiPrice || 'N/A'}
                            </p>
                        </div>
                        <span class="payment-status-badge ${payment.verified ? 'status-verified' : 'status-pending'}">
                            ${payment.verified ? 'Verified' : 'Pending'}
                        </span>
                    </div>
                `;
            }).join('')
            : '<p>No payment history yet.</p>';
    }
    
    // Telegram
    const telegramInput = document.getElementById('telegram-username');
    if (telegramInput && state.userData) {
        telegramInput.value = state.userData.telegramUsername || '';
    }
}

// Update cart count in header
function updateCartCount() {
    document.querySelector('.cart-count').textContent = state.cart.length;
}

// Handle authentication
function handleAuth() {
    if (state.currentUser) {
        handleLogout();
    } else {
        signInWithGoogle();
    }
}

// Sign in with Google
function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .catch(error => {
            console.error("Google sign-in error:", error);
            showError("Failed to sign in with Google. Please try again.");
        });
}

// Handle logout
function handleLogout() {
    auth.signOut()
        .then(() => {
            // Reset user-related state
            state.currentUser = null;
            state.userData = null;
            state.cart = [];
            state.bookmarks = [];
            state.purchases = [];
            state.payments = [];
            
            // Update UI
            updateAuthUI();
            updateCartCount();
            
            // Navigate to home if on protected page
            if (['dashboard', 'profile', 'admin'].includes(state.currentPage)) {
                navigateTo('home');
            }
        })
        .catch(error => {
            console.error("Logout error:", error);
            showError("Failed to logout. Please try again.");
        });
}

// Show Telegram username modal
function showTelegramModal() {
    const modalContent = `
        <div class="modal-header">
            <h2 class="modal-title">Telegram Username</h2>
            <button class="close-modal">&times;</button>
        </div>
        <div class="modal-content">
            <p>Please enter your Telegram username to continue. This will be used for payment verification.</p>
            <div class="form-group">
                <label for="modal-telegram-username">Telegram Username</label>
                <input type="text" id="modal-telegram-username" placeholder="@username" required>
            </div>
        </div>
        <div class="modal-actions">
            <button class="modal-btn modal-btn-primary" id="save-telegram-modal">Save</button>
        </div>
    `;
    
    showModal('Telegram Username', modalContent);
    
    // Add event listener to save button
    document.getElementById('save-telegram-modal').addEventListener('click', () => {
        const username = document.getElementById('modal-telegram-username').value.trim();
        if (username) {
            saveTelegramUsername(username);
            closeModal();
        } else {
            showError("Please enter a valid Telegram username.");
        }
    });
}

// Save Telegram username
async function saveTelegramUsername(username = null) {
    const telegramInput = username ? null : document.getElementById('telegram-username');
    const telegramUsername = username || (telegramInput ? telegramInput.value.trim() : '');
    
    if (!telegramUsername) {
        showError("Please enter a valid Telegram username.");
        return;
    }
    
    try {
        await db.collection('Users').doc(state.currentUser.uid).update({
            telegramUsername: telegramUsername
        });
        
        // Update local state
        state.userData.telegramUsername = telegramUsername;
        
        // Update UI
        if (state.currentPage === 'profile') {
            document.getElementById('profile-telegram').textContent = telegramUsername;
        }
        
        showSuccess("Telegram username saved successfully!");
    } catch (error) {
        console.error("Error saving Telegram username:", error);
        showError("Failed to save Telegram username. Please try again.");
    }
}

// Navigate to page
function navigateTo(page) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active-page');
    });
    
    // Show selected page
    document.getElementById(`${page}-page`).classList.add('active-page');
    
    // Update state
    state.currentPage = page;
    
    // Load page-specific content
    switch (page) {
        case 'home':
            loadHomePage();
            break;
        case 'dashboard':
            loadDashboardPage();
            break;
        case 'profile':
            loadProfilePage();
            break;
        case 'admin':
            loadAdminPage();
            break;
    }
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// Load home page
function loadHomePage() {
    // Load UIs if not already loaded
    if (state.uis.length === 0) {
        loadUIs();
    }
    
    // Set up category tabs
    setupCategoryTabs();
}

// Load dashboard page
function loadDashboardPage() {
    if (!state.currentUser) {
        navigateTo('home');
        return;
    }
    
    // Set default tab
    switchTab('purchased');
}

// Load profile page
function loadProfilePage() {
    if (!state.currentUser) {
        navigateTo('home');
        return;
    }
    
    updateProfileUI();
}

// Load admin page
function loadAdminPage() {
    if (!state.currentUser || !state.isAdmin) {
        navigateTo('home');
        return;
    }
    
    // Set default tab
    switchTab('verify-ui');
    
    // Load admin data
    loadAdminData();
}

// Switch dashboard/admin tab
function switchTab(tab) {
    // Update active tab button
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-tab') === tab) {
            btn.classList.add('active');
        }
    });
    
    // Update active tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
        if (content.id === `${tab}-tab`) {
            content.classList.add('active');
        }
    });
    
    // Update state
    state.currentTab = tab;
    
    // Load tab-specific content
    if (state.currentPage === 'dashboard') {
        updateDashboardUI();
    } else if (state.currentPage === 'admin') {
        updateAdminUI();
    }
}

// Load categories
async function loadCategories() {
    try {
        // In a real app, you would fetch these from Firestore
        // For now, we'll use mock categories
        state.categories = [
            { id: 'dashboards', name: 'Dashboards' },
            { id: 'ecommerce', name: 'E-commerce' },
            { id: 'landing', name: 'Landing Pages' },
            { id: 'mobile', name: 'Mobile UI' },
            { id: 'components', name: 'Components' }
        ];
        
        // If we're on the home page, set up the tabs
        if (state.currentPage === 'home') {
            setupCategoryTabs();
        }
        
        // If we're on the admin upload page, populate the category dropdown
        const categorySelect = document.getElementById('ui-category');
        if (categorySelect) {
            categorySelect.innerHTML = state.categories.map(cat => 
                `<option value="${cat.id}">${cat.name}</option>`
            ).join('');
        }
    } catch (error) {
        console.error("Error loading categories:", error);
        showError("Failed to load categories. Please try again.");
    }
}

// Set up category tabs
function setupCategoryTabs() {
    const tabsContainer = document.querySelector('.categories-tabs');
    if (!tabsContainer) return;
    
    tabsContainer.innerHTML = state.categories.map((cat, index) => `
        <button class="category-tab ${index === 0 ? 'active' : ''}" data-category="${cat.id}">
            ${cat.name}
        </button>
    `).join('');
    
    // Add event listeners
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const category = e.target.getAttribute('data-category');
            filterUIsByCategory(category);
            
            // Update active tab
            document.querySelectorAll('.category-tab').forEach(t => {
                t.classList.remove('active');
            });
            e.target.classList.add('active');
        });
    });
    
    // Load UIs for the first category by default
    if (state.categories.length > 0) {
        filterUIsByCategory(state.categories[0].id);
    }
}

// Load UIs
async function loadUIs() {
    showLoading();
    
    try {
        // In a real app, you would fetch these from Firestore
        // For now, we'll use mock data
        state.uis = mockUIs;
        
        // Update UI
        filterUIsByCategory(state.categories[0]?.id || 'dashboards');
    } catch (error) {
        console.error("Error loading UIs:", error);
        showError("Failed to load UIs. Please try again.");
    } finally {
        hideLoading();
    }
}

// Filter UIs by category
function filterUIsByCategory(categoryId) {
    const filteredUIs = state.uis.filter(ui => ui.category === categoryId);
    renderUIs(filteredUIs);
}

// Render UIs
function renderUIs(uis) {
    const uiGrid = document.querySelector('.ui-grid-container');
    if (!uiGrid) return;
    
    uiGrid.innerHTML = uis.map(ui => `
        <div class="ui-card" data-ui="${ui.uiId}">
            <img src="${ui.image}" alt="${ui.title}" class="ui-card-image">
            <div class="ui-card-content">
                <h3 class="ui-card-title">${ui.title}</h3>
                <p class="ui-card-desc">${ui.desc}</p>
                <div class="ui-card-footer">
                    <span class="ui-card-price">$${ui.price.usd}</span>
                    <div class="ui-card-actions">
                        <span class="material-icons bookmark-icon ${state.bookmarks.includes(ui.uiId) ? 'active' : ''}" 
                              data-ui="${ui.uiId}">bookmark</span>
                        <button class="detail-btn btn-secondary" data-ui="${ui.uiId}">
                            View
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    // Add event listeners
    addUICardEventListeners(uiGrid);
}

// Add event listeners to UI cards
function addUICardEventListeners(container) {
    // Bookmark buttons
    container.querySelectorAll('.bookmark-icon').forEach(icon => {
        icon.addEventListener('click', (e) => {
            e.stopPropagation();
            const uiId = e.target.getAttribute('data-ui');
            toggleBookmark(uiId);
        });
    });
    
    // View buttons
    container.querySelectorAll('.detail-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const uiId = e.target.closest('button').getAttribute('data-ui');
            showUIDetail(uiId);
        });
    });
    
    // Card click
    container.querySelectorAll('.ui-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.ui-card-actions')) {
                const uiId = card.getAttribute('data-ui');
                showUIDetail(uiId);
            }
        });
    });
}

// Toggle bookmark
async function toggleBookmark(uiId) {
    if (!state.currentUser) {
        showError("Please sign in to bookmark items.");
        return;
    }
    
    try {
        const isBookmarked = state.bookmarks.includes(uiId);
        let newBookmarks;
        
        if (isBookmarked) {
            newBookmarks = state.bookmarks.filter(id => id !== uiId);
        } else {
            newBookmarks = [...state.bookmarks, uiId];
        }
        
        // Update Firestore
        await db.collection('Users').doc(state.currentUser.uid).update({
            bookmarks: newBookmarks
        });
        
        // Update local state
        state.bookmarks = newBookmarks;
        
        // Update UI
        const bookmarkIcons = document.querySelectorAll(`.bookmark-icon[data-ui="${uiId}"]`);
        bookmarkIcons.forEach(icon => {
            icon.classList.toggle('active', !isBookmarked);
        });
        
        // If on bookmarks tab, refresh the view
        if (state.currentPage === 'dashboard' && state.currentTab === 'bookmarks') {
            updateDashboardUI();
        }
    } catch (error) {
        console.error("Error toggling bookmark:", error);
        showError("Failed to update bookmark. Please try again.");
    }
}

// Show UI detail
function showUIDetail(uiId) {
    const ui = state.uis.find(u => u.uiId === uiId);
    if (!ui) return;
    
    // Update URL without reload
    history.pushState(null, null, `#detail-${uiId}`);
    
    // Hide current page and show detail page
    document.querySelector('.active-page').classList.remove('active-page');
    document.getElementById('detail-page').classList.add('active-page');
    state.currentPage = 'detail';
    
    // Render UI detail
    renderUIDetail(ui);
}

// Render UI detail
function renderUIDetail(ui) {
    const detailContainer = document.querySelector('.detail-container');
    if (!detailContainer) return;
    
    detailContainer.innerHTML = `
        <button class="back-btn" id="back-to-home">
            <span class="material-icons">arrow_back</span>
            Back to Home
        </button>
        <div class="detail-header">
            <img src="${ui.image}" alt="${ui.title}" class="detail-image">
            <div class="detail-info">
                <h2 class="detail-title">${ui.title}</h2>
                <p class="detail-id">UI ID: ${ui.uiId}</p>
                <p class="detail-desc">${ui.desc}</p>
                ${ui.notes ? `
                    <div class="detail-notes">
                        <h4>Notes</h4>
                        <p>${ui.notes}</p>
                    </div>
                ` : ''}
            </div>
        </div>
        <div class="price-container">
            <div class="price-item">
                <div class="price-label">GHC</div>
                <div class="price-value">${ui.price.ghc}</div>
            </div>
            <div class="price-item">
                <div class="price-label">USD</div>
                <div class="price-value">${ui.price.usd}</div>
            </div>
            <div class="price-item">
                <div class="price-label">USDT</div>
                <div class="price-value">${ui.price.usdt}</div>
            </div>
            <div class="price-item">
                <div class="price-label">ETH</div>
                <div class="price-value">${ui.price.eth}</div>
            </div>
            <div class="price-item">
                <div class="price-label">BNB</div>
                <div class="price-value">${ui.price.bnb}</div>
            </div>
        </div>
        <div class="detail-actions">
            <span class="material-icons bookmark-icon ${state.bookmarks.includes(ui.uiId) ? 'active' : ''}" 
                  data-ui="${ui.uiId}" style="font-size: 36px; cursor: pointer;">bookmark</span>
            <button class="detail-btn btn-secondary" id="add-to-cart" data-ui="${ui.uiId}">
                <span class="material-icons">add_shopping_cart</span>
                Add to Cart
            </button>
            <button class="detail-btn btn-primary" id="buy-now" data-ui="${ui.uiId}">
                <span class="material-icons">shopping_bag</span>
                Buy Now
            </button>
        </div>
    `;
    
    // Add event listeners
    document.getElementById('back-to-home').addEventListener('click', () => {
        history.back();
        document.getElementById('detail-page').classList.remove('active-page');
        document.getElementById('home-page').classList.add('active-page');
        state.currentPage = 'home';
    });
    
    document.querySelector('.bookmark-icon').addEventListener('click', (e) => {
        const uiId = e.target.getAttribute('data-ui');
        toggleBookmark(uiId);
    });
    
    document.getElementById('add-to-cart').addEventListener('click', (e) => {
        const uiId = e.target.closest('button').getAttribute('data-ui');
        addToCart(uiId);
    });
    
    document.getElementById('buy-now').addEventListener('click', (e) => {
        const uiId = e.target.closest('button').getAttribute('data-ui');
        showPaymentModal([uiId]);
    });
}

// Add to cart
async function addToCart(uiId) {
    if (!state.currentUser) {
        showError("Please sign in to add items to cart.");
        return;
    }
    
    if (state.cart.includes(uiId)) {
        showError("This item is already in your cart.");
        return;
    }
    
    try {
        const newCart = [...state.cart, uiId];
        
        // Update Firestore
        await db.collection('Users').doc(state.currentUser.uid).update({
            cart: newCart
        });
        
        // Update local state
        state.cart = newCart;
        
        // Update UI
        updateCartCount();
        showSuccess("Item added to cart successfully!");
    } catch (error) {
        console.error("Error adding to cart:", error);
        showError("Failed to add item to cart. Please try again.");
    }
}

// Show cart modal
function showCartModal() {
    if (!state.currentUser) {
        showError("Please sign in to view your cart.");
        return;
    }
    
    if (state.cart.length === 0) {
        showError("Your cart is empty.");
        return;
    }
    
    // Get cart items
    const cartItems = state.cart.map(uiId => {
        return state.uis.find(ui => ui.uiId === uiId);
    }).filter(ui => ui); // Filter out undefined
    
    // Calculate total
    const total = cartItems.reduce((sum, ui) => sum + ui.price.usd, 0);
    
    const modalContent = `
        <div class="modal-header">
            <h2 class="modal-title">Your Cart (${cartItems.length})</h2>
            <button class="close-modal">&times;</button>
        </div>
        <div class="modal-content">
            <div class="cart-items">
                ${cartItems.map(ui => `
                    <div class="cart-item">
                        <img src="${ui.image}" alt="${ui.title}" width="60">
                        <div class="cart-item-info">
                            <h4>${ui.title}</h4>
                            <p>$${ui.price.usd}</p>
                        </div>
                        <button class="remove-from-cart" data-ui="${ui.uiId}">
                            <span class="material-icons">delete</span>
                        </button>
                    </div>
                `).join('')}
            </div>
            <div class="cart-total">
                <h3>Total: $${total.toFixed(2)}</h3>
            </div>
        </div>
        <div class="modal-actions">
            <button class="modal-btn modal-btn-secondary" id="continue-shopping">Continue Shopping</button>
            <button class="modal-btn modal-btn-primary" id="checkout">Checkout</button>
        </div>
    `;
    
    showModal('Your Cart', modalContent);
    
    // Add event listeners
    document.querySelectorAll('.remove-from-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const uiId = e.target.closest('button').getAttribute('data-ui');
            removeFromCart(uiId);
        });
    });
    
    document.getElementById('continue-shopping').addEventListener('click', closeModal);
    
    document.getElementById('checkout').addEventListener('click', () => {
        closeModal();
        showPaymentModal(state.cart);
    });
}

// Remove from cart
async function removeFromCart(uiId) {
    try {
        const newCart = state.cart.filter(id => id !== uiId);
        
        // Update Firestore
        await db.collection('Users').doc(state.currentUser.uid).update({
            cart: newCart
        });
        
        // Update local state
        state.cart = newCart;
        
        // Update UI
        updateCartCount();
        
        // Refresh cart modal
        if (state.cart.length > 0) {
            showCartModal();
        } else {
            closeModal();
            showSuccess("Item removed from cart. Your cart is now empty.");
        }
    } catch (error) {
        console.error("Error removing from cart:", error);
        showError("Failed to remove item from cart. Please try again.");
    }
}

// Show payment modal
function showPaymentModal(uiIds) {
    if (!state.currentUser) {
        showError("Please sign in to proceed with payment.");
        return;
    }
    
    if (!state.userData.telegramUsername) {
        showError("Please set your Telegram username in your profile before making a payment.");
        return;
    }
    
    // Get UIs being purchased
    const purchaseUIs = uiIds.map(uiId => {
        return state.uis.find(ui => ui.uiId === uiId);
    }).filter(ui => ui); // Filter out undefined
    
    if (purchaseUIs.length === 0) {
        showError("No valid items selected for purchase.");
        return;
    }
    
    // Calculate total
    const total = purchaseUIs.reduce((sum, ui) => sum + ui.price.usd, 0);
    
    // Create payment info text
    const paymentInfo = purchaseUIs.map(ui => `
        UI Title: "${ui.title}"
        UI ID: ${ui.uiId}
        Price (USD): $${ui.price.usd}
        Price (GHC): ${ui.price.ghc}
        Price (USDT): ${ui.price.usdt}
    `).join('\n\n');
    
    const modalContent = `
        <div class="modal-header">
            <h2 class="modal-title">Complete Your Purchase</h2>
            <button class="close-modal">&times;</button>
        </div>
        <div class="modal-content">
            <p>To complete your purchase, please follow these steps:</p>
            <ol>
                <li>Copy the payment information below</li>
                <li>Send payment to our Telegram account <a href="https://t.me/MittelyPay" target="_blank">@MittelyPay</a></li>
                <li>Send a screenshot of your payment receipt</li>
            </ol>
            
            <div class="copy-box">
                <pre>${paymentInfo}</pre>
                <button class="copy-btn" id="copy-payment-info">Copy</button>
            </div>
            
            <p>💸 <strong>Payment Methods Accepted:</strong> Grey, USDT, GHC, Crypto</p>
            
            <div class="receipt-upload">
                <label for="receipt-url">Receipt URL (optional):</label>
                <input type="text" id="receipt-url" placeholder="Paste screenshot/receipt URL here">
            </div>
        </div>
        <div class="modal-actions">
            <button class="modal-btn modal-btn-secondary" id="cancel-payment">Cancel</button>
            <button class="modal-btn modal-btn-primary" id="confirm-payment">I've Sent Payment</button>
        </div>
    `;
    
    showModal('Complete Purchase', modalContent);
    
    // Add event listeners
    document.getElementById('copy-payment-info').addEventListener('click', () => {
        const textToCopy = paymentInfo;
        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                const copyBtn = document.getElementById('copy-payment-info');
                copyBtn.textContent = 'Copied!';
                setTimeout(() => {
                    copyBtn.textContent = 'Copy';
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy text: ', err);
            });
    });
    
    document.getElementById('cancel-payment').addEventListener('click', closeModal);
    
    document.getElementById('confirm-payment').addEventListener('click', () => {
        const receiptUrl = document.getElementById('receipt-url').value.trim();
        createPaymentRecord(uiIds, purchaseUIs, receiptUrl);
    });
}

// Create payment record
async function createPaymentRecord(uiIds, purchaseUIs, receiptUrl = '') {
    try {
        // Create payment in Firestore
        const paymentRef = await db.collection('Payments').add({
            userId: state.currentUser.uid,
            uiIds: uiIds,
            uiTitle: purchaseUIs.map(ui => ui.title).join(', '),
            uiPrice: purchaseUIs.reduce((sum, ui) => sum + ui.price.usd, 0),
            method: '', // Will be set by admin
            status: 'pending',
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            receiptUrl: receiptUrl || '',
            verified: false
        });
        
        // Clear cart if this was a cart checkout
        if (uiIds.length === state.cart.length && uiIds.every(id => state.cart.includes(id))) {
            await db.collection('Users').doc(state.currentUser.uid).update({
                cart: []
            });
            
            // Update local state
            state.cart = [];
            updateCartCount();
        }
        
        // Close modal and show success
        closeModal();
        showSuccess("Payment record created! We'll verify your payment soon.");
        
        // Reload payments if on dashboard
        if (state.currentPage === 'dashboard' && state.currentTab === 'payments') {
            loadUserPayments(state.currentUser.uid);
        }
    } catch (error) {
        console.error("Error creating payment record:", error);
        showError("Failed to create payment record. Please try again.");
    }
}

// Download UI
function downloadUI(uiId) {
    const ui = state.uis.find(u => u.uiId === uiId);
    if (!ui) return;
    
    if (!state.purchases.includes(uiId)) {
        showError("You haven't purchased this UI kit yet.");
        return;
    }
    
    // In a real app, this would initiate a download
    // For now, we'll just show a success message
    showSuccess(`Download started: ${ui.title}`);
}

// Handle search
function handleSearch(e) {
    const query = e.target.value.toLowerCase();
    
    if (query.length === 0) {
        // Show all UIs for current category
        const activeCategory = document.querySelector('.category-tab.active')?.getAttribute('data-category');
        filterUIsByCategory(activeCategory || 'dashboards');
        return;
    }
    
    // Filter UIs by search query
    const filteredUIs = state.uis.filter(ui => 
        ui.title.toLowerCase().includes(query) || 
        ui.desc.toLowerCase().includes(query)
    );
    
    renderUIs(filteredUIs);
}

// Load admin data
async function loadAdminData() {
    if (!state.isAdmin) return;
    
    try {
        // Load unverified UIs
        const uiSnapshot = await db.collection('UIs')
            .where('verified', '==', false)
            .get();
        
        state.unverifiedUIs = uiSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        // Load unverified users
        const userSnapshot = await db.collection('Users')
            .where('verified', '==', false)
            .get();
        
        state.unverifiedUsers = userSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        // Load pending payments
        const paymentSnapshot = await db.collection('Payments')
            .where('verified', '==', false)
            .get();
        
        state.pendingPayments = paymentSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        // Update UI
        updateAdminUI();
    } catch (error) {
        console.error("Error loading admin data:", error);
        showError("Failed to load admin data. Please try again.");
    }
}

// Update admin UI
function updateAdminUI() {
    if (state.currentPage !== 'admin') return;
    
    // UI Verification tab
    const uiVerificationContainer = document.querySelector('#verify-ui-tab .unverified-uis');
    if (uiVerificationContainer) {
        uiVerificationContainer.innerHTML = state.unverifiedUIs?.length > 0 
            ? state.unverifiedUIs.map(ui => `
                <div class="verification-item">
                    <h3 class="verification-title">${ui.title}</h3>
                    <p class="verification-meta">ID: ${ui.uiId} | Category: ${ui.category}</p>
                    <div class="verification-actions">
                        <button class="verify-btn" data-id="${ui.id}" data-type="ui">Verify</button>
                        <button class="reject-btn" data-id="${ui.id}" data-type="ui">Reject</button>
                    </div>
                </div>
            `).join('')
            : '<p>No unverified UIs found.</p>';
        
        // Add event listeners
        document.querySelectorAll('#verify-ui-tab .verify-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                const type = e.target.getAttribute('data-type');
                verifyItem(id, type);
            });
        });
        
        document.querySelectorAll('#verify-ui-tab .reject-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                const type = e.target.getAttribute('data-type');
                rejectItem(id, type);
            });
        });
    }
    
    // User Verification tab
    const userVerificationContainer = document.querySelector('#verify-user-tab .unverified-users');
    if (userVerificationContainer) {
        userVerificationContainer.innerHTML = state.unverifiedUsers?.length > 0 
            ? state.unverifiedUsers.map(user => `
                <div class="verification-item">
                    <h3 class="verification-title">${user.name}</h3>
                    <p class="verification-meta">Email: ${user.email} | Telegram: ${user.telegramUsername || 'N/A'}</p>
                    <div class="verification-actions">
                        <button class="verify-btn" data-id="${user.id}" data-type="user">Verify</button>
                        <button class="reject-btn" data-id="${user.id}" data-type="user">Reject</button>
                    </div>
                </div>
            `).join('')
            : '<p>No unverified users found.</p>';
        
        // Add event listeners
        document.querySelectorAll('#verify-user-tab .verify-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                const type = e.target.getAttribute('data-type');
                verifyItem(id, type);
            });
        });
        
        document.querySelectorAll('#verify-user-tab .reject-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                const type = e.target.getAttribute('data-type');
                rejectItem(id, type);
            });
        });
    }
}

// Verify item (UI or user)
async function verifyItem(id, type) {
    try {
        if (type === 'ui') {
            await db.collection('UIs').doc(id).update({
                verified: true
            });
            
            // Update local state
            state.unverifiedUIs = state.unverifiedUIs.filter(ui => ui.id !== id);
        } else if (type === 'user') {
            await db.collection('Users').doc(id).update({
                verified: true
            });
            
            // Update local state
            state.unverifiedUsers = state.unverifiedUsers.filter(user => user.id !== id);
        } else if (type === 'payment') {
            const payment = state.pendingPayments.find(p => p.id === id);
            if (!payment) return;
            
            // Update payment
            await db.collection('Payments').doc(id).update({
                verified: true,
                status: 'verified'
            });
            
            // Add UIs to user's purchases
            const userRef = db.collection('Users').doc(payment.userId);
            const userDoc = await userRef.get();
            
            if (userDoc.exists) {
                const currentPurchases = userDoc.data().purchases || [];
                const newPurchases = [...new Set([...currentPurchases, ...payment.uiIds])];
                
                await userRef.update({
                    purchases: newPurchases
                });
            }
            
            // Update local state
            state.pendingPayments = state.pendingPayments.filter(p => p.id !== id);
        }
        
        // Update UI
        updateAdminUI();
        showSuccess("Item verified successfully!");
    } catch (error) {
        console.error("Error verifying item:", error);
        showError("Failed to verify item. Please try again.");
    }
}

// Reject item (UI or user)
async function rejectItem(id, type) {
    try {
        if (type === 'ui') {
            await db.collection('UIs').doc(id).delete();
            
            // Update local state
            state.unverifiedUIs = state.unverifiedUIs.filter(ui => ui.id !== id);
        } else if (type === 'user') {
            // In a real app, you might want to flag the user instead of deleting
            await db.collection('Users').doc(id).update({
                verified: false,
                rejected: true
            });
            
            // Update local state
            state.unverifiedUsers = state.unverifiedUsers.filter(user => user.id !== id);
        } else if (type === 'payment') {
            await db.collection('Payments').doc(id).update({
                verified: false,
                status: 'rejected'
            });
            
            // Update local state
            state.pendingPayments = state.pendingPayments.filter(p => p.id !== id);
        }
        
        // Update UI
        updateAdminUI();
        showSuccess("Item rejected successfully!");
    } catch (error) {
        console.error("Error rejecting item:", error);
        showError("Failed to reject item. Please try again.");
    }
}

// Handle UI upload
async function handleUIUpload(e) {
    e.preventDefault();
    
    if (!state.isAdmin) {
        showError("Only admins can upload UIs.");
        return;
    }
    
    const form = e.target;
    const title = form.querySelector('#ui-title').value;
    const desc = form.querySelector('#ui-desc').value;
    const image = form.querySelector('#ui-image').value;
    const category = form.querySelector('#ui-category').value;
    const notes = form.querySelector('#ui-notes').value;
    const priceGhc = parseFloat(form.querySelector('#ui-price-ghc').value);
    const priceUsd = parseFloat(form.querySelector('#ui-price-usd').value);
    const priceUsdt = parseFloat(form.querySelector('#ui-price-usdt').value);
    const priceEth = parseFloat(form.querySelector('#ui-price-eth').value);
    const priceBnb = parseFloat(form.querySelector('#ui-price-bnb').value);
    
    try {
        // Generate UI ID
        const uiId = `ui-${Math.floor(10000 + Math.random() * 90000)}`;
        
        // Create UI in Firestore
        await db.collection('UIs').add({
            uiId: uiId,
            title: title,
            desc: desc,
            image: image,
            category: category,
            notes: notes,
            price: {
                ghc: priceGhc,
                usd: priceUsd,
                usdt: priceUsdt,
                eth: priceEth,
                bnb: priceBnb
            },
            verified: false,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Reset form
        form.reset();
        
        // Show success
        showSuccess("UI uploaded successfully! It will appear after verification.");
        
        // Reload UIs
        loadUIs();
    } catch (error) {
        console.error("Error uploading UI:", error);
        showError("Failed to upload UI. Please try again.");
    }
}

// Modal system
function showModal(title, content) {
    const modalContainer = document.getElementById('modal-container');
    modalContainer.innerHTML = content;
    
    const modalOverlay = document.getElementById('modal-overlay');
    modalOverlay.classList.add('active');
    
    // Add close modal event
    document.querySelector('.close-modal').addEventListener('click', closeModal);
    
    // Close modal when clicking outside
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

function closeModal() {
    const modalOverlay = document.getElementById('modal-overlay');
    modalOverlay.classList.remove('active');
    
    // Remove event listeners
    document.removeEventListener('keydown', closeModal);
}

// Theme functions
function setTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

function toggleTheme() {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    state.theme = newTheme;
}

// Banner animation
function startBannerAnimation() {
    const messages = document.querySelectorAll('.banner-messages .message');
    if (messages.length === 0) return;
    
    let currentIndex = 0;
    
    function showNextMessage() {
        messages.forEach((msg, index) => {
            msg.classList.remove('active');
            if (index === currentIndex) {
                msg.classList.add('active');
            }
        });
        
        currentIndex = (currentIndex + 1) % messages.length;
    }
    
    // Show first message immediately
    showNextMessage();
    
    // Rotate messages every 5 seconds
    setInterval(showNextMessage, 5000);
}

// Loading functions
function showLoading() {
    document.querySelector('.loading-overlay').style.display = 'flex';
}

function hideLoading() {
    document.querySelector('.loading-overlay').style.display = 'none';
}

// Notification functions
function showError(message) {
    // In a real app, you'd use a proper notification system
    alert(`Error: ${message}`);
}

function showSuccess(message) {
    // In a real app, you'd use a proper notification system
    alert(`Success: ${message}`);
}

// Handle back/forward navigation
window.addEventListener('popstate', () => {
    const hash = window.location.hash;
    
    if (hash.startsWith('#detail-')) {
        const uiId = hash.replace('#detail-', '');
        const ui = state.uis.find(u => u.uiId === uiId);
        if (ui) {
            showUIDetail(uiId);
        }
    } else {
        navigateTo('home');
    }
});

// Load mock data in development
function loadMockData() {
    // Categories
    state.categories = [
        { id: 'dashboards', name: 'Dashboards' },
        { id: 'ecommerce', name: 'E-commerce' },
        { id: 'landing', name: 'Landing Pages' },
        { id: 'mobile', name: 'Mobile UI' },
        { id: 'components', name: 'Components' }
    ];
    
    // Mock UIs
    state.uis = mockUIs;
    
    // If on home page, render UIs
    if (state.currentPage === 'home') {
        setupCategoryTabs();
        filterUIsByCategory(state.categories[0].id);
    }
    
    // If on admin page and user is admin, set mock admin data
    if (state.currentPage === 'admin' && state.isAdmin) {
        state.unverifiedUIs = mockUIs.filter(ui => !ui.verified);
        state.unverifiedUsers = [
            {
                id: 'user-123',
                name: 'Test User',
                email: 'test@example.com',
                telegramUsername: '@testuser',
                verified: false
            }
        ];
        updateAdminUI();
    }
}