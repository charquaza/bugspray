const express = require('express');
const router = express.Router();

const memberRouter = require('./member');
const projectRouter = require('./project');
const taskRouter = require('./task');
const sprintRouter = require('./sprint');

router.use('/members', memberRouter);
router.use('/projects', projectRouter);
router.use('/tasks', taskRouter);
router.use('/sprints', sprintRouter);

module.exports = router;