const express = require('express');
const StorageLocation = require('../models/StorageLocation');

const router = express.Router();

// Get all storage locations
router.get('/', async (req, res) => {
  try {
    const locations = await StorageLocation.getAll();
    res.json(locations);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

// Get single location
router.get('/:id', async (req, res) => {
  try {
    const location = await StorageLocation.findById(req.params.id);
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }
    res.json(location);
  } catch (error) {
    console.error('Error fetching location:', error);
    res.status(500).json({ error: 'Failed to fetch location' });
  }
});

// Create new location
router.post('/', async (req, res) => {
  try {
    const { name, building, floor, room, cabinet, shelf, temperature_requirement, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Location name is required' });
    }

    const locationId = await StorageLocation.create(req.body);
    const location = await StorageLocation.findById(locationId);

    res.status(201).json(location);
  } catch (error) {
    console.error('Error creating location:', error);
    res.status(500).json({ error: 'Failed to create location' });
  }
});

// Update location
router.put('/:id', async (req, res) => {
  try {
    const location = await StorageLocation.findById(req.params.id);
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }

    await StorageLocation.update(req.params.id, req.body);
    const updatedLocation = await StorageLocation.findById(req.params.id);

    res.json(updatedLocation);
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ error: 'Failed to update location' });
  }
});

// Delete location
router.delete('/:id', async (req, res) => {
  try {
    const location = await StorageLocation.findById(req.params.id);
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }

    await StorageLocation.delete(req.params.id);
    res.json({ message: 'Location deleted successfully' });
  } catch (error) {
    console.error('Error deleting location:', error);
    res.status(500).json({ error: 'Failed to delete location' });
  }
});

module.exports = router;
