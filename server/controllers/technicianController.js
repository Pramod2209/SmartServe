import { query } from '../config/database.js';

/**
 * @route   GET /api/technicians
 * @desc    Get all technicians
 * @access  Public
 */
export const getTechnicians = async (req, res) => {
  try {
    const { specialization, available, verified } = req.query;

    let sqlQuery = `
          SELECT t.id, t.user_id, t.specialization, t.experience, t.certifications, t.rating, t.total_jobs, t.available, t.verified,
            t.created_at AS technician_created_at,
            u.full_name, u.email, u.phone, u.created_at AS user_created_at
      FROM technicians t
      INNER JOIN users u ON t.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (specialization) {
      sqlQuery += ` AND t.specialization = $${paramCount++}`;
      params.push(specialization);
    }
    if (available !== undefined) {
      sqlQuery += ` AND t.available = $${paramCount++}`;
      params.push(available === 'true');
    }
    if (verified !== undefined) {
      sqlQuery += ` AND t.verified = $${paramCount++}`;
      params.push(verified === 'true');
    }

    sqlQuery += ' ORDER BY t.rating DESC, t.total_jobs DESC';

    const result = await query(sqlQuery, params);

    res.json({ technicians: result.rows });
  } catch (error) {
    console.error('Get technicians error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @route   GET /api/technicians/:id
 * @desc    Get technician by ID
 * @access  Public
 */
export const getTechnicianById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT t.*, t.created_at AS technician_created_at, u.full_name, u.email, u.phone, u.created_at AS user_created_at
       FROM technicians t
       INNER JOIN users u ON t.user_id = u.id
       WHERE t.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Technician not found' });
    }

    res.json({ technician: result.rows[0] });
  } catch (error) {
    console.error('Get technician error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @route   PUT /api/technicians/:id
 * @desc    Update technician profile
 * @access  Private (Own profile or Admin)
 */
export const updateTechnician = async (req, res) => {
  try {
    const { id } = req.params;
    const { specialization, experience, certifications, available } = req.body;

    // Check authorization
    const techResult = await query('SELECT user_id FROM technicians WHERE id = $1', [id]);
    if (techResult.rows.length === 0) {
      return res.status(404).json({ message: 'Technician not found' });
    }

    const technician = techResult.rows[0];
    if (req.user.role !== 'admin' && req.user.id !== technician.user_id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (specialization) {
      updates.push(`specialization = $${paramCount++}`);
      values.push(specialization);
    }
    if (experience !== undefined) {
      updates.push(`experience = $${paramCount++}`);
      values.push(experience);
    }
    if (certifications !== undefined) {
      updates.push(`certifications = $${paramCount++}`);
      values.push(certifications);
    }
    if (available !== undefined) {
      updates.push(`available = $${paramCount++}`);
      values.push(available);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    values.push(id);
    const result = await query(
      `UPDATE technicians SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    res.json({
      message: 'Technician profile updated successfully',
      technician: result.rows[0]
    });
  } catch (error) {
    console.error('Update technician error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @route   PUT /api/technicians/:id/verify
 * @desc    Verify technician account
 * @access  Private (Admin only)
 */
export const verifyTechnician = async (req, res) => {
  try {
    const { id } = req.params;
    const { verified } = req.body;

    const result = await query(
      'UPDATE technicians SET verified = $1 WHERE id = $2 RETURNING *',
      [verified, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Technician not found' });
    }

    res.json({
      message: `Technician ${verified ? 'verified' : 'unverified'} successfully`,
      technician: result.rows[0]
    });
  } catch (error) {
    console.error('Verify technician error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
