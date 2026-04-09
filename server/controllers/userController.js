import { query } from '../config/database.js';
import bcrypt from 'bcryptjs';

/**
 * @route   GET /api/users
 * @desc    Get all users (filtered by role if specified)
 * @access  Private (Admin only)
 */
export const getUsers = async (req, res) => {
  try {
    const { role } = req.query;

    let sqlQuery = 'SELECT id, email, full_name, phone, address, role, created_at FROM users';
    const params = [];

    if (role) {
      sqlQuery += ' WHERE role = $1';
      params.push(role);
    }

    sqlQuery += ' ORDER BY created_at DESC';

    const result = await query(sqlQuery, params);

    res.json({ users: result.rows });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private (Admin or own profile)
 */
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // Authorization check
    if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const result = await query(
      'SELECT id, email, full_name, phone, address, role, created_at FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = result.rows[0];

    // If technician, get technician info
    if (user.role === 'technician') {
      const techResult = await query(
        'SELECT specialization, experience, certifications, rating, total_jobs, available, verified FROM technicians WHERE user_id = $1',
        [id]
      );
      if (techResult.rows.length > 0) {
        user.technicianInfo = techResult.rows[0];
      }
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Private (Admin or own profile)
 */
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, phone, address, password } = req.body;

    // Authorization check
    if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (fullName) {
      updates.push(`full_name = $${paramCount++}`);
      values.push(fullName);
    }
    if (phone !== undefined) {
      updates.push(`phone = $${paramCount++}`);
      values.push(phone);
    }
    if (address !== undefined) {
      updates.push(`address = $${paramCount++}`);
      values.push(address);
    }
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updates.push(`password = $${paramCount++}`);
      values.push(hashedPassword);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    values.push(id);
    const result = await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING id, email, full_name, phone, address, role`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user
 * @access  Private (Admin only)
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting self
    if (req.user.id === parseInt(id)) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const result = await query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
