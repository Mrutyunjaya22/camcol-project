const router = require('express').Router();
const { body } = require('express-validator');
const { createOrder, getMyOrders, getOrderById, updateOrderStatus } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

router.get('/', protect, getMyOrders);

router.post('/',
  protect,
  [
    body('gig_id').notEmpty().withMessage('Gig ID is required'),
  ],
  validate,
  createOrder
);

router.get('/:id', protect, getOrderById);

router.put('/:id/status',
  protect,
  [
    body('status').notEmpty().withMessage('Status is required'),
  ],
  validate,
  updateOrderStatus
);

module.exports = router;