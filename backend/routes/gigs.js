const router = require('express').Router();
const { body } = require('express-validator');
const {
  getGigs, getCategories, getMyGigs, getSavedGigs,
  getGigById, createGig, updateGig, deleteGig, toggleSaveGig,
} = require('../controllers/gigController');
const { protect, optionalAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

// ── Static routes first (MUST be before /:id) ──────────────────────────────
router.get('/categories', getCategories);
router.get('/my',         protect, getMyGigs);
router.get('/saved',      protect, getSavedGigs);

// ── Collection ──────────────────────────────────────────────────────────────
router.get('/', getGigs);

router.post('/',
  protect,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().isLength({ min: 50 }).withMessage('Description must be at least 50 characters'),
    body('category').notEmpty().withMessage('Category is required'),
    body('price').isFloat({ min: 1 }).withMessage('Price must be a positive number'),
  ],
  validate,
  createGig
);

// ── Parameterised routes ─────────────────────────────────────────────────────
router.get   ('/:id',      optionalAuth, getGigById);
router.put   ('/:id',      protect,      updateGig);
router.delete('/:id',      protect,      deleteGig);
router.post  ('/:id/save', protect,      toggleSaveGig);

module.exports = router;