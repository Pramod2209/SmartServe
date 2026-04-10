import { query } from '../config/database.js';

const recalculateTechnicianRating = async (technicianId) => {
  await query(
    `UPDATE technicians
     SET rating = COALESCE((
       SELECT ROUND(AVG(rating)::numeric, 2)
       FROM reviews
       WHERE technician_id = $1
     ), 0.00)
     WHERE id = $1`,
    [technicianId]
  );
};

/**
 * @route   POST /api/reviews
 * @desc    Create or update booking review by customer
 * @access  Private (Customer only)
 */
export const upsertReview = async (req, res) => {
  try {
    const customerId = req.user.id;
    const { bookingId, rating, comment } = req.body;

    if (!bookingId || !rating) {
      return res.status(400).json({ message: 'bookingId and rating are required' });
    }

    const ratingValue = Number(rating);
    if (!Number.isInteger(ratingValue) || ratingValue < 1 || ratingValue > 5) {
      return res.status(400).json({ message: 'Rating must be an integer between 1 and 5' });
    }

    const bookingResult = await query(
      `SELECT id, customer_id, technician_id, status
       FROM bookings
       WHERE id = $1`,
      [bookingId]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const booking = bookingResult.rows[0];

    if (booking.customer_id !== customerId) {
      return res.status(403).json({ message: 'Not authorized to review this booking' });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({ message: 'Feedback is allowed only after work completion' });
    }

    if (!booking.technician_id) {
      return res.status(400).json({ message: 'Cannot review booking without assigned technician' });
    }

    const existingResult = await query(
      'SELECT id FROM reviews WHERE booking_id = $1 AND customer_id = $2',
      [bookingId, customerId]
    );

    let reviewResult;
    if (existingResult.rows.length > 0) {
      reviewResult = await query(
        `UPDATE reviews
         SET rating = $1, comment = $2
         WHERE booking_id = $3 AND customer_id = $4
         RETURNING *`,
        [ratingValue, comment || '', bookingId, customerId]
      );
    } else {
      reviewResult = await query(
        `INSERT INTO reviews (booking_id, customer_id, technician_id, rating, comment)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [bookingId, customerId, booking.technician_id, ratingValue, comment || '']
      );
    }

    await recalculateTechnicianRating(booking.technician_id);

    res.status(201).json({
      message: existingResult.rows.length > 0 ? 'Feedback updated successfully' : 'Feedback submitted successfully',
      review: reviewResult.rows[0],
    });
  } catch (error) {
    console.error('Upsert review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @route   GET /api/reviews/booking/:bookingId
 * @desc    Get review for a booking
 * @access  Private
 */
export const getReviewByBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { id: userId, role } = req.user;

    const bookingResult = await query(
      `SELECT id, customer_id, technician_id
       FROM bookings
       WHERE id = $1`,
      [bookingId]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const booking = bookingResult.rows[0];
    if (role === 'customer' && booking.customer_id !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (role === 'technician') {
      const techResult = await query('SELECT id FROM technicians WHERE user_id = $1', [userId]);
      if (techResult.rows.length === 0 || techResult.rows[0].id !== booking.technician_id) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    }

    const result = await query(
      `SELECT r.*, u.full_name as customer_name
       FROM reviews r
       LEFT JOIN users u ON r.customer_id = u.id
       WHERE r.booking_id = $1`,
      [bookingId]
    );

    if (result.rows.length === 0) {
      return res.json({ review: null });
    }

    res.json({ review: result.rows[0] });
  } catch (error) {
    console.error('Get review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};