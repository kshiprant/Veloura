import { Router } from 'express';
import auth from '../middleware/auth.js';

import {
  startConversationSession,
  getConversationSession,
  sendConversationMessage,
  requestReveal,
  skipPrompt,
  trySomeoneElse,
} from '../controllers/conversationController.js';

const router = Router();

router.use(auth);

// Start or resume session
router.post('/start', startConversationSession);

// Get session + messages
router.get('/:sessionId', getConversationSession);

// Send message
router.post('/:sessionId/message', sendConversationMessage);

// Request reveal
router.post('/:sessionId/reveal', requestReveal);

// Change prompt
router.post('/:sessionId/skip', skipPrompt);

// End session
router.post('/:sessionId/next', trySomeoneElse);

export default router;
