import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '.env');

// Check if .env already exists
if (fs.existsSync(envPath)) {
  console.log('✅ .env file already exists!');
  process.exit(0);
}

// Create .env file with default values
try {
  // Generate a random JWT secret
  const randomSecret = crypto.randomBytes(64).toString('hex');
  
  const envContent = `PORT=5000
MONGODB_URI=mongodb://localhost:27017/school_management2
JWT_SECRET=${randomSecret}
JWT_EXPIRE=7d

# Twilio for SMS/WhatsApp (Optional - leave empty if not using)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# File Upload
UPLOAD_PATH=./uploads
`;
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully!');
  console.log('✅ A random JWT_SECRET has been generated for you.');
  console.log('⚠️  Please review the .env file and update any values as needed.');
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
  process.exit(1);
}

