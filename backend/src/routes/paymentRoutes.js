import express from 'express';
import auth from '../src/middleware/auth.js';
import { createOrder } from '../src/controllers/paymentController.js';

const router = express.Router();

router.post('/create-order', auth, createOrder);

export default router;
