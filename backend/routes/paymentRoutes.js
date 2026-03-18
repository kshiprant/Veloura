import express from 'express';
import auth from '../middleware/auth.js';
import { createOrder } from '../controllers/paymentController.js';

const router = express.Router();

router.post('/create-order', auth, createOrder);

export default router;
