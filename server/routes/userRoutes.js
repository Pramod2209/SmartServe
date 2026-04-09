import express from 'express';
import { 
  getUsers, 
  getUserById, 
  updateUser, 
  deleteUser 
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Admin routes
router.get('/', authorize('admin'), getUsers);
router.delete('/:id', authorize('admin'), deleteUser);

// Admin or own profile
router.get('/:id', getUserById);
router.put('/:id', updateUser);

export default router;
