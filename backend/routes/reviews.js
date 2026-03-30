const router = require('express').Router();
const { body } = require('express-validator');
const { createReview, getUserReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

// Static before param
router.get('/user/:userId', getUserReviews);

router.post('/',
  protect,
  [
    body('order_id').notEmpty().withMessage('Order ID is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  ],
  validate,
  createReview
);

module.exports = router;