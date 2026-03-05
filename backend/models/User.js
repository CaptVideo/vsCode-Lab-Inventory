const bcrypt = require('bcryptjs');
const db = require('../database/db');

class User {
  static async create(userData) {
    const { username, email, password, role = 'staff' } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.run(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, role]
    );

    return result.lastID;
  }

  static async findByUsername(username) {
    return db.get('SELECT * FROM users WHERE username = ?', [username]);
  }

  static async findByEmail(email) {
    return db.get('SELECT * FROM users WHERE email = ?', [email]);
  }

  static async findById(id) {
    return db.get('SELECT id, username, email, role, created_at FROM users WHERE id = ?', [id]);
  }

  static async getAll() {
    return db.all('SELECT id, username, email, role, created_at FROM users');
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  static async update(id, userData) {
    const { username, email, role } = userData;
    return db.run(
      'UPDATE users SET username = ?, email = ?, role = ? WHERE id = ?',
      [username, email, role, id]
    );
  }

  static async delete(id) {
    return db.run('DELETE FROM users WHERE id = ?', [id]);
  }
}

module.exports = User;
