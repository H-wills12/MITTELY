let products = [
  { id: '1', name: 'SaaS Launch Pro', slug: 'saas-launch-pro', price: 49, category: 'Template', active: true, soldOut: false, image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=100&h=100&fit=crop', liveUrl: 'https://example.com/saas', description: 'A high-converting SaaS landing page' },
  { id: '2', name: 'E-Commerce Elite', slug: 'ecommerce-elite', price: 79, category: 'Template', active: true, soldOut: false, image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=100&h=100&fit=crop', liveUrl: 'https://example.com/ecommerce', description: 'Complete e-commerce landing page' },
  { id: '3', name: 'App Landing Kit', slug: 'app-landing-kit', price: 39, category: 'UI Kit', active: true, soldOut: false, image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=100&h=100&fit=crop', liveUrl: 'https://example.com/app', description: 'Mobile app landing page' },
  { id: '4', name: 'Portfolio Master', slug: 'portfolio-master', price: 29, category: 'Template', active: true, soldOut: false, image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=100&h=100&fit=crop', liveUrl: 'https://example.com/portfolio', description: 'Clean portfolio template' },
  { id: '5', name: 'Neomorphic UI Pack', slug: 'neomorphic-ui', price: 45, category: 'UI Kit', active: true, soldOut: false, image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=100&h=100&fit=crop', liveUrl: 'https://example.com/neomorphic', description: 'Modern neomorphic UI components' },
  { id: '6', name: '3D Illustrations Pack', slug: '3d-illustrations', price: 59, category: 'Illustration', active: true, soldOut: false, image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=100&h=100&fit=crop', liveUrl: 'https://example.com/3d', description: 'Premium 3D illustrations' }
];

let currentUser = null;

function checkAdminAccess() {
  const token = localStorage.getItem('mittely_token');
  const userStr = localStorage.getItem('mittely_user');

  if (!token || !userStr) {
    window.location.href = 'login.html';
    return false;
  }

  try {
    currentUser = JSON.parse(userStr);
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
    loadOrders();
    loadCustomers();
  } else {
    showToast('Access Denied', 'Invalid verification code', 'error');
  }
}

function loadDashboard() {
  const totalRevenue = products.filter(p => p.active && !p.soldOut).reduce((sum, p) => sum + p.price, 0);
  const activeProducts = products.filter(p => p.active && !p.soldOut).length;
  
  document.getElementById('dashOrders').textContent = '127';
  document.getElementById('dashRevenue').textContent = '$' + totalRevenue.toLocaleString();
  document.getElementById('dashCustomers').textContent = '89';
  document.getElementById('dashProducts').textContent = activeProducts;
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
  const search = document.getElementById('productSearch')?.value.toLowerCase() || '';
  const filtered = products.filter(p => p.name.toLowerCase().includes(search));

  if (!container) return;

  container.innerHTML = `
    <table class="data-table">
      <thead>
        <tr>
          <th>Image</th>
          <th>Name</th>
          <th>Price</th>
          <th>Category</th>
          <th>Status</th>
          <th>Live URL</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${filtered.map(p => `
          <tr>
            <td><img src="${p.image}" style="width:40px;height:40px;object-fit:cover;border-radius:8px;"></td>
            <td><strong>${p.name}</strong><br><small>${p.slug}</small></td>
            <td>$${p.price}</td>
            <td><span class="badge-info">${p.category}</span></td>
            <td>${p.soldOut ? '<span class="badge-danger">Sold Out</span>' : (p.active ? '<span class="badge-success">Active</span>' : '<span class="badge-warning">Inactive</span>')}</td>
            <td>${p.liveUrl ? `<a href="${p.liveUrl}" target="_blank" class="btn-text">View →</a>` : '-'}</td>
            <td>
              <button class="btn-icon" onclick="editProduct('${p.id}')" title="Edit"><i class="fas fa-edit"></i></button>
              <button class="btn-icon" onclick="toggleProductStatus('${p.id}')" title="${p.active ? 'Deactivate' : 'Activate'}"><i class="fas ${p.active ? 'fa-eye-slash' : 'fa-eye'}"></i></button>
              <button class="btn-icon" onclick="toggleSoldOut('${p.id}')" title="${p.soldOut ? 'Mark Available' : 'Mark Sold Out'}"><i class="fas ${p.soldOut ? 'fa-box-open' : 'fa-tag'}"></i></button>
              <button class="btn-icon danger" onclick="deleteProduct('${p.id}')" title="Delete"><i class="fas fa-trash"></i></button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function openProductModal() {
  document.getElementById('productModalTitle').textContent = 'Add Product';
  document.getElementById('productForm').reset();
  document.getElementById('productId').value = '';
  document.getElementById('productActive').checked = true;
  document.getElementById('productSoldOut').checked = false;
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
  document.getElementById('productDesc').value = p.description || '';
  document.getElementById('productImage').value = p.image || '';
  document.getElementById('productLiveUrl').value = p.liveUrl || '';
  document.getElementById('productActive').checked = p.active;
  document.getElementById('productSoldOut').checked = p.soldOut || false;
  document.getElementById('productModal').classList.add('active');
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
    description: document.getElementById('productDesc').value,
    image: document.getElementById('productImage').value,
    liveUrl: document.getElementById('productLiveUrl').value,
    active: document.getElementById('productActive').checked,
    soldOut: document.getElementById('productSoldOut').checked
  };
  
  if (id) {
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) products[index] = payload;
  } else {
    products.push(payload);
  }
  
  // Also update the global products array in app.js if it exists
  if (typeof window.updateStoreProducts === 'function') {
    window.updateStoreProducts(products);
  }
  
  renderProductsTable();
  closeModal('productModal');
  showToast('Success', 'Product saved successfully', 'success');
}

function toggleProductStatus(id) {
  const p = products.find(x => x.id === id);
  if (p) { 
    p.active = !p.active; 
    renderProductsTable(); 
    showToast('Updated', `Product ${p.active ? 'activated' : 'deactivated'}`, 'success');
    
    // Update store products if function exists
    if (typeof window.updateStoreProducts === 'function') {
      window.updateStoreProducts(products);
    }
  }
}

function toggleSoldOut(id) {
  const p = products.find(x => x.id === id);
  if (p) { 
    p.soldOut = !p.soldOut; 
    renderProductsTable(); 
    showToast('Updated', `Product marked as ${p.soldOut ? 'sold out' : 'available'}`, 'success');
    
    // Update store products if function exists
    if (typeof window.updateStoreProducts === 'function') {
      window.updateStoreProducts(products);
    }
  }
}

function deleteProduct(id) {
  if (confirm('Delete this product? This action cannot be undone.')) {
    products = products.filter(p => p.id !== id);
    renderProductsTable();
    showToast('Deleted', 'Product removed successfully', 'success');
    
    // Update store products if function exists
    if (typeof window.updateStoreProducts === 'function') {
      window.updateStoreProducts(products);
    }
  }
}

function setAllProductsActive(active) {
  products.forEach(p => {
    if (!p.soldOut) p.active = active;
  });
  renderProductsTable();
  showToast('Updated', `All products ${active ? 'activated' : 'deactivated'}`, 'success');
  
  // Update store products if function exists
  if (typeof window.updateStoreProducts === 'function') {
    window.updateStoreProducts(products);
  }
}

function filterProducts() { 
  renderProductsTable(); 
}

function loadOrders() { 
  const container = document.getElementById('ordersTableContainer');
  if (!container) return;
  
  container.innerHTML = `
    <table class="data-table">
      <thead>
        <tr>
          <th>Order ID</th>
          <th>Customer</th>
          <th>Product</th>
          <th>Amount</th>
          <th>Gateway</th>
          <th>Status</th>
          <th>Date</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>#ORD-7X9K2M</td>
          <td>john.doe@example.com</td>
          <td>SaaS Launch Pro</td>
          <td>$49.00</td>
          <td><span class="gateway-badge paystack">Paystack</span></td>
          <td><span class="badge-success">Completed</span></td>
          <td>2024-05-12</td>
          <td><button class="btn btn-sm btn-outline" onclick="viewOrder('ORD-7X9K2M')">View</button></td>
        </tr>
        <tr>
          <td>#ORD-3P8N1Q</td>
          <td>jane.smith@example.com</td>
          <td>E-Commerce Elite</td>
          <td>$79.00</td>
          <td><span class="gateway-badge heleket">Heleket</span></td>
          <td><span class="badge-success">Completed</span></td>
          <td>2024-05-10</td>
          <td><button class="btn btn-sm btn-outline" onclick="viewOrder('ORD-3P8N1Q')">View</button></td>
        </tr>
        <tr>
          <td>#ORD-9R2L4W</td>
          <td>mike.wilson@example.com</td>
          <td>App Landing Kit</td>
          <td>$39.00</td>
          <td><span class="gateway-badge paystack">Paystack</span></td>
          <td><span class="badge-warning">Pending</span></td>
          <td>2024-05-13</td>
          <td><button class="btn btn-sm btn-outline" onclick="viewOrder('ORD-9R2L4W')">View</button></td>
        </tr>
      </tbody>
    </table>
  `;
}

function loadCustomers() { 
  const container = document.getElementById('customersTableContainer');
  if (!container) return;
  
  container.innerHTML = `
    <table class="data-table">
      <thead>
        <tr>
          <th>Customer</th>
          <th>Email</th>
          <th>Orders</th>
          <th>Total Spent</th>
          <th>Joined</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>John Doe</strong></td>
          <td>john.doe@example.com</td>
          <td>3</td>
          <td>$147.00</td>
          <td>2024-01-15</td>
          <td><span class="badge-success">Active</span></td>
        </tr>
        <tr>
          <td><strong>Jane Smith</strong></td>
          <td>jane.smith@example.com</td>
          <td>2</td>
          <td>$128.00</td>
          <td>2024-02-20</td>
          <td><span class="badge-success">Active</span></td>
        </tr>
        <tr>
          <td><strong>Mike Wilson</strong></td>
          <td>mike.wilson@example.com</td>
          <td>1</td>
          <td>$39.00</td>
          <td>2024-03-10</td>
          <td><span class="badge-warning">Pending</span></td>
        </tr>
      </tbody>
    </table>
  `;
}

function viewOrder(orderId) {
  showToast('Order Details', `Viewing order ${orderId}`, 'info');
}

function saveSettings() { 
  const siteName = document.getElementById('settingSiteName')?.value || 'MITTELY';
  const tagline = document.getElementById('settingTagline')?.value || '';
  const currency = document.getElementById('settingCurrency')?.value || 'USD';
  const gateway = document.querySelector('input[name="gateway"]:checked')?.value || 'paystack';
  
  // Save to localStorage for demo
  localStorage.setItem('mittely_settings', JSON.stringify({
    site_name: siteName,
    tagline: tagline,
    currency: currency,
    gateway: gateway
  }));
  
  showToast('Success', 'Settings saved successfully', 'success'); 
}

function closeModal(id) { 
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('active'); 
}

function logout() { 
  localStorage.removeItem('mittely_token');
  localStorage.removeItem('mittely_user');
  localStorage.removeItem('mittely_orders');
  window.location.href = 'index.html'; 
}

function showToast(title, message, type) {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle', warning: 'fa-exclamation-triangle' };
  toast.innerHTML = `<div class="toast-icon"><i class="fas ${icons[type] || icons.info}"></i></div><div><h4>${title}</h4><p>${message}</p></div>`;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => { 
    toast.classList.remove('show'); 
    setTimeout(() => toast.remove(), 400); 
  }, 4000);
}

// Make functions globally available
window.openProductModal = openProductModal;
window.editProduct = editProduct;
window.saveProduct = saveProduct;
window.toggleProductStatus = toggleProductStatus;
window.toggleSoldOut = toggleSoldOut;
window.deleteProduct = deleteProduct;
window.setAllProductsActive = setAllProductsActive;
window.filterProducts = filterProducts;
window.viewOrder = viewOrder;
window.saveSettings = saveSettings;
window.closeModal = closeModal;
window.logout = logout;
window.verifyAdminAccess = verifyAdminAccess;

// Setup navigation
document.querySelectorAll('.admin-nav a').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const tab = link.getAttribute('data-tab');
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.add('hidden'));
    const targetTab = document.getElementById('tab-' + tab);
    if (targetTab) targetTab.classList.remove('hidden');
    document.querySelectorAll('.admin-nav a').forEach(a => a.classList.remove('active'));
    link.classList.add('active');
  });
});

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', checkAdminAccess);
} else {
  checkAdminAccess();
}
