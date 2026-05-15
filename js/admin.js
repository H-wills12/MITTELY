// MITTELY Admin Panel - Complete Product Management System

let products = [];
let discounts = [];
let orders = [];
let customers = [];
let currentFilter = 'all';

// Initialize demo products
function initDemoProducts() {
  products = [
    { id: '1', name: 'SaaS Launch Pro', slug: 'saas-launch-pro', price: 49, category: 'Template', language: 'HTML/CSS/JS', fileSize: '2.1 MB', description: 'A high-converting SaaS landing page with pricing tables, feature grids, and testimonial sections.', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop', liveUrl: 'https://example.com/saas', zipUrl: '', zipSize: '', active: true, soldOut: false, featured: true, new: true, downloads: 127, rating: 4.8 },
    { id: '2', name: 'E-Commerce Elite', slug: 'ecommerce-elite', price: 79, category: 'Template', language: 'HTML/CSS/JS', fileSize: '3.4 MB', description: 'Complete e-commerce landing page with product showcases, cart CTAs, and trust badges.', image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop', liveUrl: 'https://example.com/ecommerce', zipUrl: '', zipSize: '', active: true, soldOut: false, featured: true, new: false, downloads: 89, rating: 4.9 },
    { id: '3', name: 'App Landing Kit', slug: 'app-landing-kit', price: 39, category: 'UI Kit', language: 'React/Next.js', fileSize: '1.8 MB', description: 'Mobile app landing page with device mockups, app store buttons, and feature highlights.', image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop', liveUrl: 'https://example.com/app', zipUrl: '', zipSize: '', active: true, soldOut: false, featured: false, new: true, downloads: 234, rating: 4.7 }
  ];
}

// Initialize demo discounts
function initDemoDiscounts() {
  discounts = [
    { id: 'd1', code: 'WELCOME20', type: 'percentage', value: 20, validUntil: '2025-12-31', maxUses: 100, usedCount: 45, products: ['all'], active: true },
    { id: 'd2', code: 'SUMMER30', type: 'percentage', value: 30, validUntil: '2025-08-31', maxUses: 50, usedCount: 12, products: ['all'], active: true },
    { id: 'd3', code: 'FLASH15', type: 'fixed', value: 15, validUntil: '2025-06-30', maxUses: 200, usedCount: 78, products: ['all'], active: true }
  ];
}

// Check admin access
function checkAdminAccess() {
  const token = localStorage.getItem('mittely_token');
  const userStr = localStorage.getItem('mittely_user');

  if (!token || !userStr) {
    window.location.href = 'login.html';
    return false;
  }

  try {
    const currentUser = JSON.parse(userStr);
    if (currentUser.email === 'henryagyemang906@gmail.com') {
      document.getElementById('adminVerifyOverlay').style.display = 'flex';
      document.getElementById('adminName').textContent = currentUser.name || 'Admin';
      document.getElementById('adminEmail').textContent = currentUser.email;
      if (currentUser.picture) document.getElementById('adminAvatar').src = currentUser.picture;
      return true;
    } else {
      window.location.href = 'dashboard.html';
      return false;
    }
  } catch (e) {
    window.location.href = 'login.html';
    return false;
  }
}

function verifyAdminAccess() {
  const code = document.getElementById('adminVerifyCode').value;
  if (code === 'KINGSMAN906@ML') {
    document.getElementById('adminVerifyOverlay').style.display = 'none';
    document.getElementById('adminLayout').style.display = 'flex';
    loadDashboard();
    renderProductsTable();
    renderDiscountsList();
    loadOrders();
    loadCustomers();
    loadAnalytics();
  } else {
    showToast('Access Denied', 'Invalid verification code', 'error');
  }
}

function loadDashboard() {
  const totalRevenue = products.filter(p => p.active && !p.soldOut).reduce((sum, p) => sum + p.price, 0);
  const totalDownloads = products.reduce((sum, p) => sum + (p.downloads || 0), 0);
  const activeDiscounts = discounts.filter(d => d.active).length;
  const avgOrderValue = 65;
  
  document.getElementById('dashOrders').textContent = '127';
  document.getElementById('dashRevenue').textContent = '$' + totalRevenue.toLocaleString();
  document.getElementById('dashCustomers').textContent = '89';
  document.getElementById('dashProducts').textContent = products.length;
  document.getElementById('dashDownloads').textContent = totalDownloads;
  document.getElementById('dashActiveDiscounts').textContent = activeDiscounts;
  document.getElementById('dashConversionRate').textContent = '3.2%';
  document.getElementById('dashAvgOrder').textContent = '$' + avgOrderValue;
  document.getElementById('lastUpdated').textContent = new Date().toLocaleString();
  
  document.getElementById('recentOrdersTable').innerHTML = `
    <table class="data-table">
      <thead><tr><th>Order ID</th><th>Customer</th><th>Product</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
      <tbody>
        <tr><td>#ORD-001</td><td>john@example.com</td><td>SaaS Launch Pro</td><td>$49</td><td><span class="badge-success">Completed</span></td><td>2024-05-15</td></tr>
        <tr><td>#ORD-002</td><td>jane@example.com</td><td>E-Commerce Elite</td><td>$79</td><td><span class="badge-success">Completed</span></td><td>2024-05-14</td></tr>
        <tr><td>#ORD-003</td><td>mike@example.com</td><td>App Landing Kit</td><td>$39</td><td><span class="badge-warning">Pending</span></td><td>2024-05-13</td></tr>
      </tbody>
    </table>
  `;
}

function renderProductsTable() {
  const container = document.getElementById('productsTableContainer');
  if (!container) return;
  
  const search = document.getElementById('productSearch')?.value.toLowerCase() || '';
  let filtered = products.filter(p => p.name.toLowerCase().includes(search));
  
  if (currentFilter !== 'all') {
    filtered = filtered.filter(p => p.category === currentFilter);
  }
  
  container.innerHTML = `
    <table class="data-table">
      <thead>
        <tr>
          <th>Image</th><th>Name</th><th>Price</th><th>Category</th><th>Language</th><th>Downloads</th><th>Status</th><th>Live URL</th><th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${filtered.map(p => `
          <tr>
            <td><img src="${p.image}" style="width:50px;height:50px;object-fit:cover;border-radius:8px;"></td>
            <td><strong>${p.name}</strong><br><small>${p.slug}</small>
              ${p.featured ? '<span class="product-badge badge-featured"><i class="fas fa-star"></i> Featured</span>' : ''}
              ${p.new ? '<span class="product-badge" style="background:#10b981;color:white;"><i class="fas fa-newspaper"></i> New</span>' : ''}
            </td>
            <td>$${p.price}</td>
            <td>${p.category}</td>
            <td><span class="product-badge" style="background:rgba(99,102,241,0.1);">${p.language || 'HTML/CSS'}</span></td>
            <td>${p.downloads || 0}</td>
            <td>${p.soldOut ? '<span class="badge-danger">Sold Out</span>' : (p.active ? '<span class="badge-success">Active</span>' : '<span class="badge-warning">Inactive</span>')}</td>
            <td>${p.liveUrl ? `<a href="${p.liveUrl}" target="_blank" class="btn-text">View →</a>` : '-'}</td>
            <td>
              <button class="btn-icon" onclick="editProduct('${p.id}')" title="Edit"><i class="fas fa-edit"></i></button>
              <button class="btn-icon" onclick="toggleProductStatus('${p.id}')" title="${p.active ? 'Deactivate' : 'Activate'}"><i class="fas ${p.active ? 'fa-eye-slash' : 'fa-eye'}"></i></button>
              <button class="btn-icon" onclick="toggleSoldOut('${p.id}')" title="${p.soldOut ? 'Mark Available' : 'Mark Sold Out'}"><i class="fas ${p.soldOut ? 'fa-box-open' : 'fa-tag'}"></i></button>
              <button class="btn-icon" onclick="toggleFeatured('${p.id}')" title="Toggle Featured"><i class="fas ${p.featured ? 'fa-star' : 'fa-star-o'}"></i></button>
              <button class="btn-icon danger" onclick="deleteProduct('${p.id}')" title="Delete"><i class="fas fa-trash"></i></button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function filterByCategory(category) {
  currentFilter = category;
  renderProductsTable();
}

function openProductModal() {
  document.getElementById('productModalTitle').textContent = 'Add Product';
  document.getElementById('productForm').reset();
  document.getElementById('productId').value = '';
  document.getElementById('productActive').checked = true;
  document.getElementById('productSoldOut').checked = false;
  document.getElementById('productFeatured').checked = false;
  document.getElementById('productNew').checked = false;
  document.getElementById('zipFileInput').value = '';
  document.getElementById('productModal').classList.add('active');
}

function editProduct(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  
  document.getElementById('productModalTitle').textContent = 'Edit Product';
  document.getElementById('productId').value = p.id;
  document.getElementById('productName').value = p.name;
  document.getElementById('productSlug').value = p.slug;
  document.getElementById('productPrice').value = p.price;
  document.getElementById('productCategory').value = p.category;
  document.getElementById('productLanguage').value = p.language || '';
  document.getElementById('productFileSize').value = p.fileSize || '';
  document.getElementById('productDesc').value = p.description || '';
  document.getElementById('productImage').value = p.image || '';
  document.getElementById('productLiveUrl').value = p.liveUrl || '';
  document.getElementById('productZipUrl').value = p.zipUrl || '';
  document.getElementById('productZipSize').value = p.zipSize || '';
  document.getElementById('productActive').checked = p.active;
  document.getElementById('productSoldOut').checked = p.soldOut || false;
  document.getElementById('productFeatured').checked = p.featured || false;
  document.getElementById('productNew').checked = p.new || false;
  document.getElementById('productModal').classList.add('active');
}

function handleZipUpload(event) {
  const file = event.target.files[0];
  if (file && file.name.endsWith('.zip')) {
    const zipUrl = URL.createObjectURL(file);
    document.getElementById('productZipUrl').value = zipUrl;
    document.getElementById('productZipSize').value = (file.size / 1024 / 1024).toFixed(2) + ' MB';
    showToast('File Ready', `ZIP file "${file.name}" ready for upload`, 'success');
  }
}

function saveProduct(e) {
  e.preventDefault();
  
  const id = document.getElementById('productId').value;
  const payload = {
    id: id || Date.now().toString(),
    name: document.getElementById('productName').value,
    slug: document.getElementById('productSlug').value,
    price: parseFloat(document.getElementById('productPrice').value),
    category: document.getElementById('productCategory').value,
    language: document.getElementById('productLanguage').value,
    fileSize: document.getElementById('productFileSize').value,
    description: document.getElementById('productDesc').value,
    image: document.getElementById('productImage').value,
    liveUrl: document.getElementById('productLiveUrl').value,
    zipUrl: document.getElementById('productZipUrl').value,
    zipSize: document.getElementById('productZipSize').value,
    active: document.getElementById('productActive').checked,
    soldOut: document.getElementById('productSoldOut').checked,
    featured: document.getElementById('productFeatured').checked,
    new: document.getElementById('productNew').checked,
    downloads: id ? products.find(p => p.id === id)?.downloads || 0 : 0,
    rating: id ? products.find(p => p.id === id)?.rating || 4.5 : 4.5
  };
  
  if (id) {
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) products[index] = payload;
  } else {
    products.push(payload);
  }
  
  localStorage.setItem('mittely_products', JSON.stringify(products));
  renderProductsTable();
  closeModal('productModal');
  showToast('Success', 'Product saved successfully', 'success');
}

function toggleProductStatus(id) {
  const p = products.find(x => x.id === id);
  if (p) { p.active = !p.active; renderProductsTable(); showToast('Updated', `Product ${p.active ? 'activated' : 'deactivated'}`, 'success'); }
}

function toggleSoldOut(id) {
  const p = products.find(x => x.id === id);
  if (p) { p.soldOut = !p.soldOut; renderProductsTable(); showToast('Updated', `Product ${p.soldOut ? 'sold out' : 'available'}`, 'success'); }
}

function toggleFeatured(id) {
  const p = products.find(x => x.id === id);
  if (p) { p.featured = !p.featured; renderProductsTable(); showToast('Updated', `Product ${p.featured ? 'featured' : 'unfeatured'}`, 'success'); }
}

function deleteProduct(id) {
  if (confirm('Delete this product? This action cannot be undone.')) {
    products = products.filter(p => p.id !== id);
    renderProductsTable();
    showToast('Deleted', 'Product removed successfully', 'success');
  }
}

function filterProducts() { renderProductsTable(); }

// Discount Functions
function openDiscountModal() {
  document.getElementById('discountForm').reset();
  document.getElementById('discountModal').classList.add('active');
  
  const productSelect = document.getElementById('discountProducts');
  productSelect.innerHTML = '<option value="all">All Products</option>' + 
    products.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
}

function saveDiscount(e) {
  e.preventDefault();
  const discount = {
    id: Date.now().toString(),
    code: document.getElementById('discountCode').value.toUpperCase(),
    type: document.getElementById('discountType').value,
    value: parseFloat(document.getElementById('discountValue').value),
    validUntil: document.getElementById('discountExpiry').value,
    maxUses: parseInt(document.getElementById('discountMaxUses').value),
    usedCount: 0,
    products: Array.from(document.getElementById('discountProducts').selectedOptions).map(opt => opt.value),
    active: true
  };
  
  discounts.push(discount);
  localStorage.setItem('mittely_discounts', JSON.stringify(discounts));
  renderDiscountsList();
  closeModal('discountModal');
  showToast('Success', `Discount code "${discount.code}" created`, 'success');
}

function renderDiscountsList() {
  const container = document.getElementById('discountsList');
  if (!container) return;
  
  container.innerHTML = discounts.map(d => `
    <div class="discount-item">
      <div>
        <span class="discount-code">${d.code}</span>
        <div><small>${d.type === 'percentage' ? d.value + '% off' : '$' + d.value + ' off'}</small></div>
        <div><small>Used: ${d.usedCount}/${d.maxUses}</small></div>
      </div>
      <div>
        <button class="btn-icon" onclick="deleteDiscount('${d.id}')" title="Delete"><i class="fas fa-trash"></i></button>
      </div>
    </div>
  `).join('');
}

function deleteDiscount(id) {
  discounts = discounts.filter(d => d.id !== id);
  renderDiscountsList();
  showToast('Deleted', 'Discount code removed', 'success');
}

function loadOrders() {
  const container = document.getElementById('ordersTableContainer');
  if (!container) return;
  container.innerHTML = `<table class="data-table"><thead><tr><th>Order ID</th><th>Customer</th><th>Product</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
    <tbody><tr><td colspan="6" class="empty-state">No orders yet</td></tr></tbody></table>`;
}

function filterOrders() { loadOrders(); }
function loadCustomers() { document.getElementById('customersTableContainer').innerHTML = '<p class="empty-state">No customers yet</p>'; }
function filterCustomers() { loadCustomers(); }

function loadAnalytics() {
  const totalViews = 15420;
  const uniqueVisitors = 3420;
  const totalSales = 127;
  const totalRevenue = products.reduce((sum, p) => sum + ((p.downloads || 0) * p.price), 0);
  
  document.getElementById('analyticsViews').textContent = totalViews.toLocaleString();
  document.getElementById('analyticsUnique').textContent = uniqueVisitors.toLocaleString();
  document.getElementById('analyticsSales').textContent = totalSales;
  document.getElementById('analyticsRevenue').textContent = '$' + totalRevenue.toLocaleString();
  
  const topProducts = products.sort((a, b) => (b.downloads || 0) - (a.downloads || 0)).slice(0, 5);
  document.getElementById('topProducts').innerHTML = `
    <table class="data-table"><thead><tr><th>Product</th><th>Sales</th><th>Revenue</th></tr></thead>
    <tbody>${topProducts.map(p => `
      <tr><td>${p.name}</td><td>${p.downloads || 0}</td><td>$${((p.downloads || 0) * p.price).toLocaleString()}</td></tr>
    `).join('')}</tbody></table>
  `;
}

function saveSettings() { 
  const settings = {
    site_name: document.getElementById('settingSiteName').value,
    tagline: document.getElementById('settingTagline').value,
    currency: document.getElementById('settingCurrency').value,
    meta_keywords: document.getElementById('settingKeywords').value,
    meta_description: document.getElementById('settingDescription').value,
    default_discount: document.getElementById('defaultDiscount').value
  };
  localStorage.setItem('mittely_settings', JSON.stringify(settings));
  showToast('Success', 'Settings saved', 'success'); 
}

function closeModal(id) { document.getElementById(id).classList.remove('active'); }
function logout() { localStorage.clear(); window.location.href = 'index.html'; }

function showToast(title, message, type) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<div class="toast-icon"><i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i></div><div><h4>${title}</h4><p>${message}</p></div>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Make functions global
window.openProductModal = openProductModal;
window.editProduct = editProduct;
window.saveProduct = saveProduct;
window.toggleProductStatus = toggleProductStatus;
window.toggleSoldOut = toggleSoldOut;
window.toggleFeatured = toggleFeatured;
window.deleteProduct = deleteProduct;
window.filterProducts = filterProducts;
window.filterByCategory = filterByCategory;
window.openDiscountModal = openDiscountModal;
window.saveDiscount = saveDiscount;
window.deleteDiscount = deleteDiscount;
window.filterOrders = filterOrders;
window.filterCustomers = filterCustomers;
window.saveSettings = saveSettings;
window.closeModal = closeModal;
window.logout = logout;
window.verifyAdminAccess = verifyAdminAccess;
window.handleZipUpload = handleZipUpload;

// Navigation
document.querySelectorAll('.admin-nav a').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const tab = link.getAttribute('data-tab');
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.add('hidden'));
    document.getElementById('tab-' + tab).classList.remove('hidden');
    document.querySelectorAll('.admin-nav a').forEach(a => a.classList.remove('active'));
    link.classList.add('active');
    if (tab === 'analytics') loadAnalytics();
  });
});

// Drag and drop for ZIP upload
const uploadArea = document.getElementById('uploadArea');
if (uploadArea) {
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
  });
  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('drag-over');
  });
  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.zip')) {
      const zipUrl = URL.createObjectURL(file);
      document.getElementById('productZipUrl').value = zipUrl;
      document.getElementById('productZipSize').value = (file.size / 1024 / 1024).toFixed(2) + ' MB';
      showToast('File Ready', `ZIP file "${file.name}" ready`, 'success');
    } else {
      showToast('Error', 'Please upload a ZIP file', 'error');
    }
  });
}

// Initialize
initDemoProducts();
initDemoDiscounts();
checkAdminAccess();
