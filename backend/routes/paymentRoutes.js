import express from 'express';
import auth from '../src/middleware/auth.js';
import { createOrder, verifyPayment } from '../src/controllers/paymentController.js';

const router = express.Router();

// Create Razorpay order
router.post('/create-order', auth, createOrder);

// Verify payment after success
router.post('/verify', auth, verifyPayment);

export default router;
