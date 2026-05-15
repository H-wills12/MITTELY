# MITTELY v3.2 — Firebase + Gmail Email + Payments

> Premium template marketplace with **Firebase Firestore** (free), **Gmail SMTP** (free email), **Google OAuth**, **Paystack + WorldFirst** payments, and **Netlify** hosting.

## Stack

| Layer | Technology | Cost |
|-------|-----------|------|
| Frontend | HTML + CSS + Vanilla JS | Free |
| Hosting | Netlify | Free |
| Database | Firebase Firestore | Free (Spark plan) |
| Auth | Google OAuth 2.0 | Free |
| Email | **Gmail SMTP** | **Free** |
| Payments | Paystack + WorldFirst | Free (test) / Per transaction (live) |
| Serverless | Netlify Functions | Free |

## Email Notifications (FREE via Gmail)

MITTELY sends 3 types of emails automatically:

1. **Welcome email** — Sent when a new user signs in
2. **Order receipt** — Sent to customer after successful payment
3. **Admin alert** — Sent to you when someone buys a template

### Setup Gmail App Password (2 minutes)

1. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Sign in with `henryagyemang906@gmail.com`
3. Under **"Select app"** → choose **"Mail"**
4. Under **"Select device"** → choose **"Other (Custom name)"** → type `MITTELY`
5. Click **Generate**
6. Copy the 16-character password (looks like: `abcd efgh ijkl mnop`)
7. Paste it into Netlify env var `GMAIL_APP_PASSWORD`

That's it. No external email service. No credit card. Completely free.

## Firebase Setup

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create project `mittely-45508`
3. Enable **Firestore Database** → Start in test mode
4. Go to **Project Settings** → **Service Accounts**
5. Click **Generate New Private Key** → Download JSON
6. Base64 encode it:
   ```bash
   base64 -i serviceAccountKey.json | pbcopy  # Mac
   base64 -w 0 serviceAccountKey.json         # Linux
   ```
7. Paste into Netlify env var `FIREBASE_SERVICE_ACCOUNT_BASE64`

## Google OAuth Setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. APIs & Services → Credentials → Create OAuth client ID
3. Application type: **Web application**
4. Add authorized origins:
   - `https://your-site.netlify.app`
5. Add redirect URIs:
   - `https://your-site.netlify.app`
6. Copy **Client ID** and **Client Secret**

## Paystack Setup

1. Go to [dashboard.paystack.com](https://dashboard.paystack.com)
2. Settings → API Keys
3. Copy **Test Secret Key** and **Test Public Key**

## Deploy

### 1. Update Client ID
Open `login.html`, replace `YOUR_GOOGLE_CLIENT_ID` with your actual ID.

### 2. Push to GitHub
```bash
git init
git add .
git commit -m "MITTELY v3.2"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/mittely.git
git push -u origin main
```

### 3. Netlify
- Import from GitHub
- Build command: *(empty)*
- Publish directory: `.`

### 4. Environment Variables

| Key | Value |
|-----|-------|
| `GOOGLE_CLIENT_ID` | Your Google Client ID |
| `GOOGLE_CLIENT_SECRET` | Your Google Client Secret |
| `FIREBASE_SERVICE_ACCOUNT_BASE64` | Base64 service account JSON |
| `JWT_SECRET` | Random 32+ char string |
| `APP_URL` | `https://your-site.netlify.app` |
| `ADMIN_EMAIL` | `henryagyemang906@gmail.com` |
| `GMAIL_APP_PASSWORD` | Your Gmail App Password |
| `NOREPLY_EMAIL` | `henryagyemang906@gmail.com` |
| `PAYSTACK_SECRET_KEY` | `sk_test_...` |
| `PAYSTACK_PUBLIC_KEY` | `pk_test_...` |

### 5. Done
Netlify auto-deploys. Firestore auto-creates collections.

## Test Card (Paystack)

- **Card:** `4084084084084081`
- **CVV:** `408`
- **Expiry:** Any future date
- **PIN:** `0000`
- **OTP:** `123456`

## Project Structure

```
mittely/
├── index.html                  # Storefront
├── login.html                  # Google OAuth
├── admin.html                  # Admin panel
├── payment-callback.html       # Payment verification
├── download.html               # File delivery
├── css/style.css               # Dark UI
├── js/
│   ├── app.js                  # Store frontend
│   └── admin.js                # Admin logic
└── netlify/functions/
    ├── auth.js                 # Google OAuth + welcome email
    ├── payment.js              # Paystack + WorldFirst + receipt emails
    ├── admin-api.js            # Protected CRUD
    ├── download.js             # Secure downloads
    ├── email.js                # Gmail SMTP sender
    └── db.js                   # Firebase Firestore layer
```
