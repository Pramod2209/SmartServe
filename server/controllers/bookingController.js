import { query } from '../config/database.js';

/**
 * @route   GET /api/bookings
 * @desc    Get bookings filtered by user role
 * @access  Private
 */
export const getBookings = async (req, res) => {
  try {
    const { role, id } = req.user;
    let result;

    if (role === 'admin') {
      // Admin sees all bookings
      result = await query(
        `SELECT b.*, u.full_name as customer_name, u.email as customer_email, u.phone as customer_phone,
         t.id as tech_id, tu.full_name as technician_name
         FROM bookings b
         LEFT JOIN users u ON b.customer_id = u.id
         LEFT JOIN technicians t ON b.technician_id = t.id
         LEFT JOIN users tu ON t.user_id = tu.id
         ORDER BY b.created_at DESC`
      );
    } else if (role === 'technician') {
      // Technician sees their assigned bookings
      const techResult = await query('SELECT id FROM technicians WHERE user_id = $1', [id]);
      if (techResult.rows.length === 0) {
        return res.status(404).json({ message: 'Technician profile not found' });
      }
      const techId = techResult.rows[0].id;

      result = await query(
        `SELECT b.*, u.full_name as customer_name, u.email as customer_email, u.phone as customer_phone
         FROM bookings b
         LEFT JOIN users u ON b.customer_id = u.id
         WHERE b.technician_id = $1
         ORDER BY b.created_at DESC`,
        [techId]
      );
    } else {
      // Customer sees their own bookings
      result = await query(
        `SELECT b.*, t.id as tech_id, u.full_name as technician_name, u.phone as technician_phone
         FROM bookings b
         LEFT JOIN technicians t ON b.technician_id = t.id
         LEFT JOIN users u ON t.user_id = u.id
         WHERE b.customer_id = $1
         ORDER BY b.created_at DESC`,
        [id]
      );
    }

    res.json({ bookings: result.rows });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @route   GET /api/bookings/:id
 * @desc    Get single booking by ID
 * @access  Private
 */
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const result = await query(
      `SELECT b.*, u.full_name as customer_name, u.email as customer_email, u.phone as customer_phone,
       t.id as tech_id, tu.full_name as technician_name, tu.phone as technician_phone
       FROM bookings b
       LEFT JOIN users u ON b.customer_id = u.id
       LEFT JOIN technicians t ON b.technician_id = t.id
       LEFT JOIN users tu ON t.user_id = tu.id
       WHERE b.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const booking = result.rows[0];

    // Authorization check
    if (user.role === 'customer' && booking.customer_id !== user.id) {
      return res.status(403).json({ message: 'Not authorized to access this booking' });
    }

    if (user.role === 'technician') {
      const techResult = await query('SELECT id FROM technicians WHERE user_id = $1', [user.id]);
      if (techResult.rows.length > 0 && booking.technician_id !== techResult.rows[0].id) {
        return res.status(403).json({ message: 'Not authorized to access this booking' });
      }
    }

    res.json({ booking });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @route   POST /api/bookings
 * @desc    Create a new booking
 * @access  Private (Customer only)
 */
export const createBooking = async (req, res) => {
  try {
    const { serviceId, serviceName, description, bookingDate, bookingTime, address } = req.body;
    const customerId = req.user.id;

    // Validation
    if (!serviceName || !bookingDate || !bookingTime || !address) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const result = await query(
      `INSERT INTO bookings (customer_id, service_id, service_name, description, booking_date, booking_time, address, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
       RETURNING *`,
      [customerId, serviceId || null, serviceName, description || '', bookingDate, bookingTime, address]
    );

    res.status(201).json({
      message: 'Booking created successfully',
      booking: result.rows[0]
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @route   PUT /api/bookings/:id
 * @desc    Update booking
 * @access  Private
 */
export const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, technicianId, description, bookingDate, bookingTime, address } = req.body;
    const user = req.user;

    // Get current booking
    const currentBooking = await query('SELECT * FROM bookings WHERE id = $1', [id]);
    if (currentBooking.rows.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const booking = currentBooking.rows[0];
    const previousStatus = booking.status;
    const previousTechnicianId = booking.technician_id;

    // Authorization checks
    if (user.role === 'customer' && booking.customer_id !== user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (status) {
      updates.push(`status = $${paramCount++}`);
      values.push(status);
    }
    if (technicianId !== undefined && user.role === 'admin') {
      updates.push(`technician_id = $${paramCount++}`);
      values.push(technicianId);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (bookingDate) {
      updates.push(`booking_date = $${paramCount++}`);
      values.push(bookingDate);
    }
    if (bookingTime) {
      updates.push(`booking_time = $${paramCount++}`);
      values.push(bookingTime);
    }
    if (address) {
      updates.push(`address = $${paramCount++}`);
      values.push(address);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    values.push(id);
    const result = await query(
      `UPDATE bookings SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    const updatedBooking = result.rows[0];
    const nextStatus = updatedBooking.status;
    const nextTechnicianId = updatedBooking.technician_id;

    // Keep technicians.total_jobs synchronized with booking completion transitions.
    if (previousStatus !== 'completed' && nextStatus === 'completed' && nextTechnicianId) {
      await query(
        'UPDATE technicians SET total_jobs = total_jobs + 1 WHERE id = $1',
        [nextTechnicianId]
      );
    } else if (previousStatus === 'completed' && nextStatus !== 'completed' && previousTechnicianId) {
      await query(
        'UPDATE technicians SET total_jobs = GREATEST(total_jobs - 1, 0) WHERE id = $1',
        [previousTechnicianId]
      );
    } else if (
      previousStatus === 'completed' &&
      nextStatus === 'completed' &&
      previousTechnicianId &&
      nextTechnicianId &&
      previousTechnicianId !== nextTechnicianId
    ) {
      await query(
        'UPDATE technicians SET total_jobs = GREATEST(total_jobs - 1, 0) WHERE id = $1',
        [previousTechnicianId]
      );
      await query(
        'UPDATE technicians SET total_jobs = total_jobs + 1 WHERE id = $1',
        [nextTechnicianId]
      );
    }

    res.json({
      message: 'Booking updated successfully',
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @route   DELETE /api/bookings/:id
 * @desc    Cancel/delete booking
 * @access  Private
 */
export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    // Get booking first for authorization
    const bookingResult = await query('SELECT customer_id, status FROM bookings WHERE id = $1', [id]);
    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const booking = bookingResult.rows[0];

    // Authorization
    if (user.role === 'customer' && booking.customer_id !== user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Instead of deleting, update status to cancelled
    await query(
      'UPDATE bookings SET status = $1 WHERE id = $2',
      ['cancelled', id]
    );

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
