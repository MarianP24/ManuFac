import SQLite from 'react-native-sqlite-storage';

// Enable promise-based SQLite operations
SQLite.enablePromise(true);

// Database name and location
const DATABASE = {
  name: 'PatientClinicApp.db',
  location: 'default',
};

// Database connection
let db: SQLite.SQLiteDatabase;

/**
 * Initialize the database and create tables if they don't exist
 */
export const initDatabase = async (): Promise<void> => {
  try {
    // Open or create the database
    db = await SQLite.openDatabase(DATABASE);
    console.log('Database opened');

    // Create tables
    await createTables();
    console.log('Tables created successfully');

    return Promise.resolve();
  } catch (error) {
    console.error('Database initialization error:', error);
    return Promise.reject(error);
  }
};

/**
 * Create all necessary tables for the application
 */
const createTables = async (): Promise<void> => {
  try {
    // Users table
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        date_of_birth TEXT,
        gender TEXT,
        profile_picture TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    // Clinics table
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS clinics (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        address TEXT,
        city TEXT,
        state TEXT,
        zip_code TEXT,
        country TEXT,
        phone TEXT,
        email TEXT,
        website TEXT,
        latitude REAL,
        longitude REAL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    // Doctors table
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS doctors (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        specialization TEXT,
        clinic_id TEXT,
        phone TEXT,
        email TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    // Medical info table
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS medical_info (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        blood_type TEXT,
        notes TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    // User addresses table
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS user_addresses (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        street TEXT,
        city TEXT,
        state TEXT,
        zip_code TEXT,
        country TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    // Emergency contacts table
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS emergency_contacts (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        relationship TEXT,
        phone TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    // Allergies table
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS allergies (
        id TEXT PRIMARY KEY,
        medical_info_id TEXT NOT NULL,
        name TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);

    // Medications table
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS medications (
        id TEXT PRIMARY KEY,
        medical_info_id TEXT NOT NULL,
        name TEXT NOT NULL,
        dosage TEXT,
        frequency TEXT,
        created_at TEXT NOT NULL
      );
    `);

    // Medical conditions table
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS medical_conditions (
        id TEXT PRIMARY KEY,
        medical_info_id TEXT NOT NULL,
        name TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);

    // Appointments table
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS appointments (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        clinic_id TEXT NOT NULL,
        doctor_id TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        status TEXT NOT NULL,
        notes TEXT,
        virtual_meeting INTEGER DEFAULT 0,
        meeting_link TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    // Medical records table
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS medical_records (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        date TEXT NOT NULL,
        doctor_id TEXT,
        clinic_id TEXT,
        description TEXT,
        file_url TEXT,
        is_digitally_signed INTEGER DEFAULT 0,
        signed_by TEXT,
        signature_date TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    // Payments table
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS payments (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        appointment_id TEXT,
        medical_record_id TEXT,
        amount REAL NOT NULL,
        currency TEXT NOT NULL,
        status TEXT NOT NULL,
        payment_method TEXT,
        transaction_id TEXT,
        invoice_url TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    // Notifications table
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT NOT NULL,
        read INTEGER DEFAULT 0,
        appointment_id TEXT,
        medical_record_id TEXT,
        payment_id TEXT,
        action_url TEXT,
        created_at TEXT NOT NULL
      );
    `);

    // User preferences table
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        notifications INTEGER DEFAULT 1,
        dark_mode INTEGER DEFAULT 0,
        language TEXT DEFAULT 'en',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    // Preferred clinics table
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS preferred_clinics (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        clinic_id TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);

    // Preferred doctors table
    await db.executeSql(`
      CREATE TABLE IF NOT EXISTS preferred_doctors (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        doctor_id TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);

    return Promise.resolve();
  } catch (error) {
    console.error('Error creating tables:', error);
    return Promise.reject(error);
  }
};

/**
 * Close the database connection
 */
export const closeDatabase = async (): Promise<void> => {
  if (db) {
    try {
      await db.close();
      console.log('Database closed');
    } catch (error) {
      console.error('Error closing database:', error);
    }
  }
};

/**
 * Execute a SQL query with parameters
 */
export const executeSql = async (
  sql: string,
  params: any[] = []
): Promise<SQLite.ResultSet> => {
  try {
    const [result] = await db.executeSql(sql, params);
    return result;
  } catch (error) {
    console.error('Error executing SQL:', error);
    throw error;
  }
};

/**
 * Get the database instance
 */
export const getDatabase = (): SQLite.SQLiteDatabase => {
  return db;
};

/**
 * Generate a unique ID
 */
export const generateId = (): string => {
  return Date.now().toString() + Math.floor(Math.random() * 10000).toString();
};

/**
 * Get current timestamp in ISO format
 */
export const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
};
