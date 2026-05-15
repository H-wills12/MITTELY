// MITTELY Admin Panel - Complete Working Code

let products = [];
let discounts = [];
let orders = [];
let customers = [];
let currentUser = null;

// ============ INITIALIZATION ============
function initDemoData() {
  // Demo Products
  products = [
    {
      id: 'prod_1',
      name: 'SaaS Launch Pro',
      slug: 'saas-launch-pro',
      price: 49,
      category: 'Template',
      language: 'HTML/CSS/JS',
      fileSize: '2.1 MB',
      description: 'A high-converting SaaS landing page with pricing tables, feature grids, and testimonial sections.',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
      liveUrl: 'https://example.com/saas',
      zipUrl: '',
      active: true,
      featured: true,
      new: true,
      soldOut: false,
      downloads: 127,
      sales: 127,
      rating: 4.8,
      createdAt: new Date().toISOString()
    },
    {
      id: 'prod_2',
      name: 'E-Commerce Elite',
      slug: 'ecommerce-elite',
      price: 79,
      category: 'Template',
      language: 'HTML/CSS/JS',
      fileSize: '3.4 MB',
      description: 'Complete e-commerce landing page with product showcases, cart CTAs, and trust badges.',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop',
      liveUrl: 'https://example.com/ecommerce',
      zipUrl: '',
      active: true,
      featured: true,
      new: false,
      soldOut: false,
      downloads: 89,
      sales: 89,
      rating: 4.9,
      createdAt: new Date().toISOString()
    },
    {
      id: 'prod_3',
      name: 'App Landing Kit',
      slug: 'app-landing-kit',
      price: 39,
      category: 'UI Kit',
      language: 'React/Next.js',
      fileSize: '1.8 MB',
      description: 'Mobile app landing page with device mockups, app store buttons, and feature highlights.',
      image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop',
      liveUrl: 'https://example.com/app',
      zipUrl: '',
      active: true,
      featured: false,
      new: true,
      soldOut: false,
      downloads: 234,
      sales: 234,
      rating: 4.7,
      createdAt: new Date().toISOString()
    },
    {
      id: 'prod_4',
      name: 'Neomorphic UI Pack',
      slug: 'neomorphic-ui',
      price: 45,
      category: 'UI Kit',
      language: 'CSS/HTML',
      fileSize: '4.2 MB',
      description: '400+ neomorphic UI components for modern web applications.',
      image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=400&h=300&fit=crop',
      liveUrl: 'https://example.com/neomorphic',
      zipUrl: '',
      active: true,
      featured: true,
      new: false,
      soldOut: false,
      downloads: 56,
      sales: 56,
      rating: 4.6,
      createdAt: new Date().toISOString()
    },
    {
      id: 'prod_5',
      name: '3D Illustrations Pack',
      slug: '3d-illustrations',
      price: 59,
      category: 'Illustration',
      language: 'PNG/SVG',
      fileSize: '15.6 MB',
      description: '50+ premium 3D illustrations for websites and presentations.',
      image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop',
      liveUrl: 'https://example.com/3d',
      zipUrl: '',
      active: true,
      featured: false,
      new: true,
      soldOut: false,
      downloads: 45,
      sales: 45,
      rating: 4.9,
      createdAt: new Date().toISOString()
    },
    {
      id: 'prod_6',
      name: 'Glassmorphism UI Kit',
      slug: 'glassmorphism-ui',
      price: 35,
      category: 'UI Kit',
      language: 'HTML/CSS',
      fileSize: '2.3 MB',
      description: 'Modern glassmorphism UI components with frosted glass effects.',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=300&fit=crop',
      liveUrl: 'https://example.com/glassmorphism',
      zipUrl: '',
      active: true,
      featured: true,
      new: true,
      soldOut: false,
      downloads: 112,
      sales: 112,
      rating: 4.8,
      createdAt: new Date().toISOString()
    }
  ];

  // Demo Discounts
  discounts = [
    {
      id: 'disc_1',
      code: 'WELCOME20',
      type: 'percentage',
      value: 20,
      validUntil: '2025-12-31',
      maxUses: 100,
      usedCount: 45,
      allProducts: true,
      active: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'disc_2',
      code: 'SUMMER30',
      type: 'percentage',
      value: 30,
      validUntil: '2025-08-31',
      maxUses: 50,
      usedCount: 12,
      allProducts: true,
      active: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'disc_3',
      code: 'FLASH15',
      type: 'fixed',
      value: 15,
      validUntil: '2025-06-30',
      maxUses: 200,
      usedCount: 78,
      allProducts: true,
      active: true,
      createdAt: new Date().toISOString()
    }
  ];

  // Demo Orders
  orders = [
    { id: 'ORD-001', customer: 'john@example.com', customerName: 'John Doe', product: 'SaaS Launch Pro', amount: 49, status: 'completed', date: '2024-05-15', gateway: 'paystack' },
    { id: 'ORD-002', customer: 'jane@example.com', customerName: 'Jane Smith', product: 'E-Commerce Elite', amount: 79, status: 'completed', date: '2024-05-14', gateway: 'heleket' },
    { id: 'ORD-003', customer: 'mike@example.com', customerName: 'Mike Wilson', product: 'App Landing Kit', amount: 39, status: 'pending', date: '2024-05-13', gateway: 'paystack' }
  ];

  // Demo Customers
  customers = [
    { id: 'cust_1', name: 'John Doe', email: 'john@example.com', orders: 3, totalSpent: 147, joined: '2024-01-15' },
    { id: 'cust_2', name: 'Jane Smith', email: 'jane@example.com', orders: 2, totalSpent: 128, joined: '2024-02-20' },
    { id: 'cust_3', name: 'Mike Wilson', email: 'mike@example.com', orders: 1, totalSpent: 39, joined: '2024-03-10' }
  ];
}

