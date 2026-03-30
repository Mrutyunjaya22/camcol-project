const router = require('express').Router();
const { body } = require('express-validator');
const {
  getProjects, getMyProjects, getProjectById, getApplicants,
  createProject, updateProject, deleteProject,
  applyToProject, updateMemberStatus,
} = require('../controllers/projectController');
const { protect, optionalAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

// ── Static routes first (MUST be before /:id) ──────────────────────────────
router.get('/my', protect, getMyProjects);

// ── Collection ──────────────────────────────────────────────────────────────
router.get('/', getProjects);

router.post('/',
  protect,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().isLength({ min: 50 }).withMessage('Description must be at least 50 characters'),
    body('category').notEmpty().withMessage('Category is required'),
  ],
  validate,
  createProject
);

// ── Parameterised routes ─────────────────────────────────────────────────────
router.get   ('/:id',                    optionalAuth, getProjectById);
router.put   ('/:id',                    protect,      updateProject);
router.delete('/:id',                    protect,      deleteProject);
router.post  ('/:id/apply',              protect,      applyToProject);
router.put   ('/:id/members/:userId',    protect,      updateMemberStatus);
router.get   ('/:id/applicants',         protect,      getApplicants);

module.exports = router;