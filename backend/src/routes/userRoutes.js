import { Router } from 'express';
import { body } from 'express-validator';
import auth from '../middleware/auth.js';
import {
  getDiscovery,
  getLikesReceived,
  getMyMatches,
  likeUser,
  saveOnboarding,
  updateProfile
} from '../controllers/userController.js';

const router = Router();

router.use(auth);

router.put(
  '/onboarding',
  [
    body('age').optional().isInt({ min: 18, max: 100 }),
    body('bio').optional().isLength({ max: 500 }),
    body('interests').optional().isArray(),
    body('photos').optional().isArray(),
    body('prompts').optional().isArray()
  ],
  saveOnboarding
);

router.put('/profile', updateProfile);
router.get('/discovery', getDiscovery);
router.get('/likes-received', getLikesReceived);
router.post('/like/:targetUserId', likeUser);
router.get('/matches', getMyMatches);

export default router;