// ============ ADMIN VERIFICATION ============
function verifyAdmin() {
  const code = document.getElementById('adminCode').value;
  if (code === 'KINGSMAN906@ML') {
    document.getElementById('adminVerifyOverlay').style.display = 'none';
    initAdmin();
  } else {
    alert('Invalid verification code');
  }
}

function initAdmin() {
  // Check if user is logged in with admin email
  const userStr = localStorage.getItem('mittely_user');
  if (!userStr) {
    window.location.href = 'login.html';
    return;
  }
  
  try {
    currentUser = JSON.parse(userStr);
    if (currentUser.email !== 'henryagyemang906@gmail.com') {
      window.location.href = 'dashboard.html';
      return;
    }
    
    // Set admin info
    document.getElementById('adminName').textContent = currentUser.name || 'Admin';
    document.getElementById('adminEmail').textContent = currentUser.email;
    if (currentUser.picture) document.getElementById('adminAvatar').src = currentUser.picture;
    
    // Load data from localStorage or init demo
    const savedProducts = localStorage.getItem('mittely_products');
    if (savedProducts) {
      products = JSON.parse(savedProducts);
    } else {
      initDemoData();
      saveAllData();
    }
    
    loadDashboard();
    renderProducts();
    renderDiscounts();
    renderOrders();
    renderCustomers();
    loadAnalytics();
    
    // Update dashboard time
    updateDateTime();
    setInterval(updateDateTime, 1000);
  } catch(e) {
    console.error(e);
  }
}

function updateDateTime() {
  const now = new Date();
  document.getElementById('dashboardTime').textContent = now.toLocaleString();
}

function saveAllData() {
  localStorage.setItem('mittely_products', JSON.stringify(products));
  localStorage.setItem('mittely_discounts', JSON.stringify(discounts));
  localStorage.setItem('mittely_orders', JSON.stringify(orders));
  localStorage.setItem('mittely_customers', JSON.stringify(customers));
}

