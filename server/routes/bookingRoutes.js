import express from 'express';
import { 
  getBookings, 
  getBookingById, 
  createBooking, 
  updateBooking, 
  deleteBooking 
} from '../controllers/bookingController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/', getBookings);
router.get('/:id', getBookingById);
router.post('/', authorize('customer'), createBooking);
router.put('/:id', updateBooking);
router.delete('/:id', deleteBooking);

export default router;
