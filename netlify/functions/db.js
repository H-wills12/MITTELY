// db.js
exports.getProducts = async () => [];
exports.getProduct = async (id) => null;
exports.saveProduct = async (data) => data;
exports.deleteProduct = async (id) => {};
exports.createOrder = async (data) => ({ id: 'test', ...data });
exports.getOrder = async (id) => null;
exports.updateOrder = async (id, data) => {};
exports.getOrders = async (limit) => [];
exports.getUserOrders = async (email) => [];
exports.getOrCreateCustomer = async (data) => data;
exports.getCustomers = async () => [];
exports.getSettings = async () => ({ site_name: 'MITTELY', tagline: '', currency: 'USD', gateway: 'paystack' });
exports.saveSettings = async (data) => data;
exports.getStats = async () => ({ products: 6, orders: 127, customers: 89, revenue: 4230 });
exports.initDb = () => {};