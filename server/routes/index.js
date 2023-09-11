const express = require('express');
const router = express.Router();

const memberRouter = require('./member');
const projectRouter = require('./project');

router.use('/members', memberRouter);
router.use('/projects', projectRouter);

module.exports = router;
