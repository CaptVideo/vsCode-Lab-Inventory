const express = require('express');
const InventoryItem = require('../models/InventoryItem');
const InventoryLog = require('../models/InventoryLog');

const router = express.Router();

// Get all inventory items with optional filters
router.get('/', async (req, res) => {
  try {
    const filters = {
      item_type: req.query.item_type,
      location_id: req.query.location_id,
      search: req.query.search
    };

    const items = await InventoryItem.getAll(filters);
    res.json(items);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

// Get single item
router.get('/:id', async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

// Create new inventory item
router.post('/', async (req, res) => {
  try {
    const { name, item_type, description, manufacturer, catalog_number, quantity, unit_of_measure, min_threshold, max_threshold, expiration_date, location_id, cost_per_unit } = req.body;

    if (!name || !item_type || quantity < 0 || !unit_of_measure) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const itemId = await InventoryItem.create(req.body);

    // Log the creation
    await InventoryLog.create({
      item_id: itemId,
      action: 'created',
      quantity_changed: quantity,
      previous_quantity: 0,
      new_quantity: quantity,
      notes: 'Item created',
      user_id: req.userId
    });

    const item = await InventoryItem.findById(itemId);
    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

// Update inventory item
router.put('/:id', async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const previousQuantity = item.quantity;
    const newQuantity = req.body.quantity;

    await InventoryItem.update(req.params.id, req.body);

    // Log the update if quantity changed
    if (previousQuantity !== newQuantity) {
      await InventoryLog.create({
        item_id: req.params.id,
        action: 'quantity_updated',
        quantity_changed: newQuantity - previousQuantity,
        previous_quantity: previousQuantity,
        new_quantity: newQuantity,
        notes: req.body.notes || 'Quantity adjusted',
        user_id: req.userId
      });
    }

    const updatedItem = await InventoryItem.findById(req.params.id);
    res.json(updatedItem);
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// Adjust quantity (simplified)
router.post('/:id/adjust', async (req, res) => {
  try {
    const { quantity_change, notes } = req.body;

    const item = await InventoryItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const newQuantity = Math.max(0, item.quantity + quantity_change);

    await InventoryItem.update(req.params.id, {
      ...item,
      quantity: newQuantity
    });

    await InventoryLog.create({
      item_id: req.params.id,
      action: 'adjusted',
      quantity_changed: quantity_change,
      previous_quantity: item.quantity,
      new_quantity: newQuantity,
      notes: notes || 'Quantity adjusted',
      user_id: req.userId
    });

    const updatedItem = await InventoryItem.findById(req.params.id);
    res.json(updatedItem);
  } catch (error) {
    console.error('Error adjusting quantity:', error);
    res.status(500).json({ error: 'Failed to adjust quantity' });
  }
});

// Get low stock items
router.get('/alerts/low-stock', async (req, res) => {
  try {
    const items = await InventoryItem.getLowStock();
    res.json(items);
  } catch (error) {
    console.error('Error fetching low stock items:', error);
    res.status(500).json({ error: 'Failed to fetch low stock items' });
  }
});

// Get expiring items
router.get('/alerts/expiring', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const items = await InventoryItem.getExpiringItems(days);
    res.json(items);
  } catch (error) {
    console.error('Error fetching expiring items:', error);
    res.status(500).json({ error: 'Failed to fetch expiring items' });
  }
});

// Delete item
router.delete('/:id', async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    await InventoryItem.delete(req.params.id);
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

// Get inventory logs
router.get('/:id/logs', async (req, res) => {
  try {
    const logs = await InventoryLog.getByItemId(req.params.id);
    res.json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

module.exports = router;
