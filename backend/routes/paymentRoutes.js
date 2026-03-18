import express from 'express';
import auth from '../src/middleware/auth.js';
import { createOrder } from '../controllers/paymentController.js';

const router = express.Router();

// Create Razorpay order
router.post('/create-order', auth, async (req, res, next) => {
  try {
    await createOrder(req, res);
  } catch (error) {
    console.error('create-order route error:', error);
    next(error);
  }
});

export default router;
