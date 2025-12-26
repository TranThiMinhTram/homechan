import express from 'express';
import { getDiscounts, createDiscount, updateDiscount, deleteDiscount, validateDiscount, useDiscount, toggleDiscountStatus } from '../controllers/discountController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All discount routes require authentication
router.use(protect);

// Get all discounts for the current user
router.get('/', getDiscounts);

// Create a new discount
router.post('/', createDiscount);

// Update a discount
router.put('/:id', updateDiscount);

// Delete a discount
router.delete('/:id', deleteDiscount);

// Validate discount code (for booking)
router.post('/validate', validateDiscount);

// Use discount (increment used count)
router.post('/use', useDiscount);

// Toggle discount status
router.patch('/:id/toggle', toggleDiscountStatus);

export default router;
