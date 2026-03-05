const db = require('../database/db');

class StorageLocation {
  static async create(locationData) {
    const {
      name, building, floor, room, cabinet, shelf,
      temperature_requirement, description
    } = locationData;

    const result = await db.run(
      `INSERT INTO storage_locations (
        name, building, floor, room, cabinet, shelf,
        temperature_requirement, description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, building, floor, room, cabinet, shelf,
        temperature_requirement, description
      ]
    );

    return result.lastID;
  }

  static async findById(id) {
    return db.get(
      `SELECT l.*, COUNT(i.id) as item_count
       FROM storage_locations l
       LEFT JOIN inventory_items i ON l.id = i.location_id
       WHERE l.id = ?
       GROUP BY l.id`,
      [id]
    );
  }

  static async getAll() {
    return db.all(`
      SELECT l.*, COUNT(i.id) as item_count
      FROM storage_locations l
      LEFT JOIN inventory_items i ON l.id = i.location_id
      GROUP BY l.id
      ORDER BY l.building, l.floor, l.room
    `);
  }

  static async update(id, locationData) {
    const {
      name, building, floor, room, cabinet, shelf,
      temperature_requirement, description
    } = locationData;

    return db.run(
      `UPDATE storage_locations SET
        name = ?, building = ?, floor = ?, room = ?,
        cabinet = ?, shelf = ?, temperature_requirement = ?,
        description = ?
       WHERE id = ?`,
      [
        name, building, floor, room, cabinet, shelf,
        temperature_requirement, description, id
      ]
    );
  }

  static async delete(id) {
    return db.run('DELETE FROM storage_locations WHERE id = ?', [id]);
  }
}

module.exports = StorageLocation;
