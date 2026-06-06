import express from 'express';
import { getDashboardStats, getCollectionReport } from '../controllers/reportController.js';
import { protect, manager } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/dashboard', protect, getDashboardStats);
router.get('/collection', protect, manager, getCollectionReport);

export default router;
