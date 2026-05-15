// Run with: node check-env.js
const requiredEnvVars = [
  'JWT_SECRET',
  'APP_URL',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'PAYSTACK_SECRET_KEY',
  'HELEKET_API_KEY'
];

const optionalEnvVars = [
  'GMAIL_APP_PASSWORD',
  'NOREPLY_EMAIL',
  'ADMIN_EMAIL',
  'FIREBASE_SERVICE_ACCOUNT_BASE64'
];

console.log('🔍 Checking Environment Variables...\n');

let missingRequired = [];

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    missingRequired.push(varName);
    console.log(`❌ Missing required: ${varName}`);
  } else {
    console.log(`✅ Found: ${varName}`);
  }
});

console.log('\n📋 Optional Variables:');
optionalEnvVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`✅ ${varName} is set`);
  } else {
    console.log(`⚠️  ${varName} is not set (optional)`);
  }
});

if (missingRequired.length > 0) {
  console.log(`\n❌ Missing required environment variables: ${missingRequired.join(', ')}`);
  process.exit(1);
} else {
  console.log('\n✅ All required environment variables are set!');
}