const express = require('express');
const projectRouter = express.Router();
const projectController = require('../controllers/projectController');

projectRouter.get('/', projectController.getAll);
projectRouter.post('/', projectController.create);

projectRouter.get('/:projectId', projectController.getById);
projectRouter.put('/:projectId', projectController.update);
projectRouter.delete('/:projectId', projectController.delete);

module.exports = projectRouter;