import express from 'express';
import auth from '../middleware/auth.js';
import { completeMockCheckout } from '../controllers/billingController.js';

const router = express.Router();

router.post('/checkout/mock-complete', auth, completeMockCheckout);

export default router;
