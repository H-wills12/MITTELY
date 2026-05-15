// MITTELY Store Frontend - Full Sync with Admin + Discounts

let currentUser = null;
let selectedProduct = null;
let products = [];
let activeDiscounts = [];
let appliedDiscount = null;

// Load products from localStorage
function loadProductsFromStorage() {
  const savedProducts = localStorage.getItem('mittely_products');
  
  if (savedProducts && JSON.parse(savedProducts).length > 0) {
    products = JSON.parse(savedProducts);
  } else {
    products = [
      { id: 'prod_1', name: 'SaaS Launch Pro', slug: 'saas-launch-pro', price: 49, category: 'Template', language: 'HTML/CSS/JS', fileSize: '2.1 MB', description: 'A high-converting SaaS landing page with pricing tables, feature grids, and testimonial sections.', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop', liveUrl: 'https://example.com/saas', active: true, featured: true, new: true, soldOut: false, downloads: 127, rating: 4.8 },
      { id: 'prod_2', name: 'E-Commerce Elite', slug: 'ecommerce-elite', price: 79, category: 'Template', language: 'HTML/CSS/JS', fileSize: '3.4 MB', description: 'Complete e-commerce landing page with product showcases, cart CTAs, and trust badges.', image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop', liveUrl: 'https://example.com/ecommerce', active: true, featured: true, new: false, soldOut: false, downloads: 89, rating: 4.9 },
      { id: 'prod_3', name: 'App Landing Kit', slug: 'app-landing-kit', price: 39, category: 'UI Kit', language: 'React/Next.js', fileSize: '1.8 MB', description: 'Mobile app landing page with device mockups, app store buttons, and feature highlights.', image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&h=400&fit=crop', liveUrl: 'https://example.com/app', active: true, featured: false, new: true, soldOut: false, downloads: 234, rating: 4.7 },
      { id: 'prod_4', name: 'Neomorphic UI Pack', slug: 'neomorphic-ui', price: 45, category: 'UI Kit', language: 'CSS/HTML', fileSize: '4.2 MB', description: '400+ neomorphic UI components for modern web applications.', image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=600&h=400&fit=crop', liveUrl: 'https://example.com/neomorphic', active: true, featured: true, new: false, soldOut: false, downloads: 56, rating: 4.6 },
      { id: 'prod_5', name: '3D Illustrations Pack', slug: '3d-illustrations', price: 59, category: 'Illustration', language: 'PNG/SVG', fileSize: '15.6 MB', description: '50+ premium 3D illustrations for websites and presentations.', image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=400&fit=crop', liveUrl: 'https://example.com/3d', active: true, featured: false, new: true, soldOut: false, downloads: 45, rating: 4.9 }
    ];
    localStorage.setItem('mittely_products', JSON.stringify(products));
  }
  
  loadDiscountsFromStorage();
  return products;
}

// Load discounts from localStorage
function loadDiscountsFromStorage() {
  const savedDiscounts = localStorage.getItem('mittely_discounts');
  if (savedDiscounts) {
    activeDiscounts = JSON.parse(savedDiscounts).filter(d => d.active === true);
  } else {
    activeDiscounts = [];
  }
  
  // Show discount banner if there are active discounts
  updateDiscountBanner();
}

// Update discount banner on homepage
function updateDiscountBanner() {
  const banner = document.getElementById('discount-banner');
  const activeDiscount = activeDiscounts.find(d => d.active === true);
  
  if (banner && activeDiscount) {
    banner.style.display = 'block';
    document.getElementById('activeDiscountCode').textContent = activeDiscount.code;
    const discountText = activeDiscount.type === 'percentage' ? `${activeDiscount.value}%` : `$${activeDiscount.value}`;
    document.getElementById('discountValue').textContent = discountText;
  } else if (banner) {
    banner.style.display = 'none';
  }
}

// Apply discount code
window.applyDiscount = function() {
  const codeInput = document.getElementById('discountCodeInput');
  const code = codeInput.value.toUpperCase();
  
  const discount = activeDiscounts.find(d => d.code === code);
  
  if (discount && selectedProduct) {
    let discountAmount = 0;
    if (discount.type === 'percentage') {
      discountAmount = (selectedProduct.price * discount.value) / 100;
    } else {
      discountAmount = discount.value;
    }
    
    const finalPrice = Math.max(0, selectedProduct.price - discountAmount);
    appliedDiscount = discount;
    
    document.getElementById('finalPrice').value = `$${finalPrice.toFixed(2)} (was $${selectedProduct.price.toFixed(2)})`;
    document.getElementById('finalPriceLabel').innerHTML = `Final Price <span style="color: #10b981;">(${discount.code} applied!)</span>`;
    showToast('Discount Applied', `You saved $${discountAmount.toFixed(2)}!`, 'success');
  } else if (!selectedProduct) {
    showToast('Error', 'Please select a product first', 'error');
  } else {
    showToast('Invalid Code', 'Discount code not found or expired', 'error');
  }
};

// Render products
function renderProducts() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;
  
  const activeProducts = products.filter(p => p.active === true && p.soldOut === false);
  
  if (activeProducts.length === 0) {
    grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 4rem;"><i class="fas fa-box-open" style="font-size: 4rem; opacity: 0.3; margin-bottom: 1rem; display: block;"></i><h3>No products available yet</h3><p>Check back soon for new assets!</p></div>`;
    return;
  }
  
  grid.innerHTML = activeProducts.map(p => `
    <div class="product-card">
      <div class="preview">
        <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.src='https://placehold.co/600x400/6366f1/white?text=${encodeURIComponent(p.name)}'">
        <div class="overlay">
          <span class="cat">${p.category}</span>
          ${p.featured ? '<span class="cat" style="background: linear-gradient(135deg, #f59e0b, #d97706);">⭐ Featured</span>' : ''}
          ${p.new ? '<span class="cat" style="background: #10b981;">🆕 New</span>' : ''}
        </div>
      </div>
      <div class="info">
        <h3>${p.name}</h3>
        <p>${p.description ? p.description.substring(0, 100) : 'No description'}${p.description && p.description.length > 100 ? '...' : ''}</p>
        <div class="meta">
          <span class="price">$${p.price.toFixed(2)}</span>
          <button class="btn btn-primary btn-sm" onclick="openClaimModal('${p.id}')"><i class="fas fa-download"></i> Purchase</button>
        </div>
        ${p.liveUrl ? `<a href="${p.liveUrl}" target="_blank" class="btn-text" style="display:block; margin-top:0.75rem;">Live Preview →</a>` : ''}
        <div style="display: flex; gap: 0.5rem; margin-top: 0.75rem; flex-wrap: wrap;">
          <small style="color: var(--text-muted);"><i class="fas fa-code"></i> ${p.language || 'HTML/CSS/JS'}</small>
          <small style="color: var(--text-muted);"><i class="fas fa-download"></i> ${p.downloads || 0} downloads</small>
        </div>
      </div>
    </div>
  `).join('');
}

// Open purchase modal
window.openClaimModal = function(productId) {
  if (!currentUser) {
    showToast('Please Sign In', 'You need to sign in with Google to purchase assets.', 'info');
    setTimeout(() => window.location.href = 'login.html', 1500);
    return;
  }
  
  selectedProduct = products.find(p => p.id === productId);
  if (!selectedProduct || selectedProduct.soldOut) {
    showToast('Not Available', 'This product is currently sold out.', 'error');
    return;
  }
  
  appliedDiscount = null;
  document.getElementById('claimProductName').textContent = selectedProduct.name;
  document.getElementById('claimProductDisplay').value = selectedProduct.name;
  document.getElementById('claimPrice').value = '$' + selectedProduct.price.toFixed(2);
  document.getElementById('finalPrice').value = '$' + selectedProduct.price.toFixed(2);
  document.getElementById('discountCodeInput').value = '';
  document.getElementById('claimEmail').value = currentUser.email;
  document.getElementById('claimModal').classList.add('active');
};

// Process payment
window.claimTemplate = async function() {
  if (!selectedProduct || !currentUser) return;
  
  const gateway = document.querySelector('input[name="payGateway"]:checked')?.value || 'paystack';
  let finalAmount = selectedProduct.price;
  
  if (appliedDiscount) {
    if (appliedDiscount.type === 'percentage') {
      finalAmount = selectedProduct.price * (1 - appliedDiscount.value / 100);
    } else {
      finalAmount = Math.max(0, selectedProduct.price - appliedDiscount.value);
    }
  }
  
  const btn = document.getElementById('claimBtn');
  btn.disabled = true;
  btn.innerHTML = '<div class="spinner"></div> Processing...';
  
  setTimeout(() => {
    showToast('Purchase Successful!', `You purchased ${selectedProduct.name} for $${finalAmount.toFixed(2)}`, 'success');
    
    const order = { 
      id: 'ORD-' + Math.random().toString(36).substr(2, 6).toUpperCase(), 
      product: selectedProduct, 
      amount: finalAmount, 
      originalAmount: selectedProduct.price,
      discount: appliedDiscount,
      gateway: gateway, 
      status: 'completed', 
      date: new Date().toISOString(), 
      downloadToken: 'token_' + Date.now() 
    };
    const orders = JSON.parse(localStorage.getItem('mittely_orders') || '[]');
    orders.unshift(order);
    localStorage.setItem('mittely_orders', JSON.stringify(orders));
    
    selectedProduct.downloads = (selectedProduct.downloads || 0) + 1;
    const allProducts = loadProductsFromStorage();
    const index = allProducts.findIndex(p => p.id === selectedProduct.id);
    if (index !== -1) {
      allProducts[index].downloads = selectedProduct.downloads;
      localStorage.setItem('mittely_products', JSON.stringify(allProducts));
    }
    
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-lock"></i> Pay & Download';
    closeModal('claimModal');
    window.location.href = `download.html?token=${order.downloadToken}&order=${order.id}`;
  }, 1500);
};

// Initialize
function init() {
  loadProductsFromStorage();
  checkAuth();
  renderProducts();
  loadStats();
  
  window.addEventListener('scroll', () => {
    const nav = document.getElementById('navbar');
    if (window.scrollY > 50) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  });
  
  window.addEventListener('storage', (e) => {
    if (e.key === 'mittely_products') {
      loadProductsFromStorage();
      renderProducts();
      loadStats();
      showToast('Store Updated', 'New products are available!', 'success');
    }
    if (e.key === 'mittely_discounts') {
      loadDiscountsFromStorage();
      showToast('Discounts Updated', 'New discount codes available!', 'info');
    }
  });
  
  const themeSwitcher = document.getElementById('themeSwitcher');
  if (themeSwitcher) {
    themeSwitcher.addEventListener('click', () => {
      document.body.classList.toggle('light-theme');
      const sun = themeSwitcher.querySelector('.fa-sun');
      const moon = themeSwitcher.querySelector('.fa-moon');
      if (document.body.classList.contains('light-theme')) {
        sun.style.display = 'none';
        moon.style.display = 'inline-block';
      } else {
        sun.style.display = 'inline-block';
        moon.style.display = 'none';
      }
    });
  }
}

function checkAuth() {
  const token = localStorage.getItem('mittely_token');
  const userStr = localStorage.getItem('mittely_user');
  if (token && userStr) {
    try {
      currentUser = JSON.parse(userStr);
      updateNavUser();
    } catch (e) { console.error(e); }
  }
}

function updateNavUser() {
  const navUser = document.getElementById('navUser');
  if (!currentUser || !navUser) return;
  navUser.innerHTML = `<a href="dashboard.html" style="display:flex; align-items:center; gap:0.75rem; text-decoration:none;"><img src="${currentUser.picture || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(currentUser.name || 'User') + '&background=6366f1&color=fff'}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;"><span style="font-size:0.85rem;font-weight:600;">${currentUser.name || 'Dashboard'}</span></a><button class="btn btn-outline btn-sm" onclick="logout()"><i class="fas fa-sign-out-alt"></i></button>`;
  const heroBtn = document.getElementById('heroLoginBtn');
  const ctaBtn = document.getElementById('ctaLoginBtn');
  if (heroBtn) { heroBtn.innerHTML = '<i class="fas fa-chart-pie"></i> My Dashboard'; heroBtn.href = 'dashboard.html'; }
  if (ctaBtn) { ctaBtn.innerHTML = '<i class="fas fa-chart-pie"></i> Go to Dashboard'; ctaBtn.href = 'dashboard.html'; }
}

window.logout = function() {
  localStorage.removeItem('mittely_token');
  localStorage.removeItem('mittely_user');
  window.location.reload();
};

window.closeModal = function(id) { document.getElementById(id).classList.remove('active'); };

async function loadStats() {
  const statsProducts = document.getElementById('statProducts');
  if (statsProducts) statsProducts.textContent = products.filter(p => p.active).length;
}

function showToast(title, message, type) {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
  toast.innerHTML = `<div class="toast-icon"><i class="fas ${icons[type]}"></i></div><div><h4>${title}</h4><p>${message}</p></div>`;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 400); }, 4000);
}

init();
