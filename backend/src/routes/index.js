const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/events', require('./event'));
router.use('/bookmarks', require('./bookmark'));
router.use('/upload', require('./upload'));

module.exports = router;
