# Quick Deploy Guide

## Prerequisites
- Node.js 18+ installed
- Netlify CLI: `npm install -g netlify-cli`
- GitHub account
- Firebase account (free Spark plan)
- Google Cloud account (for OAuth)
- Paystack account (test mode)
- Heleket account

## Step 1: Environment Setup

```bash
# Clone/download this project
cd mittely-complete

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your actual values
nano .env
```

## Step 2: Firebase Setup (5 min)

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create project → name it `mittely-45508`
3. Firestore Database → Create database → Start in **test mode**
4. Project Settings → Service Accounts → Generate New Private Key
5. Download JSON → Base64 encode it:
   ```bash
   # macOS
   base64 -i serviceAccountKey.json | pbcopy

   # Linux
   base64 -w 0 serviceAccountKey.json

   # Windows (PowerShell)
   [Convert]::ToBase64String([IO.File]::ReadAllBytes("serviceAccountKey.json")) | Set-Clipboard
   ```
6. Paste the base64 string into `FIREBASE_SERVICE_ACCOUNT_BASE64`

## Step 3: Google OAuth Setup (5 min)

1. [console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → Credentials
2. Create OAuth client ID → Web application
3. Authorized JavaScript origins:
   - `https://your-site.netlify.app`
   - `http://localhost:8888` (for local dev)
4. Authorized redirect URIs:
   - `https://your-site.netlify.app`
5. Copy Client ID and Secret to `.env`

## Step 4: Paystack Setup (2 min)

1. [dashboard.paystack.com](https://dashboard.paystack.com) → Settings → API Keys
2. Copy Test Secret Key and Test Public Key to `.env`

## Step 5: Heleket Setup (3 min)

1. [heleket.com](https://heleket.com) → Business Settings → API
2. Generate Payout API Key → copy to `.env`
3. Domain Verification → "Using a meta tag"
4. The meta tag is already in all HTML files: `<meta name="heleket" content="3bebdecb" />`
5. Enter your Netlify URL and click **Check**

## Step 6: Gmail App Password (2 min)

1. [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. App: Mail | Device: Other (name: MITTELY)
3. Copy 16-char password to `GMAIL_APP_PASSWORD`

## Step 7: Local Testing

```bash
# Start Netlify dev server
netlify dev

# Open http://localhost:8888
```

## Step 8: Deploy to Production

```bash
# Initialize git
git init
git add .
git commit -m "MITTELY v3.3 - Heleket + Dashboard"

# Push to GitHub
git remote add origin https://github.com/YOUR_USERNAME/mittely.git
git push -u origin main

# Or deploy directly to Netlify
netlify deploy --prod
```

## Step 9: Netlify Dashboard Config

1. Go to [app.netlify.com](https://app.netlify.com)
2. Site Settings → Environment Variables
3. Add ALL variables from `.env`
4. Build settings:
   - Build command: *(empty)*
   - Publish directory: `.`

## Step 10: Update Google OAuth

After deploy, update Google OAuth authorized origins with your actual Netlify URL.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `401 Unauthorized` on API calls | Check JWT_SECRET matches between env and functions |
| `Firebase permission denied` | Ensure Firestore is in test mode or add proper rules |
| Emails not sending | Verify Gmail App Password (not your regular password) |
| Paystack fails | Use test card: 4084084084084081, CVV: 408, PIN: 0000 |
| Heleket domain fails | Ensure meta tag is in `<head>` of index page |
| Dashboard shows demo data | Connect to backend by updating API endpoints |

## File Structure After Deploy

```
.
├── index.html              ← Storefront
├── login.html              ← Auth page
├── dashboard.html          ← User dashboard
├── admin.html              ← Admin panel
├── payment-callback.html   ← Payment verification
├── download.html           ← File delivery
├── css/
│   └── style.css           ← All styles
├── js/
│   ├── app.js              ← Store frontend
│   └── admin.js            ← Admin logic
├── netlify/
│   └── functions/
│       ├── auth.js         ← Google OAuth
│       ├── payment.js      ← Paystack + Heleket
│       ├── admin-api.js    ← Protected CRUD
│       ├── download.js     ← Secure downloads
│       ├── email.js        ← Gmail SMTP
│       ├── db.js           ← Firebase layer
│       └── stats.js        ← Public stats
├── netlify.toml            ← Build config
├── _redirects              ← URL redirects
├── sitemap.xml             ← SEO sitemap
├── robots.txt              ← Crawler rules
├── package.json            ← Dependencies
├── .env.example            ← Env template
├── .gitignore              ← Git ignore rules
├── LICENSE                 ← MIT License
├── README.md               ← Full docs
├── CHANGELOG.md            ← Version history
└── DEPLOY.md               ← This file
```
