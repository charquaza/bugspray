const express = require('express');
const router = express.Router();
const taskRouter = require('./task');
const controller = require('../controllers/projectController');

router.get('/', controller.getAll);
router.post('/', controller.create);

router.get('/:id', controller.getById);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

router.use('/:id/tasks', taskRouter);

module.exports = router;