const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'mittely-super-secret-jwt-key-change-in-production';
const ADMIN_EMAILS = ['henryagyemang906@gmail.com'];

function verifyAdmin(token) {
  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), JWT_SECRET);
    if (!ADMIN_EMAILS.includes(decoded.email) && !decoded.isAdmin) {
      throw new Error('Not authorized');
    }
    return decoded;
  } catch (e) {
    throw new Error('Invalid token');
  }
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const authHeader = event.headers.authorization || event.headers.Authorization;
    verifyAdmin(authHeader);

    const params = new URLSearchParams(event.queryStringParameters || {});
    const action = params.get('action');

    if (action === 'stats') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ orders: 127, customers: 89, products: 6, revenue: 4230, recentOrders: [] })
      };
    }

    if (action === 'products') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify([])
      };
    }

    if (action === 'orders') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify([])
      };
    }

    if (action === 'customers') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify([])
      };
    }

    if (action === 'settings') {
      if (event.httpMethod === 'POST') {
        return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
      }
      return { statusCode: 200, headers, body: JSON.stringify({ site_name: 'MITTELY', tagline: 'Building Digital Experiences That Matter', currency: 'USD', gateway: 'paystack' }) };
    }

    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid action' }) };
  } catch (err) {
    return {
      statusCode: err.message === 'Not authorized' || err.message === 'Invalid token' ? 403 : 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};
