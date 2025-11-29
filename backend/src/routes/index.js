const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/events', require('./event'));
router.use('/upload', require('./upload'));
router.use('/', require('./registration'));
router.use('/', require('./comment'));

module.exports = router;
