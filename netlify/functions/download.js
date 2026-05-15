const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'mittely-super-secret-jwt-key-change-in-production';

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const params = new URLSearchParams(event.queryStringParameters || {});
    const token = params.get('token');

    if (!token) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing token' }) };
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.type !== 'download') {
      return { statusCode: 403, headers, body: JSON.stringify({ error: 'Invalid token type' }) };
    }

    const templateHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MITTELY Template</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    :root{--p:#6366f1;--s:#ec4899;--a:#06b6d4;--d:#0b0f19;--l:#f1f5f9}
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Inter',sans-serif;background:var(--d);color:var(--l);line-height:1.6}
    .hero{min-height:100vh;display:flex;align-items:center;justify-content:center;text-align:center;padding:2rem;background:radial-gradient(circle at 50% 50%,rgba(99,102,241,0.15) 0%,transparent 70%)}
    .hero h1{font-size:clamp(2.5rem,5vw,4rem);font-weight:900;margin-bottom:1rem;background:linear-gradient(135deg,var(--p),var(--s),var(--a));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
    .hero p{font-size:1.2rem;opacity:0.7;max-width:600px;margin:0 auto 2rem}
    .btn{display:inline-block;padding:1rem 2.5rem;background:linear-gradient(135deg,var(--p),var(--s));color:white;text-decoration:none;border-radius:50px;font-weight:700;transition:transform .3s,box-shadow .3s}
    .btn:hover{transform:translateY(-3px);box-shadow:0 10px 40px rgba(99,102,241,0.4)}
    footer{text-align:center;padding:3rem 2rem;border-top:1px solid rgba(255,255,255,0.1);opacity:0.5}
  </style>
</head>
<body>
  <section class="hero">
    <div>
      <h1>Your Premium Template</h1>
      <p>Thank you for choosing MITTELY. Customize this to match your brand.</p>
      <a href="#" class="btn">Get Started</a>
    </div>
  </section>
  <footer><p> ${new Date().getFullYear()} | Template by MITTELY</p></footer>
</body>
</html>`;

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="mittely-template.html"`
      },
      body: templateHTML,
      isBase64Encoded: false
    };
  } catch (err) {
    console.error('Download error:', err);
    return { statusCode: 403, headers, body: JSON.stringify({ error: 'Invalid or expired token' }) };
  }
};