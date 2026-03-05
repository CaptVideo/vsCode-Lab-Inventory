const db = require('../database/db');

class InventoryItem {
  static async create(itemData) {
    const {
      name, item_type, description, manufacturer, catalog_number,
      quantity, unit_of_measure, min_threshold, max_threshold,
      expiration_date, location_id, cost_per_unit
    } = itemData;

    const result = await db.run(
      `INSERT INTO inventory_items (
        name, item_type, description, manufacturer, catalog_number,
        quantity, unit_of_measure, min_threshold, max_threshold,
        expiration_date, location_id, cost_per_unit
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, item_type, description, manufacturer, catalog_number,
        quantity, unit_of_measure, min_threshold, max_threshold,
        expiration_date, location_id, cost_per_unit
      ]
    );

    return result.lastID;
  }

  static async findById(id) {
    return db.get(
      `SELECT i.*, l.name as location_name 
       FROM inventory_items i 
       LEFT JOIN storage_locations l ON i.location_id = l.id 
       WHERE i.id = ?`,
      [id]
    );
  }

  static async getAll(filters = {}) {
    let sql = `SELECT i.*, l.name as location_name 
               FROM inventory_items i 
               LEFT JOIN storage_locations l ON i.location_id = l.id
               WHERE 1=1`;
    const params = [];

    if (filters.item_type) {
      sql += ' AND i.item_type = ?';
      params.push(filters.item_type);
    }

    if (filters.location_id) {
      sql += ' AND i.location_id = ?';
      params.push(filters.location_id);
    }

    if (filters.search) {
      sql += ' AND (i.name LIKE ? OR i.manufacturer LIKE ? OR i.catalog_number LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    sql += ' ORDER BY i.name ASC';

    return db.all(sql, params);
  }

  static async getLowStock() {
    return db.all(`
      SELECT i.*, l.name as location_name
      FROM inventory_items i
      LEFT JOIN storage_locations l ON i.location_id = l.id
      WHERE i.quantity <= i.min_threshold
      ORDER BY i.quantity ASC
    `);
  }

  static async getExpiringItems(daysAhead = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);
    const dateStr = futureDate.toISOString().split('T')[0];

    return db.all(`
      SELECT i.*, l.name as location_name,
             JULIANDAY(i.expiration_date) - JULIANDAY('now') as days_until_expiration
      FROM inventory_items i
      LEFT JOIN storage_locations l ON i.location_id = l.id
      WHERE i.expiration_date IS NOT NULL
        AND i.expiration_date <= ?
        AND i.expiration_date > DATE('now')
      ORDER BY i.expiration_date ASC
    `, [dateStr]);
  }

  static async update(id, itemData) {
    const {
      name, item_type, description, manufacturer, catalog_number,
      quantity, unit_of_measure, min_threshold, max_threshold,
      expiration_date, location_id, cost_per_unit
    } = itemData;

    return db.run(
      `UPDATE inventory_items SET
        name = ?, item_type = ?, description = ?, manufacturer = ?,
        catalog_number = ?, quantity = ?, unit_of_measure = ?,
        min_threshold = ?, max_threshold = ?, expiration_date = ?,
        location_id = ?, cost_per_unit = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        name, item_type, description, manufacturer, catalog_number,
        quantity, unit_of_measure, min_threshold, max_threshold,
        expiration_date, location_id, cost_per_unit, id
      ]
    );
  }

  static async getItemTypes() {
    const result = await db.all(
      'SELECT DISTINCT item_type FROM inventory_items ORDER BY item_type'
    );
    return result.map(row => row.item_type);
  }

  static async delete(id) {
    return db.run('DELETE FROM inventory_items WHERE id = ?', [id]);
  }
}

module.exports = InventoryItem;
