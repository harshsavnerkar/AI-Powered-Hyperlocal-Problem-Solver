import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'db_store.json');

global.dbFallback = false;

// Initial template for local JSON DB
const initialData = {
  users: [],
  issues: [],
  verifications: [],
  notifications: []
};

export const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;
  if (!mongoURI) {
    console.warn('⚠️ MONGO_URI not found. Falling back to local JSON database store.');
    enableFallback();
    return;
  }

  try {
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000
    });
    console.log('🚀 Connected to MongoDB successfully.');
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    console.warn('⚠️ Falling back to local JSON database store.');
    enableFallback();
  }
};

const enableFallback = () => {
  global.dbFallback = true;
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
  }
};

export const getStore = () => {
  if (!fs.existsSync(DB_FILE)) {
    enableFallback();
  }
  try {
    const content = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    return initialData;
  }
};

export const saveStore = (store) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(store, null, 2));
  } catch (err) {
    console.error('Failed to save to JSON database:', err);
  }
};
