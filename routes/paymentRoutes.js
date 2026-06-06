import express from 'express';
import {
  getPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
} from '../controllers/paymentController.js';
import { protect, manager } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getPayments)
  .post(protect, createPayment);

router.route('/:id')
  .get(protect, getPaymentById)
  .put(protect, updatePayment)
  .delete(protect, manager, deletePayment);

export default router;
