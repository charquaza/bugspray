const express = require('express');
const sprintRouter = express.Router();
const sprintController = require('../controllers/sprintController');

sprintRouter.get('/', sprintController.getAll);
sprintRouter.post('/', sprintController.create);

sprintRouter.get('/:sprintId', sprintController.getById);
sprintRouter.put('/:sprintId', sprintController.update);
sprintRouter.delete('/:sprintId', sprintController.delete);

module.exports = sprintRouter;