const express = require('express');
const memberRouter = express.Router();
const memberController = require('../controllers/memberController');

memberRouter.get('/', memberController.getAll);
memberRouter.post('/', memberController.create);

memberRouter.get('/:memberId', memberController.getById);
memberRouter.put('/:memberId', memberController.update);
memberRouter.delete('/:memberId', memberController.delete);

module.exports = memberRouter;