// ============ DASHBOARD ============
function loadDashboard() {
  const totalProducts = products.length;
  const totalSales = products.reduce((sum, p) => sum + (p.sales || 0), 0);
  const totalRevenue = products.reduce((sum, p) => sum + ((p.sales || 0) * p.price), 0);
  const totalCustomers = customers.length;
  const totalDownloads = products.reduce((sum, p) => sum + (p.downloads || 0), 0);
  const activeDiscounts = discounts.filter(d => d.active).length;
  
  document.getElementById('totalProducts').textContent = totalProducts;
  document.getElementById('totalSales').textContent = totalSales;
  document.getElementById('totalRevenue').textContent = '$' + totalRevenue.toLocaleString();
  document.getElementById('totalCustomers').textContent = totalCustomers;
  document.getElementById('totalDownloads').textContent = totalDownloads;
  document.getElementById('activeDiscounts').textContent = activeDiscounts;
  
  // Recent Orders
  const recentOrdersHtml = `
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="border-bottom: 1px solid var(--border);">
          <th style="padding: 0.75rem; text-align: left;">Order ID</th>
          <th style="padding: 0.75rem; text-align: left;">Customer</th>
          <th style="padding: 0.75rem; text-align: left;">Product</th>
          <th style="padding: 0.75rem; text-align: left;">Amount</th>
          <th style="padding: 0.75rem; text-align: left;">Status</th>
          <th style="padding: 0.75rem; text-align: left;">Date</th>
        </tr>
      </thead>
      <tbody>
        ${orders.slice(0, 5).map(order => `
          <tr style="border-bottom: 1px solid var(--border);">
            <td style="padding: 0.75rem;">${order.id}</td>
            <td style="padding: 0.75rem;">${order.customerName}</td>
            <td style="padding: 0.75rem;">${order.product}</td>
            <td style="padding: 0.75rem;">$${order.amount}</td>
            <td style="padding: 0.75rem;"><span class="badge ${order.status === 'completed' ? 'badge-success' : 'badge-warning'}">${order.status}</span></td>
            <td style="padding: 0.75rem;">${order.date}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  document.getElementById('recentOrdersList').innerHTML = recentOrdersHtml;
}

// ============ PRODUCTS CRUD ============
function renderProducts() {
  const searchTerm = document.getElementById('productSearch')?.value.toLowerCase() || '';
  const filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm));
  
  const productsHtml = filtered.map(product => `
    <div class="product-card">
      <div class="product-image" style="background-image: url('${product.image}');">
        <div class="product-badges">
          ${product.featured ? '<span class="badge badge-info">Featured</span>' : ''}
          ${product.new ? '<span class="badge badge-success">New</span>' : ''}
          ${product.soldOut ? '<span class="badge badge-danger">Sold Out</span>' : ''}
        </div>
      </div>
      <div class="product-info">
        <div class="product-title">${product.name}</div>
        <div class="product-price">$${product.price}</div>
        <div><small>Category: ${product.category}</small></div>
        <div><small>Language: ${product.language || 'HTML/CSS'}</small></div>
        <div><small>Downloads: ${product.downloads || 0}</small></div>
        <div class="product-actions">
          <button class="btn btn-outline btn-sm" onclick="editProduct('${product.id}')"><i class="fas fa-edit"></i> Edit</button>
          <button class="btn ${product.active ? 'btn-outline' : 'btn-primary'} btn-sm" onclick="toggleStatus('${product.id}')">${product.active ? 'Deactivate' : 'Activate'}</button>
          <button class="btn btn-danger btn-sm" onclick="deleteProduct('${product.id}')"><i class="fas fa-trash"></i> Delete</button>
        </div>
      </div>
    </div>
  `).join('');
  
  document.getElementById('productsList').innerHTML = productsHtml || '<p style="text-align: center; padding: 2rem;">No products found. Click "Add Product" to create one.</p>';
}

function openProductModal() {
  document.getElementById('productModalTitle').textContent = 'Add Product';
  document.getElementById('productForm').reset();
  document.getElementById('productId').value = '';
  document.getElementById('productActive').checked = true;
  document.getElementById('productFeatured').checked = false;
  document.getElementById('productNew').checked = false;
  document.getElementById('productSoldOut').checked = false;
  document.getElementById('productModal').classList.add('active');
}

