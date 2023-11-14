const express = require('express');
const taskRouter = express.Router();
const taskController = require('../controllers/taskController');

taskRouter.get('/', taskController.getAll);
taskRouter.post('/', taskController.create);

taskRouter.get('/:taskId', taskController.getById);
taskRouter.put('/:taskId', taskController.update);
taskRouter.delete('/:taskId', taskController.delete);

module.exports = taskRouter;