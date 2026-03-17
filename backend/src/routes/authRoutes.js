import { Router } from 'express';
import { body } from 'express-validator';
import auth from '../middleware/auth.js';
import { login, me, register } from '../controllers/authController.js';

const router = Router();

router.post(
  '/register',
  [body('email').isEmail(), body('password').isLength({ min: 8 })],
  register
);

router.post('/login', [body('email').isEmail(), body('password').notEmpty()], login);
router.get('/me', auth, me);

export default router;