function editProduct(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;
  
  document.getElementById('productModalTitle').textContent = 'Edit Product';
  document.getElementById('productId').value = product.id;
  document.getElementById('productName').value = product.name;
  document.getElementById('productSlug').value = product.slug;
  document.getElementById('productPrice').value = product.price;
  document.getElementById('productCategory').value = product.category;
  document.getElementById('productLanguage').value = product.language || '';
  document.getElementById('productFileSize').value = product.fileSize || '';
  document.getElementById('productDescription').value = product.description;
  document.getElementById('productImage').value = product.image;
  document.getElementById('productLiveUrl').value = product.liveUrl || '';
  document.getElementById('productZipUrl').value = product.zipUrl || '';
  document.getElementById('productActive').checked = product.active;
  document.getElementById('productFeatured').checked = product.featured;
  document.getElementById('productNew').checked = product.new;
  document.getElementById('productSoldOut').checked = product.soldOut;
  document.getElementById('productModal').classList.add('active');
}

function saveProduct(event) {
  event.preventDefault();
  
  const id = document.getElementById('productId').value;
  const productData = {
    id: id || 'prod_' + Date.now(),
    name: document.getElementById('productName').value,
    slug: document.getElementById('productSlug').value,
    price: parseFloat(document.getElementById('productPrice').value),
    category: document.getElementById('productCategory').value,
    language: document.getElementById('productLanguage').value,
    fileSize: document.getElementById('productFileSize').value,
    description: document.getElementById('productDescription').value,
    image: document.getElementById('productImage').value,
    liveUrl: document.getElementById('productLiveUrl').value,
    zipUrl: document.getElementById('productZipUrl').value,
    active: document.getElementById('productActive').checked,
    featured: document.getElementById('productFeatured').checked,
    new: document.getElementById('productNew').checked,
    soldOut: document.getElementById('productSoldOut').checked,
    downloads: 0,
    sales: 0,
    rating: 5.0,
    createdAt: new Date().toISOString()
  };
  
  if (id) {
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      productData.downloads = products[index].downloads;
      productData.sales = products[index].sales;
      products[index] = productData;
    }
  } else {
    products.push(productData);
  }
  
  saveAllData();
  renderProducts();
  loadDashboard();
  closeModal('productModal');
  showNotification('Product saved successfully!', 'success');
}

function toggleStatus(id) {
  const product = products.find(p => p.id === id);
  if (product) {
    product.active = !product.active;
    saveAllData();
    renderProducts();
    showNotification(`Product ${product.active ? 'activated' : 'deactivated'}`, 'success');
  }
}

function deleteProduct(id) {
  if (confirm('Are you sure you want to delete this product?')) {
    products = products.filter(p => p.id !== id);
    saveAllData();
    renderProducts();
    loadDashboard();
    showNotification('Product deleted', 'success');
  }
}

function filterProducts() {
  renderProducts();
}

function handleZipUpload(input) {
  const file = input.files[0];
  if (file && file.name.endsWith('.zip')) {
    // In a real app, upload to storage and get URL
    const fakeUrl = URL.createObjectURL(file);
    document.getElementById('productZipUrl').value = fakeUrl;
    showNotification(`ZIP file "${file.name}" ready (${(file.size / 1024 / 1024).toFixed(2)} MB)`, 'success');
  } else {
    showNotification('Please select a ZIP file', 'error');
  }
}

// ============ DISCOUNTS ============
function renderDiscounts() {
  const discountsHtml = `
    <div class="stats-grid">
      ${discounts.filter(d => d.active).map(discount => `
        <div class="stat-card">
          <div class="discount-code" style="font-size: 1.2rem; margin-bottom: 1rem;">${discount.code}</div>
          <div><strong>${discount.type === 'percentage' ? discount.value + '% OFF' : '$' + discount.value + ' OFF'}</strong></div>
          <div>Used: ${discount.usedCount}/${discount.maxUses}</div>
          <div>Valid until: ${discount.validUntil || 'Never'}</div>
          <div style="margin-top: 1rem;">
            <button class="btn btn-danger btn-sm" onclick="deleteDiscount('${discount.id}')">Delete</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
  document.getElementById('discountsList').innerHTML = discountsHtml || '<p>No discount codes yet. Create one!</p>';
}

