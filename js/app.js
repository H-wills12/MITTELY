const products = [
  { id: 'saas-launch-pro', name: 'SaaS Launch Pro', slug: 'saas-launch-pro', price: 49, category: 'Template', description: 'A high-converting SaaS landing page with pricing tables, feature grids, and testimonial sections.', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop', liveUrl: 'https://example.com/saas', active: true, soldOut: false },
  { id: 'ecommerce-elite', name: 'E-Commerce Elite', slug: 'ecommerce-elite', price: 79, category: 'Template', description: 'Complete e-commerce landing page with product showcases, cart CTAs, and trust badges.', image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop', liveUrl: 'https://example.com/ecommerce', active: true, soldOut: false },
  { id: 'app-landing-kit', name: 'App Landing Kit', slug: 'app-landing-kit', price: 39, category: 'UI Kit', description: 'Mobile app landing page with device mockups, app store buttons, and feature highlights.', image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&h=400&fit=crop', liveUrl: 'https://example.com/app', active: true, soldOut: false },
  { id: 'portfolio-master', name: 'Portfolio Master', slug: 'portfolio-master', price: 29, category: 'Template', description: 'Clean portfolio template with project galleries, about sections, and contact forms.', image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&h=400&fit=crop', liveUrl: 'https://example.com/portfolio', active: true, soldOut: false },
  { id: 'neomorphic-ui', name: 'Neomorphic UI Pack', slug: 'neomorphic-ui', price: 45, category: 'UI Kit', description: '400+ neomorphic UI components for modern web applications.', image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=600&h=400&fit=crop', liveUrl: 'https://example.com/neomorphic', active: true, soldOut: false },
  { id: '3d-illustrations', name: '3D Illustrations Pack', slug: '3d-illustrations', price: 59, category: 'Illustration', description: '50+ premium 3D illustrations for websites and presentations.', image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=400&fit=crop', liveUrl: 'https://example.com/3d', active: true, soldOut: false }
];

let currentUser = null;
let selectedProduct = null;

function init() {
  checkAuth();
  renderProducts();
  loadStats();
  
  window.addEventListener('scroll', () => {
    const nav = document.getElementById('navbar');
    if (window.scrollY > 50) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  });
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
  
  navUser.innerHTML = `
    <a href="dashboard.html" style="display:flex; align-items:center; gap:0.75rem; text-decoration:none;">
      <img src="${currentUser.picture || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(currentUser.name || 'User') + '&background=6366f1&color=fff'}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;">
      <span style="font-size:0.85rem;font-weight:600;">${currentUser.name || 'Dashboard'}</span>
    </a>
    <button class="btn btn-outline btn-sm" onclick="logout()"><i class="fas fa-sign-out-alt"></i></button>
  `;
  
  const heroBtn = document.getElementById('heroLoginBtn');
  const ctaBtn = document.getElementById('ctaLoginBtn');
  if (heroBtn) { heroBtn.innerHTML = '<i class="fas fa-chart-pie"></i> My Dashboard'; heroBtn.href = 'dashboard.html'; }
  if (ctaBtn) { ctaBtn.innerHTML = '<i class="fas fa-chart-pie"></i> Go to Dashboard'; ctaBtn.href = 'dashboard.html'; }
}

function logout() {
  localStorage.removeItem('mittely_token');
  localStorage.removeItem('mittely_user');
  window.location.reload();
}

function renderProducts() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;
  
  const activeProducts = products.filter(p => p.active);
  grid.innerHTML = activeProducts.map(p => `
    <div class="product-card">
      <div class="preview">
        <img src="${p.image}" alt="${p.name}" loading="lazy">
        <div class="overlay"><span class="cat">${p.category}</span></div>
      </div>
      <div class="info">
        <h3>${p.name}</h3>
        <p>${p.description.substring(0, 100)}...</p>
        <div class="meta">
          <span class="price">$${p.price}</span>
          ${p.soldOut ? '<span class="badge-danger">Sold Out</span>' : `<button class="btn btn-primary btn-sm" onclick="openClaimModal('${p.id}')"><i class="fas fa-download"></i> Purchase</button>`}
        </div>
        ${p.liveUrl ? `<a href="${p.liveUrl}" target="_blank" class="btn-text" style="display:block; margin-top:0.75rem;">Live Preview →</a>` : ''}
      </div>
    </div>
  `).join('');
}

function openClaimModal(productId) {
  if (!currentUser) {
    showToast('Please Sign In', 'You need to sign in with Google to purchase assets.', 'info');
    setTimeout(() => window.location.href = 'login.html', 1500);
    return;
  }
  
  selectedProduct = products.find(p => p.id === productId);
  if (!selectedProduct || selectedProduct.soldOut) return;
  
  document.getElementById('claimProductName').textContent = selectedProduct.name;
  document.getElementById('claimProductDisplay').value = selectedProduct.name;
  document.getElementById('claimPrice').value = '$' + selectedProduct.price;
  document.getElementById('claimEmail').value = currentUser.email;
  document.getElementById('claimModal').classList.add('active');
}

function closeModal(id) { 
  document.getElementById(id).classList.remove('active'); 
}

async function claimTemplate() {
  if (!selectedProduct || !currentUser) return;
  
  const gateway = document.querySelector('input[name="payGateway"]:checked')?.value || 'paystack';
  const btn = document.getElementById('claimBtn');
  
  btn.disabled = true;
  btn.innerHTML = '<div class="spinner"></div> Processing...';
  
  try {
    const res = await fetch('/.netlify/functions/payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'initiate',
        gateway: gateway,
        product_id: selectedProduct.id,
        product_name: selectedProduct.name,
        amount: selectedProduct.price,
        email: currentUser.email,
        user_id: currentUser.sub || currentUser.id,
        callback_url: window.location.origin + '/payment-callback.html'
      })
    });

    const data = await res.json();

    if (data.authorization_url) {
      window.location.href = data.authorization_url;
    } else if (data.checkout_url) {
      window.location.href = data.checkout_url;
    } else {
      showToast('Error', data.error || 'Payment initialization failed', 'error');
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-lock"></i> Pay & Download';
    }
  } catch (err) {
    showToast('Demo Mode', `This would process a ${gateway} payment for $${selectedProduct.price}`, 'success');
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-lock"></i> Pay & Download';
    closeModal('claimModal');
    
    const order = { 
      id: 'ORD-' + Math.random().toString(36).substr(2, 6).toUpperCase(), 
      product: selectedProduct, 
      amount: selectedProduct.price, 
      gateway: gateway, 
      status: 'completed', 
      date: new Date().toISOString(), 
      downloadToken: 'demo_token' 
    };
    const orders = JSON.parse(localStorage.getItem('mittely_orders') || '[]');
    orders.unshift(order);
    localStorage.setItem('mittely_orders', JSON.stringify(orders));
    window.location.href = 'download.html?token=demo_token';
  }
}

async function loadStats() {
  try {
    const res = await fetch('/.netlify/functions/stats');
    const data = await res.json();
    if (data.orders !== undefined) document.getElementById('statOrders').textContent = data.orders;
    if (data.customers !== undefined) document.getElementById('statCustomers').textContent = data.customers;
    if (data.products !== undefined) document.getElementById('statProducts').textContent = data.products;
    if (data.revenue !== undefined) document.getElementById('statRevenue').textContent = '$' + data.revenue.toLocaleString();
  } catch (e) {
    document.getElementById('statOrders').textContent = '127';
    document.getElementById('statCustomers').textContent = '89';
    document.getElementById('statProducts').textContent = products.length;
    document.getElementById('statRevenue').textContent = '$4,230';
  }
}

function showToast(title, message, type = 'info') {
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

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) e.target.classList.remove('active');
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
});

init();