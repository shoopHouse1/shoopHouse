import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  
  jwt: {
    secret: process.env.JWT_SECRET || 'change-me-in-production',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'change-me-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  
  s3: {
    endpoint: process.env.S3_ENDPOINT,
    accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
    bucket: process.env.S3_BUCKET || 'shoophouse-files',
    region: process.env.S3_REGION || 'us-east-1',
    publicUrl: process.env.S3_PUBLIC_URL,
  },
  
  downloads: {
    expiryHours: parseInt(process.env.DOWNLOAD_EXPIRY_HOURS || '24', 10),
    maxAttempts: parseInt(process.env.DOWNLOAD_MAX_ATTEMPTS || '3', 10),
  },
  
  whatsapp: {
    number: process.env.WHATSAPP_NUMBER || '+971XXXXXXXXX',
  },
};


