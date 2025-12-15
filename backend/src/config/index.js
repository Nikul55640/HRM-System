import dotenv from 'dotenv';

dotenv.config();

const config = {
  // Environment
  env: process.env.NODE_ENV || 'development',

  // Server
  port: Number(process.env.PORT) || 5000,

  // Database
  database: {
    // MySQL Configuration
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    database: process.env.DB_NAME || 'hrms',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    dialect: 'mysql',
    pool: {
      max: Number(process.env.DB_MAX_POOL_SIZE) || 10,
      min: Number(process.env.DB_MIN_POOL_SIZE) || 5,
      acquire: 30000,
      idle: 10000,
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  },

  // JWT Tokens
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
    accessTokenExpire: process.env.JWT_EXPIRE || '15m',
    refreshTokenExpire: process.env.JWT_REFRESH_EXPIRE || '7d',
  },

  // Email
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    from: process.env.EMAIL_FROM || 'noreply@hrms.com',
  },

  // File Upload
  upload: {
    maxFileSize: Number(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024,
    uploadPath: process.env.UPLOAD_PATH || './uploads',
    allowedFileTypes: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'],
  },

  // Security
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  },

  // Rate Limiting
  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  },

  // Audit Log
  auditLog: {
    retentionYears: Number(process.env.AUDIT_LOG_RETENTION_YEARS) || 7,
  },

  // Document Encryption
  encryption: {
    key: process.env.DOCUMENT_ENCRYPTION_KEY,
    algorithm: 'aes-256-cbc',
  },
};

// Config Validation
const validateConfig = () => {
  const required = ['database.host', 'database.database', 'database.username', 'jwt.secret', 'jwt.refreshSecret'];
  const missing = [];

  required.forEach((path) => {
    const keys = path.split('.');
    let value = config;

    keys.forEach((key) => {
      value = value?.[key];
    });

    if (!value) {
      missing.push(path);
    }
  });

  if (missing.length > 0) {
    throw new Error(
      `Missing required configuration: ${missing.join(', ')}`,
    );
  }

  if (config.env === 'production' && !config.encryption.key) {
    console.warn(
      'WARNING: DOCUMENT_ENCRYPTION_KEY is not set. Document encryption will not work.',
    );
  }
};

validateConfig();

export default config;
