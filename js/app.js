// js/app.js - Simple Working Version
import { 
  db, auth, onAuthStateChanged,
  collection, getDocs, addDoc, doc, updateDoc,
  PRODUCTS_COLLECTION, ORDERS_COLLECTION, CUSTOMERS_COLLECTION, DISCOUNTS_COLLECTION
} from './firebase-config.js';

let currentUser = null;
let selectedProduct = null;
let products = [];
let activeDiscounts = [];

// Load products from Firestore
async function loadProducts() {
  try {
    const querySnapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
    products = [];
    querySnapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() });
    });
    console.log('Loaded', products.length, 'products');
    renderProducts();
    updateStats();
  } catch (error) {
    console.error('Error loading products:', error);
    // Demo products if Firestore is empty
    products = [
      { id: 'demo1', name: 'SaaS Launch Pro', price: 49, category: 'Template', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400', active: true, featured: true, new: true, language: 'HTML/CSS', downloads: 127 },
      { id: 'demo2', name: 'E-Commerce Elite', price: 79, category: 'Template', image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400', active: true, featured: true, new: false, language: 'HTML/CSS', downloads: 89 },
      { id: 'demo3', name: 'App Landing Kit', price: 39, category: 'UI Kit', image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400', active: true, featured: false, new: true, language: 'React', downloads: 234 }
    ];
    renderProducts();
  }
}

// Load discounts from Firestore
async function loadDiscounts() {
  try {
    const querySnapshot = await getDocs(collection(db, DISCOUNTS_COLLECTION));
    activeDiscounts = [];
    querySnapshot.forEach((doc) => {
      activeDiscounts.push({ id: doc.id, ...doc.data() });
    });
  } catch (error) {
    console.error('Error loading discounts:', error);
  }
}

// Render products to page
function renderProducts() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;
  
  const activeProducts = products.filter(p => p.active !== false);
  
  if (activeProducts.length === 0) {
    grid.innerHTML = '<div style="text-align:center;padding:4rem;"><h3>No products yet</h3><p>Check back soon!</p></div>';
    return;
  }
  
  grid.innerHTML = activeProducts.map(p => `
    <div class="product-card">
      <div class="preview">
        <img src="${p.image}" alt="${p.name}" style="width:100%;height:200px;object-fit:cover;">
        <div class="overlay"><span class="cat">${p.category}</span></div>
      </div>
      <div class="info">
        <h3>${p.name}</h3>
        <p>${p.description ? p.description.substring(0, 80) : 'Premium digital asset'}</p>
        <div class="meta">
          <span class="price">$${p.price}</span>
          <button class="btn btn-primary btn-sm" onclick="window.openClaimModal('${p.id}')">Purchase</button>
        </div>
        <small><i class="fas fa-code"></i> ${p.language || 'HTML/CSS'}</small>
      </div>
    </div>
  `).join('');
}

// Update stats on homepage
async function updateStats() {
  try {
    const ordersSnap = await getDocs(collection(db, ORDERS_COLLECTION));
    const customersSnap = await getDocs(collection(db, CUSTOMERS_COLLECTION));
    
    document.getElementById('statOrders') && (document.getElementById('statOrders').textContent = ordersSnap.size);
    document.getElementById('statCustomers') && (document.getElementById('statCustomers').textContent = customersSnap.size);
    document.getElementById('statProducts') && (document.getElementById('statProducts').textContent = products.length);
  } catch (e) {
    console.log('Stats not available');
  }
}

// Open purchase modal
window.openClaimModal = function(productId) {
  if (!currentUser) {
    alert('Please sign in first');
    window.location.href = 'login.html';
    return;
  }
  
  selectedProduct = products.find(p => p.id === productId);
  if (!selectedProduct) return;
  
  document.getElementById('claimProductName').textContent = selectedProduct.name;
  document.getElementById('claimPrice').value = '$' + selectedProduct.price;
  document.getElementById('claimEmail').value = currentUser.email;
  document.getElementById('claimModal').classList.add('active');
};

// Process purchase
window.claimTemplate = async function() {
  if (!selectedProduct || !currentUser) return;
  
  const gateway = document.querySelector('input[name="payGateway"]:checked')?.value || 'paystack';
  const btn = document.getElementById('claimBtn');
  
  btn.disabled = true;
  btn.innerHTML = 'Processing...';
  
  try {
    await addDoc(collection(db, ORDERS_COLLECTION), {
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      amount: selectedProduct.price,
      gateway: gateway,
      customerEmail: currentUser.email,
      customerName: currentUser.displayName,
      status: 'completed',
      createdAt: new Date().toISOString()
    });
    
    alert('Purchase successful!');
    window.location.href = 'download.html';
  } catch (error) {
    alert('Error: ' + error.message);
    btn.disabled = false;
    btn.innerHTML = 'Pay & Download';
  }
};

// Close modal
window.closeModal = function(id) {
  document.getElementById(id).classList.remove('active');
};

// Auth state
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  if (user) {
    console.log('Logged in:', user.email);
    // Save to customers
    const saveCustomer = async () => {
      try {
        await addDoc(collection(db, CUSTOMERS_COLLECTION), {
          name: user.displayName,
          email: user.email,
          uid: user.uid,
          createdAt: new Date().toISOString()
        });
      } catch(e) { console.log('Customer exists'); }
    };
    saveCustomer();
  }
});

// Initialize
async function init() {
  await loadProducts();
  await loadDiscounts();
  
  // Theme switcher
  const themeSwitcher = document.getElementById('themeSwitcher');
  if (themeSwitcher) {
    themeSwitcher.onclick = () => document.body.classList.toggle('light-theme');
  }
}

init();

// Make functions global
window.openClaimModal = window.openClaimModal;
window.claimTemplate = window.claimTemplate;
window.closeModal = window.closeModal;
