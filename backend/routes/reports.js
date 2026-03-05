const express = require('express');
const InventoryItem = require('../models/InventoryItem');
const InventoryLog = require('../models/InventoryLog');

const router = express.Router();

// Get inventory summary report
router.get('/summary', async (req, res) => {
  try {
    const allItems = await InventoryItem.getAll();
    const lowStockItems = await InventoryItem.getLowStock();
    const expiringItems = await InventoryItem.getExpiringItems(30);

    const summary = {
      total_items: allItems.length,
      total_quantity: allItems.reduce((sum, item) => sum + item.quantity, 0),
      low_stock_count: lowStockItems.length,
      expiring_count: expiringItems.length,
      item_types: [...new Set(allItems.map(item => item.item_type))].length,
      total_value: allItems.reduce((sum, item) => sum + (item.quantity * (item.cost_per_unit || 0)), 0)
    };

    res.json(summary);
  } catch (error) {
    console.error('Error generating summary:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

// Get item type report
router.get('/by-type', async (req, res) => {
  try {
    const items = await InventoryItem.getAll();
    const report = {};

    items.forEach(item => {
      if (!report[item.item_type]) {
        report[item.item_type] = {
          type: item.item_type,
          count: 0,
          quantity: 0,
          value: 0
        };
      }

      report[item.item_type].count += 1;
      report[item.item_type].quantity += item.quantity;
      report[item.item_type].value += (item.quantity * (item.cost_per_unit || 0));
    });

    res.json(Object.values(report));
  } catch (error) {
    console.error('Error generating type report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// Get location utilization report
router.get('/location-utilization', async (req, res) => {
  try {
    const items = await InventoryItem.getAll();
    const report = {};

    items.forEach(item => {
      const location = item.location_name || 'Unassigned';
      if (!report[location]) {
        report[location] = {
          location: location,
          item_count: 0,
          total_quantity: 0
        };
      }

      report[location].item_count += 1;
      report[location].total_quantity += item.quantity;
    });

    res.json(Object.values(report));
  } catch (error) {
    console.error('Error generating utilization report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// Get activity log
router.get('/activity', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const logs = await InventoryLog.getAll(limit);
    res.json(logs);
  } catch (error) {
    console.error('Error fetching activity log:', error);
    res.status(500).json({ error: 'Failed to fetch activity log' });
  }
});

module.exports = router;
