const db = require('../database/db');

class InventoryLog {
  static async create(logData) {
    const {
      item_id, action, quantity_changed, previous_quantity,
      new_quantity, notes, user_id
    } = logData;

    return db.run(
      `INSERT INTO inventory_logs (
        item_id, action, quantity_changed, previous_quantity,
        new_quantity, notes, user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [item_id, action, quantity_changed, previous_quantity, new_quantity, notes, user_id]
    );
  }

  static async getByItemId(itemId) {
    return db.all(
      `SELECT l.*, u.username
       FROM inventory_logs l
       LEFT JOIN users u ON l.user_id = u.id
       WHERE l.item_id = ?
       ORDER BY l.created_at DESC`,
      [itemId]
    );
  }

  static async getAll(limit = 100) {
    return db.all(
      `SELECT l.*, i.name as item_name, u.username
       FROM inventory_logs l
       LEFT JOIN inventory_items i ON l.item_id = i.id
       LEFT JOIN users u ON l.user_id = u.id
       ORDER BY l.created_at DESC
       LIMIT ?`,
      [limit]
    );
  }
}

module.exports = InventoryLog;
