const router = require('express').Router();
const { body } = require('express-validator');
const { getConversations, getUnreadCount, getMessages, sendMessage } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

// Static routes BEFORE /:userId
router.get('/conversations', protect, getConversations);
router.get('/unread-count',  protect, getUnreadCount);

// Parameterised
router.get('/:userId', protect, getMessages);

router.post('/',
  protect,
  [
    body('receiver_id').notEmpty().withMessage('Receiver ID is required'),
    body('content').trim().notEmpty().withMessage('Message content is required'),
  ],
  validate,
  sendMessage
);

module.exports = router;