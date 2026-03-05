const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'labinventory.db');

let db = null;

const database = {
  getDatabase() {
    if (!db) {
      db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
          console.error('Error opening database:', err);
        } else {
          console.log('Connected to SQLite database');
        }
      });
    }
    return db;
  },

  initialize() {
    const database = this.getDatabase();
    
    // Enable foreign keys
    database.run('PRAGMA foreign_keys = ON');

    // Create users table
    database.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'staff',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create inventory items table
    database.run(`
      CREATE TABLE IF NOT EXISTS inventory_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        item_type TEXT NOT NULL,
        description TEXT,
        manufacturer TEXT,
        catalog_number TEXT,
        quantity INTEGER NOT NULL DEFAULT 0,
        unit_of_measure TEXT NOT NULL,
        min_threshold INTEGER,
        max_threshold INTEGER,
        expiration_date DATE,
        location_id INTEGER,
        cost_per_unit REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (location_id) REFERENCES storage_locations(id)
      )
    `);

    // Create storage locations table
    database.run(`
      CREATE TABLE IF NOT EXISTS storage_locations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        building TEXT,
        floor TEXT,
        room TEXT,
        cabinet TEXT,
        shelf TEXT,
        temperature_requirement TEXT,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create inventory logs table
    database.run(`
      CREATE TABLE IF NOT EXISTS inventory_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_id INTEGER NOT NULL,
        action TEXT NOT NULL,
        quantity_changed INTEGER,
        previous_quantity INTEGER,
        new_quantity INTEGER,
        notes TEXT,
        user_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (item_id) REFERENCES inventory_items(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Create expiration alerts table
    database.run(`
      CREATE TABLE IF NOT EXISTS expiration_alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_id INTEGER NOT NULL,
        days_until_expiration INTEGER,
        alert_sent BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (item_id) REFERENCES inventory_items(id)
      )
    `);

    console.log('Database initialized successfully');
  },

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.getDatabase().run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ lastID: this.lastID, changes: this.changes });
        }
      });
    });
  },

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.getDatabase().get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  },

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.getDatabase().all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  },

  close() {
    return new Promise((resolve, reject) => {
      if (db) {
        db.close((err) => {
          if (err) {
            reject(err);
          } else {
            db = null;
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }
};

module.exports = database;
