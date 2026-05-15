/* MITTELY Payment - Paystack + Heleket */

const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');
const db = require('./db');
const { sendEmail, receiptTemplate, adminAlertTemplate } = require('./email');

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const HELEKET_API_KEY = process.env.HELEKET_API_KEY;
const JWT_SECRET = process.env.JWT_SECRET;

function generateDownloadToken(orderId) {
  return jwt.sign({ order_id: orderId, type: 'download' }, JWT_SECRET, { expiresIn: '30d' });
}

async function initPaystack(data) {
  const res = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PAYSTACK_SECRET}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: data.email,
      amount: Math.round(data.amount * 100),
      callback_url: data.callback_url + `?gateway=paystack&order=${data.order_id}`,
      metadata: {
        product_id: data.product_id,
        product_name: data.product_name,
        user_id: data.user_id,
        order_id: data.order_id
      }
    })
  });

  const result = await res.json();
  if (!result.status) throw new Error(result.message);
  return { authorization_url: result.data.authorization_url, reference: result.data.reference };
}

async function verifyPaystack(reference) {
  const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: { 'Authorization': `Bearer ${PAYSTACK_SECRET}` }
  });

  const result = await res.json();
  if (!result.status) return { verified: false, status: result.message };

  return {
    verified: result.data.status === 'success',
    status: result.data.status,
    amount: result.data.amount / 100,
    reference: result.data.reference,
    metadata: result.data.metadata
  };
}

async function initHeleket(data) {
  // Heleket checkout initialization
  const res = await fetch('https://api.heleket.com/v1/checkout', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${HELEKET_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      amount: data.amount,
      currency: 'USD',
      description: data.product_name,
      callback_url: data.callback_url + `?gateway=heleket&order=${data.order_id}`,
      metadata: {
        product_id: data.product_id,
        product_name: data.product_name,
        user_id: data.user_id,
        order_id: data.order_id,
        customer_email: data.email
      }
    })
  });

  const result = await res.json();
  if (!result.success) throw new Error(result.message || 'Heleket initialization failed');
  return { checkout_url: result.data.checkout_url, reference: result.data.reference };
}

async function verifyHeleket(reference) {
  const res = await fetch(`https://api.heleket.com/v1/transactions/${reference}`, {
    headers: { 'Authorization': `Bearer ${HELEKET_API_KEY}` }
  });

  const result = await res.json();
  if (!result.success) return { verified: false, status: result.message };

  return {
    verified: result.data.status === 'completed',
    status: result.data.status,
    amount: result.data.amount,
    reference: result.data.reference,
    metadata: result.data.metadata
  };
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const params = new URLSearchParams(event.queryStringParameters || {});
    const action = params.get('action');

    // INITIATE PAYMENT
    if (event.httpMethod === 'POST') {
      const data = JSON.parse(event.body);
      const order = await db.createOrder({
        product_id: data.product_id,
        product_name: data.product_name,
        amount: data.amount,
        customer_email: data.email,
        customer_id: data.user_id,
        gateway: data.gateway,
        status: 'pending',
        download_token: null
      });

      const initData = { ...data, order_id: order.id };

      if (data.gateway === 'heleket') {
        const result = await initHeleket(initData);
        await db.updateOrder(order.id, { gateway_reference: result.reference });
        return { statusCode: 200, headers, body: JSON.stringify({ checkout_url: result.checkout_url, order_id: order.id }) };
      } else {
        const result = await initPaystack(initData);
        await db.updateOrder(order.id, { gateway_reference: result.reference });
        return { statusCode: 200, headers, body: JSON.stringify({ authorization_url: result.authorization_url, order_id: order.id }) };
      }
    }

    // VERIFY PAYMENT
    if (action === 'verify') {
      const gateway = params.get('gateway');
      const orderId = params.get('order');
      const ref = params.get('ref');

      const order = await db.getOrder(orderId);
      if (!order) return { statusCode: 404, headers, body: JSON.stringify({ error: 'Order not found' }) };

      let result;
      if (gateway === 'heleket') {
        result = await verifyHeleket(ref || order.gateway_reference);
      } else {
        result = await verifyPaystack(ref || order.gateway_reference);
      }

      if (result.verified) {
        const downloadToken = generateDownloadToken(orderId);
        await db.updateOrder(orderId, {
          status: 'completed',
          download_token: downloadToken,
          paid_at: new Date().toISOString()
        });

        // Update customer stats
        const customers = await db.getCustomers();
        const customer = customers.find(c => c.email === order.customer_email);
        if (customer) {
          await db.initDb().collection('customers').doc(customer.id).update({
            order_count: db.initDb().FieldValue ? db.initDb().FieldValue.increment(1) : (customer.order_count || 0) + 1,
            total_spent: (customer.total_spent || 0) + order.amount
          });
        }

        // Send emails
        try {
          await sendEmail({
            to: order.customer_email,
            subject: 'Your MITTELY Order Receipt',
            html: receiptTemplate({ ...order, download_token: downloadToken }),
            text: `Order ${order.id} confirmed. Download: ${process.env.APP_URL}/download.html?token=${downloadToken}&order=${orderId}`
          });

          await sendEmail({
            to: process.env.ADMIN_EMAIL,
            subject: `New Sale: $${order.amount} - ${order.product_name}`,
            html: adminAlertTemplate(order),
            text: `New sale: ${order.product_name} for $${order.amount} by ${order.customer_email}`
          });
        } catch (e) {
          console.error('Email error:', e);
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            verified: true,
            download_token: downloadToken,
            order_id: orderId,
            product: { name: order.product_name },
            amount: order.amount
          })
        };
      }

      await db.updateOrder(orderId, { status: result.status === 'failed' ? 'failed' : 'pending' });
      return { statusCode: 200, headers, body: JSON.stringify({ verified: false, status: result.status }) };
    }

    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid action' }) };
  } catch (err) {
    console.error('Payment error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
