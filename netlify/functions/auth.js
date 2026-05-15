/* MITTELY Auth - Complete Google OAuth + Welcome Email Integration */

const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');
const fetch = require('node-fetch');
const { sendEmail, welcomeTemplate } = require('./email');

// Configuration
const GOOGLE_CLIENT_ID = '633950298729-3207gqqsbmhb9um1qtbpe6klmgni82jh.apps.googleusercontent.com';
const JWT_SECRET = process.env.JWT_SECRET || 'mittely-super-secret-jwt-key-change-in-production';
const ADMIN_EMAILS = ['henryagyemang906@gmail.com'];
const APP_URL = process.env.APP_URL || 'https://mittely.netlify.app';

// Cache for Google certificates
let googleCerts = null;
let certsExpiry = 0;

/**
 * Fetch and cache Google OAuth certificates
 * @returns {Promise<Object>} - Google certificates in PEM format
 */
async function getGoogleCerts() {
  // Return cached certs if still valid
  if (googleCerts && Date.now() < certsExpiry) {
    return googleCerts;
  }

  try {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/certs');
    const data = await res.json();
    
    googleCerts = {};
    data.keys.forEach(key => {
      googleCerts[key.kid] = jwkToPem(key);
    });
    
    // Cache for 1 hour (Google rotates keys every 6 hours)
    certsExpiry = Date.now() + 3600000;
    
    console.log('✅ Google certificates refreshed successfully');
    return googleCerts;
  } catch (error) {
    console.error('❌ Failed to fetch Google certificates:', error);
    throw new Error('Unable to verify authentication');
  }
}

/**
 * Verify Google ID token
 * @param {string} token - Google ID token from client
 * @returns {Promise<Object>} - Decoded payload
 */
async function verifyGoogleToken(token) {
  const certs = await getGoogleCerts();
  const decoded = jwt.decode(token, { complete: true });
  
  if (!decoded || !decoded.header) {
    throw new Error('Invalid token format');
  }

  const pem = certs[decoded.header.kid];
  if (!pem) {
    throw new Error('Unknown key ID - certificate not found');
  }

  try {
    const payload = jwt.verify(token, pem, {
      audience: GOOGLE_CLIENT_ID,
      issuer: ['https://accounts.google.com', 'accounts.google.com']
    });
    return payload;
  } catch (error) {
    console.error('Token verification failed:', error.message);
    throw new Error('Invalid or expired token');
  }
}

/**
 * Generate JWT token for authenticated user
 * @param {Object} user - User data
 * @returns {string} - JWT token
 */
function generateToken(user) {
  return jwt.sign(
    { 
      sub: user.id, 
      email: user.email, 
      name: user.name, 
      picture: user.picture,
      isAdmin: user.isAdmin 
    }, 
    JWT_SECRET, 
    { expiresIn: '7d' }
  );
}

/**
 * Save or update user in mock database
 * @param {Object} userData - User data from Google
 * @returns {Promise<Object>} - User record with login count
 */
async function getOrCreateCustomer(userData) {
  // In production, this would connect to Firebase/Firestore
  // For now, we'll use localStorage simulation
  
  try {
    // Try to get existing user from localStorage (for demo)
    const users = JSON.parse(localStorage.getItem('mittely_users') || '[]');
    let existingUser = users.find(u => u.email === userData.email);
    
    if (existingUser) {
      // Update existing user
      existingUser.last_seen = new Date().toISOString();
      existingUser.login_count = (existingUser.login_count || 0) + 1;
      
      const updatedUsers = users.map(u => 
        u.email === userData.email ? existingUser : u
      );
      localStorage.setItem('mittely_users', JSON.stringify(updatedUsers));
      
      return {
        ...existingUser,
        isNew: false,
        login_count: existingUser.login_count
      };
    } else {
      // Create new user
      const newUser = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        picture: userData.picture,
        isAdmin: ADMIN_EMAILS.includes(userData.email),
        created_at: new Date().toISOString(),
        last_seen: new Date().toISOString(),
        login_count: 1,
        order_count: 0,
        total_spent: 0
      };
      
      users.push(newUser);
      localStorage.setItem('mittely_users', JSON.stringify(users));
      
      return {
        ...newUser,
        isNew: true,
        login_count: 1
      };
    }
  } catch (error) {
    // If localStorage not available (Netlify Functions), return mock data
    console.log('Using mock user data (no localStorage in function)');
    return {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      picture: userData.picture,
      isAdmin: ADMIN_EMAILS.includes(userData.email),
      isNew: true,
      login_count: 1,
      created_at: new Date().toISOString()
    };
  }
}

