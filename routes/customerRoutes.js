import express from 'express';
import {
  getCustomers,
  getNextCustomerId,
  getCustomerById,
  getCustomerBillingInfo,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from '../controllers/customerController.js';
import { protect, manager } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/next-id', protect, getNextCustomerId);

router.route('/')
  .get(protect, getCustomers)
  .post(protect, createCustomer);

router.get('/:id/billing-info', protect, getCustomerBillingInfo);

router.route('/:id')
  .get(protect, getCustomerById)
  .put(protect, updateCustomer)
  .delete(protect, manager, deleteCustomer);

export default router;
