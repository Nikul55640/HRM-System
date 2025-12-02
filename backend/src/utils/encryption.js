import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// Encryption algorithm
const ALGORITHM = 'aes-256-cbc';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits

/**
 * Generate a random encryption key
 * @returns {string} Hex-encoded encryption key
 */
const generateEncryptionKey = () => crypto.randomBytes(KEY_LENGTH).toString('hex');

/**
 * Generate a random initialization vector
 * @returns {Buffer} Initialization vector
 */
const generateIV = () => crypto.randomBytes(IV_LENGTH);

/**
 * Derive a key from the master encryption key and a unique key
 * @param {string} masterKey - Master encryption key from environment
 * @param {string} uniqueKey - Unique key for this document
 * @returns {Buffer} Derived key
 */
const deriveKey = (masterKey, uniqueKey) =>
  // Use PBKDF2 to derive a key
  crypto.pbkdf2Sync(
    uniqueKey,
    masterKey,
    100000, // iterations
    KEY_LENGTH,
    'sha256',
  )
;

/**
 * Encrypt a file
 * @param {string} inputPath - Path to the file to encrypt
 * @param {string} outputPath - Path where encrypted file will be saved
 * @param {string} uniqueKey - Unique encryption key for this document
 * @returns {Promise<Object>} Object containing encryption metadata
 */
const encryptFile = async (inputPath, outputPath, uniqueKey) => {
  try {
    // Get master key from environment
    const masterKey = process.env.DOCUMENT_ENCRYPTION_KEY;
    if (!masterKey || masterKey.length < 32) {
      throw new Error('Invalid or missing DOCUMENT_ENCRYPTION_KEY in environment');
    }

    // Derive encryption key
    const key = deriveKey(masterKey, uniqueKey);

    // Generate IV
    const iv = generateIV();

    // Read the file
    const fileData = await readFile(inputPath);

    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    // Encrypt the data
    const encrypted = Buffer.concat([cipher.update(fileData), cipher.final()]);

    // Combine IV and encrypted data
    const combined = Buffer.concat([iv, encrypted]);

    // Write encrypted file
    await writeFile(outputPath, combined);

    return {
      success: true,
      encryptedPath: outputPath,
      algorithm: ALGORITHM,
      ivLength: IV_LENGTH,
    };
  } catch (error) {
    throw new Error(`Encryption failed: ${error.message}`);
  }
};

/**
 * Decrypt a file
 * @param {string} inputPath - Path to the encrypted file
 * @param {string} outputPath - Path where decrypted file will be saved
 * @param {string} uniqueKey - Unique encryption key for this document
 * @returns {Promise<Object>} Object containing decryption metadata
 */
const decryptFile = async (inputPath, outputPath, uniqueKey) => {
  try {
    // Get master key from environment
    const masterKey = process.env.DOCUMENT_ENCRYPTION_KEY;
    if (!masterKey || masterKey.length < 32) {
      throw new Error('Invalid or missing DOCUMENT_ENCRYPTION_KEY in environment');
    }

    // Derive encryption key
    const key = deriveKey(masterKey, uniqueKey);

    // Read the encrypted file
    const encryptedData = await readFile(inputPath);

    // Extract IV and encrypted content
    const iv = encryptedData.slice(0, IV_LENGTH);
    const encrypted = encryptedData.slice(IV_LENGTH);

    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

    // Decrypt the data
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

    // Write decrypted file
    await writeFile(outputPath, decrypted);

    return {
      success: true,
      decryptedPath: outputPath,
    };
  } catch (error) {
    throw new Error(`Decryption failed: ${error.message}`);
  }
};

/**
 * Encrypt data buffer
 * @param {Buffer} data - Data to encrypt
 * @param {string} uniqueKey - Unique encryption key
 * @returns {Object} Object containing encrypted data and IV
 */
const encryptBuffer = (data, uniqueKey) => {
  try {
    const masterKey = process.env.DOCUMENT_ENCRYPTION_KEY;
    if (!masterKey || masterKey.length < 32) {
      throw new Error('Invalid or missing DOCUMENT_ENCRYPTION_KEY in environment');
    }

    const key = deriveKey(masterKey, uniqueKey);
    const iv = generateIV();
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);

    return {
      encrypted: Buffer.concat([iv, encrypted]),
      iv: iv.toString('hex'),
    };
  } catch (error) {
    throw new Error(`Buffer encryption failed: ${error.message}`);
  }
};

/**
 * Decrypt data buffer
 * @param {Buffer} encryptedData - Encrypted data (includes IV)
 * @param {string} uniqueKey - Unique encryption key
 * @returns {Buffer} Decrypted data
 */
const decryptBuffer = (encryptedData, uniqueKey) => {
  try {
    const masterKey = process.env.DOCUMENT_ENCRYPTION_KEY;
    if (!masterKey || masterKey.length < 32) {
      throw new Error('Invalid or missing DOCUMENT_ENCRYPTION_KEY in environment');
    }

    const key = deriveKey(masterKey, uniqueKey);
    const iv = encryptedData.slice(0, IV_LENGTH);
    const encrypted = encryptedData.slice(IV_LENGTH);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

    return decrypted;
  } catch (error) {
    throw new Error(`Buffer decryption failed: ${error.message}`);
  }
};

/**
 * Validate encryption key format
 * @param {string} key - Encryption key to validate
 * @returns {boolean} True if valid
 */
const isValidEncryptionKey = (key) => typeof key === 'string' && key.length >= 32;

/**
 * Encrypt a string value
 * @param {string} text - Text to encrypt
 * @returns {string} Encrypted text in hex format
 */
const encrypt = (text) => {
  try {
    if (!text) return text;

    const masterKey = process.env.DOCUMENT_ENCRYPTION_KEY || process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production-32chars';
    if (masterKey.length < 32) {
      throw new Error('Encryption key must be at least 32 characters');
    }

    const key = Buffer.from(masterKey.slice(0, 32));
    const iv = generateIV();
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Prepend IV to encrypted data
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (error) {
    throw new Error(`String encryption failed: ${error.message}`);
  }
};

/**
 * Decrypt a string value
 * @param {string} encryptedText - Encrypted text in hex format
 * @returns {string} Decrypted text
 */
const decrypt = (encryptedText) => {
  try {
    if (!encryptedText) return encryptedText;

    const masterKey = process.env.DOCUMENT_ENCRYPTION_KEY || process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production-32chars';
    if (masterKey.length < 32) {
      throw new Error('Encryption key must be at least 32 characters');
    }

    const key = Buffer.from(masterKey.slice(0, 32));

    // Split IV and encrypted data
    const parts = encryptedText.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted text format');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    throw new Error(`String decryption failed: ${error.message}`);
  }
};

export {
  generateEncryptionKey,
  generateIV,
  deriveKey,
  encryptFile,
  decryptFile,
  encryptBuffer,
  decryptBuffer,
  encrypt,
  decrypt,
  isValidEncryptionKey,
  ALGORITHM,
  KEY_LENGTH,
  IV_LENGTH,
};
