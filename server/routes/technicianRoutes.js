import express from 'express';
import { 
  getTechnicians, 
  getTechnicianById, 
  updateTechnician, 
  verifyTechnician 
} from '../controllers/technicianController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getTechnicians);
router.get('/:id', getTechnicianById);

// Protected routes
router.put('/:id', protect, updateTechnician);
router.put('/:id/verify', protect, authorize('admin'), verifyTechnician);

export default router;