/**
 * Send welcome email to new user
 * @param {Object} user - User data
 * @returns {Promise<boolean>} - Success status
 */
async function sendWelcomeEmail(user) {
  try {
    const result = await sendEmail({
      to: user.email,
      subject: `Welcome to MITTELY, ${user.name || 'Creator'}! 🚀`,
      html: welcomeTemplate(user.name || user.email.split('@')[0]),
      text: `Welcome to MITTELY, ${user.name || user.email.split('@')[0]}!\n\nThank you for joining! Browse premium digital assets at ${APP_URL}\n\nGet started: ${APP_URL}#products`
    });
    
    console.log(`✅ Welcome email sent to ${user.email}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send welcome email to ${user.email}:`, error.message);
    // Don't throw - authentication should still succeed even if email fails
    return false;
  }
}

/**
 * Main handler function for Netlify Function
 */
exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Credentials': 'true'
  };

  // Handle preflight CORS requests
  if (event.httpMethod === 'OPTIONS') {
    return { 
      statusCode: 200, 
      headers, 
      body: '' 
    };
  }

  // Only allow POST method
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: 'Method not allowed. Use POST.' 
      })
    };
  }

  try {
    // Parse request body
    const body = JSON.parse(event.body);
    const { credential } = body;
    
    if (!credential) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Missing credential parameter' 
        })
      };
    }

    // Verify Google token
    console.log('🔐 Verifying Google token...');
    const payload = await verifyGoogleToken(credential);
    
    // Extract user data from verified payload
    const userData = {
      id: payload.sub,
      email: payload.email,
      name: payload.name || payload.email.split('@')[0],
      picture: payload.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(payload.name || payload.email)}&background=6366f1&color=fff`,
      isAdmin: ADMIN_EMAILS.includes(payload.email),
      email_verified: payload.email_verified || false
    };

    // Validate email
    if (!userData.email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Email not provided by Google' 
        })
      };
    }

    // Save/update user in database
    console.log(`📝 Processing user: ${userData.email}`);
    const customer = await getOrCreateCustomer(userData);
    
    // Send welcome email to new users only
    if (customer.isNew && customer.login_count === 1) {
      console.log(`📧 Sending welcome email to new user: ${userData.email}`);
      await sendWelcomeEmail(userData);
    } else {
      console.log(`👋 Returning user: ${userData.email} (login #${customer.login_count})`);
    }

    // Generate JWT token for session
    const token = generateToken(userData);

    // Prepare response
    const response = {
      success: true,
      token,
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        picture: userData.picture,
        isAdmin: userData.isAdmin
      },
      isAdmin: userData.isAdmin,
      isNewUser: customer.isNew || false,
      loginCount: customer.login_count
    };

    console.log(`✅ Authentication successful for: ${userData.email}`);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response)
    };
    
  } catch (error) {
    console.error('❌ Auth error:', error);
    
    // Determine appropriate status code
    let statusCode = 401;
    let errorMessage = error.message || 'Authentication failed';
    
    if (errorMessage.includes('Network') || errorMessage.includes('fetch')) {
      statusCode = 503;
      errorMessage = 'Service temporarily unavailable. Please try again.';
    } else if (errorMessage.includes('Invalid token')) {
      statusCode = 401;
      errorMessage = 'Invalid authentication token. Please sign in again.';
    } else if (errorMessage.includes('certificate')) {
      statusCode = 500;
      errorMessage = 'Authentication service error. Please try again later.';
    }
    
    return {
      statusCode,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ 
        success: false, 
        error: errorMessage,
        code: statusCode
      })
    };
  }
};
