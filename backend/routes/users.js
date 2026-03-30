const router = require('express').Router();
const { searchUsers, getUserProfile } = require('../controllers/userController');

router.get('/',    searchUsers);
router.get('/:id', getUserProfile);

module.exports = router;