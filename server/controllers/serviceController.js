import { query } from '../config/database.js';

/**
 * @route   GET /api/services
 * @desc    Get all active services
 * @access  Public
 */
export const getServices = async (req, res) => {
  try {
    const result = await query(
      'SELECT id, name, description, icon, price_range, active, created_at FROM services WHERE active = true ORDER BY name'
    );

    res.json({ services: result.rows });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @route   GET /api/services/:id
 * @desc    Get service by ID
 * @access  Public
 */
export const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'SELECT id, name, description, icon, price_range, active, created_at FROM services WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.json({ service: result.rows[0] });
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @route   POST /api/services
 * @desc    Create a new service
 * @access  Private (Admin only)
 */
export const createService = async (req, res) => {
  try {
    const { name, description, icon, priceRange } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Service name is required' });
    }

    const result = await query(
      'INSERT INTO services (name, description, icon, price_range) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, description || '', icon || '', priceRange || '']
    );

    res.status(201).json({ 
      message: 'Service created successfully',
      service: result.rows[0] 
    });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @route   PUT /api/services/:id
 * @desc    Update service
 * @access  Private (Admin only)
 */
export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, icon, priceRange, active } = req.body;

    const result = await query(
      'UPDATE services SET name = COALESCE($1, name), description = COALESCE($2, description), icon = COALESCE($3, icon), price_range = COALESCE($4, price_range), active = COALESCE($5, active) WHERE id = $6 RETURNING *',
      [name, description, icon, priceRange, active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.json({ 
      message: 'Service updated successfully',
      service: result.rows[0] 
    });
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @route   DELETE /api/services/:id
 * @desc    Delete service (soft delete - set active to false)
 * @access  Private (Admin only)
 */
export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'UPDATE services SET active = false WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
