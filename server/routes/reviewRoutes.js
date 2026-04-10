import express from 'express';
import { getReviewByBooking, upsertReview } from '../controllers/reviewController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/booking/:bookingId', getReviewByBooking);
router.post('/', authorize('customer'), upsertReview);

export default router;