function openDiscountModal() {
  document.getElementById('discountForm').reset();
  document.getElementById('discountModal').classList.add('active');
}

function saveDiscount(event) {
  event.preventDefault();
  
  const discount = {
    id: 'disc_' + Date.now(),
    code: document.getElementById('discountCode').value.toUpperCase(),
    type: document.getElementById('discountType').value,
    value: parseFloat(document.getElementById('discountValue').value),
    validUntil: document.getElementById('discountExpiry').value,
    maxUses: parseInt(document.getElementById('discountMaxUses').value),
    usedCount: 0,
    allProducts: document.getElementById('discountAllProducts').checked,
    active: true,
    createdAt: new Date().toISOString()
  };
  
  discounts.push(discount);
  saveAllData();
  renderDiscounts();
  closeModal('discountModal');
  showNotification(`Discount code "${discount.code}" created!`, 'success');
}

function deleteDiscount(id) {
  if (confirm('Delete this discount code?')) {
    discounts = discounts.filter(d => d.id !== id);
    saveAllData();
    renderDiscounts();
    showNotification('Discount deleted', 'success');
  }
}

// ============ ORDERS ============
function renderOrders() {
  const ordersHtml = `
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="border-bottom: 1px solid var(--border);">
          <th style="padding: 0.75rem; text-align: left;">Order ID</th>
          <th style="padding: 0.75rem; text-align: left;">Customer</th>
          <th style="padding: 0.75rem; text-align: left;">Product</th>
          <th style="padding: 0.75rem; text-align: left;">Amount</th>
          <th style="padding: 0.75rem; text-align: left;">Gateway</th>
          <th style="padding: 0.75rem; text-align: left;">Status</th>
          <th style="padding: 0.75rem; text-align: left;">Date</th>
        </tr>
      </thead>
      <tbody>
        ${orders.map(order => `
          <tr style="border-bottom: 1px solid var(--border);">
            <td style="padding: 0.75rem;">${order.id}</td>
            <td style="padding: 0.75rem;">${order.customerName}<br><small>${order.customer}</small></td>
            <td style="padding: 0.75rem;">${order.product}</td>
            <td style="padding: 0.75rem;">$${order.amount}</td>
            <td style="padding: 0.75rem;">${order.gateway}</td>
            <td style="padding: 0.75rem;"><span class="badge ${order.status === 'completed' ? 'badge-success' : 'badge-warning'}">${order.status}</span></td>
            <td style="padding: 0.75rem;">${order.date}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  document.getElementById('ordersList').innerHTML = ordersHtml;
}

// ============ CUSTOMERS ============
function renderCustomers() {
  const customersHtml = `
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="border-bottom: 1px solid var(--border);">
          <th style="padding: 0.75rem; text-align: left;">Name</th>
          <th style="padding: 0.75rem; text-align: left;">Email</th>
          <th style="padding: 0.75rem; text-align: left;">Orders</th>
          <th style="padding: 0.75rem; text-align: left;">Total Spent</th>
          <th style="padding: 0.75rem; text-align: left;">Joined</th>
        </tr>
      </thead>
      <tbody>
        ${customers.map(customer => `
          <tr style="border-bottom: 1px solid var(--border);">
            <td style="padding: 0.75rem;">${customer.name}</td>
            <td style="padding: 0.75rem;">${customer.email}</td>
            <td style="padding: 0.75rem;">${customer.orders}</td>
            <td style="padding: 0.75rem;">$${customer.totalSpent}</td>
            <td style="padding: 0.75rem;">${customer.joined}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  document.getElementById('customersList').innerHTML = customersHtml;
}

