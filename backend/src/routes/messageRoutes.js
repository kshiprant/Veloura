import { Router } from 'express';
import { body } from 'express-validator';
import auth from '../middleware/auth.js';
import { getMessages, sendMessage } from '../controllers/messageController.js';

const router = Router();
router.use(auth);

router.get('/:matchId', getMessages);
router.post('/:matchId', [body('content').trim().notEmpty()], sendMessage);

export default router;
