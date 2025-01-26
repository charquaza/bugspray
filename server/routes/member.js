const express = require('express');
const memberRouter = express.Router();
const memberController = require('../controllers/memberController');

memberRouter.get('/', memberController.getAll);
memberRouter.get('/curr-user', memberController.getCurrUser);

memberRouter.post('/', memberController.create);
memberRouter.post('/sign-up', memberController.signUp);
memberRouter.post('/log-in', memberController.logIn);
memberRouter.post('/log-out', memberController.logOut);

memberRouter.get('/:memberId', memberController.getById);
memberRouter.put('/:memberId', memberController.update);
memberRouter.delete('/:memberId', memberController.delete);

module.exports = memberRouter;