// ============ ANALYTICS ============
function loadAnalytics() {
  const totalProducts = products.length;
  const totalSales = products.reduce((sum, p) => sum + (p.sales || 0), 0);
  const totalRevenue = products.reduce((sum, p) => sum + ((p.sales || 0) * p.price), 0);
  const avgOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;
  const conversionRate = 3.2;
  
  const analyticsHtml = `
    <div class="stat-card"><div class="value">${totalProducts}</div><div class="label">Total Products</div></div>
    <div class="stat-card"><div class="value">${totalSales}</div><div class="label">Total Sales</div></div>
    <div class="stat-card"><div class="value">$${totalRevenue.toLocaleString()}</div><div class="label">Revenue</div></div>
    <div class="stat-card"><div class="value">$${avgOrderValue.toFixed(2)}</div><div class="label">Avg Order Value</div></div>
    <div class="stat-card"><div class="value">${conversionRate}%</div><div class="label">Conversion Rate</div></div>
    <div class="stat-card"><div class="value">${customers.length}</div><div class="label">Total Customers</div></div>
  `;
  document.getElementById('analyticsStats').innerHTML = analyticsHtml;
  
  // Top selling products
  const topProducts = [...products].sort((a, b) => (b.sales || 0) - (a.sales || 0)).slice(0, 5);
  const topProductsHtml = `
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="border-bottom: 1px solid var(--border);">
          <th style="padding: 0.75rem; text-align: left;">Product</th>
          <th style="padding: 0.75rem; text-align: left;">Sales</th>
          <th style="padding: 0.75rem; text-align: left;">Revenue</th>
          <th style="padding: 0.75rem; text-align: left;">Rating</th>
        </tr>
      </thead>
      <tbody>
        ${topProducts.map(p => `
          <tr style="border-bottom: 1px solid var(--border);">
            <td style="padding: 0.75rem;">${p.name}</td>
            <td style="padding: 0.75rem;">${p.sales || 0}</td>
            <td style="padding: 0.75rem;">$${((p.sales || 0) * p.price).toLocaleString()}</td>
            <td style="padding: 0.75rem;">${'★'.repeat(Math.floor(p.rating || 5))}${'☆'.repeat(5 - Math.floor(p.rating || 5))} ${p.rating || 5}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  document.getElementById('topProductsList').innerHTML = topProductsHtml;
}

// ============ SETTINGS ============
function saveSettings() {
  const settings = {
    siteName: document.getElementById('siteName').value,
    tagline: document.getElementById('tagline').value,
    metaKeywords: document.getElementById('metaKeywords').value,
    metaDescription: document.getElementById('metaDescription').value,
    defaultDiscount: document.getElementById('defaultDiscount').value
  };
  localStorage.setItem('mittely_settings', JSON.stringify(settings));
  showNotification('Settings saved!', 'success');
}

// ============ UI HELPERS ============
function showTab(tabName) {
  document.querySelectorAll('.tab-pane').forEach(tab => tab.classList.remove('active'));
  document.getElementById(tabName + 'Tab').classList.add('active');
  document.querySelectorAll('.sidebar-nav .tab-btn').forEach(btn => btn.classList.remove('active'));
  
  if (tabName === 'dashboard') loadDashboard();
  if (tabName === 'analytics') loadAnalytics();
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}

function showNotification(message, type) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed; bottom: 20px; right: 20px; 
    background: ${type === 'success' ? '#10b981' : '#ef4444'}; 
    color: white; padding: 1rem 1.5rem; 
    border-radius: 8px; z-index: 2000;
    animation: slideIn 0.3s ease;
  `;
  toast.innerHTML = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function logout() {
  localStorage.removeItem('mittely_token');
  localStorage.removeItem('mittely_user');
  window.location.href = 'index.html';
}

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
`;
document.head.appendChild(style);

// Make functions global
window.showTab = showTab;
window.openProductModal = openProductModal;
window.editProduct = editProduct;
window.saveProduct = saveProduct;
window.toggleStatus = toggleStatus;
window.deleteProduct = deleteProduct;
window.filterProducts = filterProducts;
window.openDiscountModal = openDiscountModal;
window.saveDiscount = saveDiscount;
window.deleteDiscount = deleteDiscount;
window.saveSettings = saveSettings;
window.closeModal = closeModal;
window.logout = logout;
window.verifyAdmin = verifyAdmin;
window.handleZipUpload = handleZipUpload;
