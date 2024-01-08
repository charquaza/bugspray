const Task = require('../models/task');
const Project = require('../models/project');
const Member = require('../models/member');
const Sprint = require('../models/sprint');
const { body, param, query, validationResult } = require('express-validator');

exports.getAll = [
   async function checkPermissions(req, res, next) {
      if (!req.user) {
         return res.status(404).json({ errors: 'Task not found' });
      }

      return next();
   },

   query('projectId').optional({ values: 'falsy' })
      .isString().withMessage('Invalid value for projectId').bail()
      .trim(),

   async function (req, res, next) {
      var validationErrors = validationResult(req);
      if (!validationErrors.isEmpty()) {
         let errorMessageList = validationErrors.array().map(err => err.msg);
         return res.status(400).json({ errors: errorMessageList });
      }

      try {
         if (req.query.projectId) {
            let projectData = await Project.findById(req.query.projectId).exec();

            //do not send task data if requesting user is not admin or
            //not involved in parent project
            if (
               req.user.privilege !== 'admin' &&
               req.user._id.toString() !== projectData.lead._id.toString() &&
               !projectData.team.some(member => req.user._id.toString() === member._id.toString())
            ) {
               return res.status(404).json({ errors: 'Task not found' });
            } else {
               let taskList = await Task.find({ project: req.query.projectId })
                  .populate({ path: 'project', populate: { 
                     path: 'lead team', select: '-password' 
                  } })
                  .populate('createdBy', '-password')
                  .populate('sprint')
                  .populate('assignees', '-password')
                  .exec();
               
               return res.json({ data: taskList });
            }
         } else {
            if (req.user.privilege === 'admin') {
               //send all tasks (of all projects) if user is admin
               let taskList = await Task.find({})
                  .populate({ path: 'project', populate: { 
                     path: 'lead team', select: '-password' 
                  } })
                  .populate('createdBy', '-password')
                  .populate('sprint')
                  .populate('assignees', '-password')
                  .exec();
               
                  return res.json({ data: taskList });
            } else {
               //send all tasks of only projects that user is involved in
               let projectList = await Project.find({ 
                  $or: [ { lead: req.user._id }, { team: req.user._id } ] 
               }).exec();
               projectIdList = projectList.map(project => project._id);

               let taskList = await Task.find({ project: { $in: projectIdList } })
                  .populate({ path: 'project', populate: { 
                     path: 'lead team', select: '-password' 
                  } })
                  .populate('createdBy', '-password')
                  .populate('sprint')
                  .populate('assignees', '-password')
                  .exec();

               return res.json({ data: taskList });
            }
         }
      } catch (err) {
         return next(err);
      }
   }
];

exports.getById = [
   async function checkPermissions(req, res, next) {
      if (!req.user) {
         return res.status(404).json({ errors: 'Task not found' });
      }

      return next();
   },

   param('taskId').isString().withMessage('Invalid value for taskId').bail()
      .trim().notEmpty().withMessage('taskId cannot be blank'),

   async function (req, res, next) {
      var validationErrors = validationResult(req);
      if (!validationErrors.isEmpty()) {
         let errorMessageList = validationErrors.array().map(err => err.msg);
         return res.status(400).json({ errors: errorMessageList });
      }

      try {
         let taskData = await Task.findById(req.params.taskId)
            .populate({ path: 'project', populate: { path: 'lead team', select: '-password' } })
            .populate('createdBy', '-password')
            .populate('sprint')
            .populate('assignees', '-password')
            .exec();

         if (taskData === null) {
            res.status(404).json({ errors: ['Task not found'] });
         } else {
            //don't send task data if 
            //currUser is not admin, lead, or team member of parent project
            if (req.user.privilege !== 'admin') {
               let projectData = await Project.findById(taskData.project._id).exec();

               if (projectData === null) {
                  return res.status(400).json({ errors: ['Parent project not found'] });
               } else if (
                  req.user._id.toString() !== projectData.lead._id.toString() &&
                  !projectData.team.some(member => req.user._id.toString() === member._id.toString())
               ) {
                  return res.status(404).json({ errors: ['Task not found'] });
               }  
            }
   
            res.json({ data: taskData });
         }
      } catch (err) {
         return next(err);
      }
   }
];

exports.create = [
   async function checkPermissions(req, res, next) {
      if (!req.user) {
         return res.status(404).json({ errors: 'Task not found' });
      }

      return next();
   },

   body('title').isString().withMessage('Invalid value for Title').bail()
      .trim().notEmpty().withMessage('Title cannot be blank')
      .isLength({ max: 100 }).withMessage('Title cannot be longer than 100 characters')
      .escape(),
   body('description').isString().withMessage('Invalid value for Description').bail()
      .trim().notEmpty().withMessage('Description cannot be blank')
      .escape(),
   body('project').isString().withMessage('Invalid value for Project').bail()
      .trim().notEmpty().withMessage('Project cannot be blank')
      .escape(),
   body('status').isString().withMessage('Invalid value for Status').bail()
      .trim().notEmpty().withMessage('Status cannot be blank')
      .isLength({ max: 100 }).withMessage('Status cannot be longer than 100 characters')
      .escape(),
   body('priority').isString().withMessage('Invalid value for Priority').bail()
      .trim().notEmpty().withMessage('Priority cannot be blank')
      .isLength({ max: 100 }).withMessage('Priority cannot be longer than 100 characters')
      .escape(),
   body('sprint').isString().withMessage('Invalid value for Sprint').bail()
      .trim().escape(),
   body('assignees').isArray().withMessage('Invalid value for Assignees').bail()
      .isArray({ min: 1 }).withMessage('Assignees cannot be empty')
      .escape(),

   async function (req, res, next) {
      var validationErrors = validationResult(req);

      if (!validationErrors.isEmpty()) {
         let errorMessageList = validationErrors.array().map(err => err.msg);
         return res.status(400).json({ errors: errorMessageList });
      } 

      try {
         //check if project exists
         let projectData = await Project.findById(req.body.project).exec();

         if (projectData === null) {
            return res.status(400).json({ 
               errors: ['Cannot create task: project not found'] 
            });
         }

         //prevent task creation if 
         //currUser is not admin, lead, or team member of parent project
         if (
            req.user.privilege !== 'admin' &&
            req.user._id.toString() !== projectData.lead._id.toString() &&
            !projectData.team.some(member => req.user._id.toString() === member._id.toString())
         ) {
            return res.status(403).json({ errors: ['Not allowed'] });
         }  

         //make sure all assignees are lead or team member of parent project
         let assigneesValid = req.body.assignees.every(assignee => {
            return assignee === projectData.lead._id.toString() ||
               projectData.team.some(member => assignee === member._id.toString());
         });
         if (!assigneesValid) {
            return res.status(400).json({ errors: ['All assignees must be involved in parent project'] });
         }

         //check if assignees exist
         let assigneesCount = await Member.countDocuments(
            { _id: { $in: req.body.assignees } }
         ).exec();

         if (assigneesCount !== req.body.assignees.length) {
            return res.status(400).json({ 
               errors: ['Cannot create task: Assignee(s) not found'] 
            });
         }

         //if sprint has been provided, check if sprint exists
         if (req.body.sprint) {
            let sprintData = await Sprint.findById(req.body.sprint).exec();

            if (sprintData === null) {
               return res.status(400).json({ 
                  errors: ['Cannot create task: sprint not found'] 
               });
            }   
         }
      
         //project and all assignees exist, proceed with task creation
         let newTask = new Task({
            title: req.body.title,
            description: req.body.description,
            project: req.body.project,
            dateCreated: Date.now(),
            createdBy: req.user._id,
            status: req.body.status,
            priority: req.body.priority,
            sprint: req.body.sprint,
            assignees: req.body.assignees
         });

         let newTaskData = await newTask.save();
         res.json({ data: newTaskData });
      } catch (err) {
         return next(err);
      }
   }
];

exports.update = [
   async function checkPermissions(req, res, next) {
      if (!req.user) {
         return res.status(404).json({ errors: 'Task not found' });
      }

      return next();
   },

   body('title').isString().withMessage('Invalid value for Title').bail()
      .trim().notEmpty().withMessage('Title cannot be blank')
      .isLength({ max: 100 }).withMessage('Title cannot be longer than 100 characters')
      .escape(),
   body('description').isString().withMessage('Invalid value for Description').bail()
      .trim().notEmpty().withMessage('Description cannot be blank')
      .escape(),
   body('project').isString().withMessage('Invalid value for Project').bail()
      .trim().notEmpty().withMessage('Project cannot be blank')
      .escape(),
   body('createdBy')
      .if((value, { req }) => {
         //only admins can edit createdBy field; ignore field if user is not admin
         return req.user.privilege === 'admin';
      })
      .isString().withMessage('Invalid value for Creator').bail()
      .trim().notEmpty().withMessage('Creator cannot be blank')
      .escape(),
   body('status').isString().withMessage('Invalid value for Status').bail()
      .trim().notEmpty().withMessage('Status cannot be blank')
      .isLength({ max: 100 }).withMessage('Status cannot be longer than 100 characters')
      .escape(),
   body('priority').isString().withMessage('Invalid value for Priority').bail()
      .trim().notEmpty().withMessage('Priority cannot be blank')
      .isLength({ max: 100 }).withMessage('Priority cannot be longer than 100 characters')
      .escape(),
   body('sprint').isString().withMessage('Invalid value for Sprint').bail()
      .trim().escape(),
   body('assignees').isArray().withMessage('Invalid value for Assignees').bail()
      .isArray({ min: 1 }).withMessage('Assignees cannot be empty')
      .escape(),

   param('taskId').isString().withMessage('Invalid value for taskId').bail()
      .trim().notEmpty().withMessage('taskId cannot be blank'),


   async function (req, res, next) {
      var validationErrors = validationResult(req);

      if (!validationErrors.isEmpty()) {
         let errorMessageList = validationErrors.array().map(err => err.msg);
         return res.status(400).json({ errors: errorMessageList });
      } 

      try {
         //check if project exists
         let projectData = await Project.findById(req.body.project).exec();

         if (projectData === null) {
            return res.status(400).json({ 
               errors: ['Cannot update task: project not found'] 
            });
         }
         
         //prevent task update if 
         //currUser is not admin, lead, or team member of parent project
         if (
            req.user.privilege !== 'admin' &&
            req.user._id.toString() !== projectData.lead._id.toString() &&
            !projectData.team.some(member => req.user._id.toString() === member._id.toString())
         ) {
            return res.status(403).json({ errors: ['Not allowed'] });
         }  

         //make sure all assignees are lead or team member of parent project
         let assigneesValid = req.body.assignees.every(assignee => {
            return assignee === projectData.lead._id.toString() ||
               projectData.team.some(member => assignee === member._id.toString());
         });
         if (!assigneesValid) {
            return res.status(400).json({ errors: ['All assignees must be involved in parent project'] });
         }

         //if user is admin
         if (req.user.privilege === 'admin') {
            //check if creator exists
            let creator = await Member.findById(req.body.createdBy).exec();

            if (creator === null) {
               return res.status(400).json({ 
                  errors: ['Cannot update task: Creator not found'] 
               });
            }   
         }

         //check if assignees exist
         let assigneesCount = await Member.countDocuments(
            { _id: { $in: req.body.assignees } }
         ).exec();

         if (assigneesCount !== req.body.assignees.length) {
            return res.status(400).json(
               { errors: ['Cannot update task: Assignee(s) not found'] }
            );
         }

         //if sprint has been provided, check if sprint exists
         if (req.body.sprint) {
            let sprintData = await Sprint.findById(req.body.sprint).exec();

            if (sprintData === null) {
               return res.status(400).json({ 
                  errors: ['Cannot create task: sprint not found'] 
               });
            }   
         }
         
         //project, creator, and all assignees exist, proceed with task update
         let fieldsToUpdate = {
            title: req.body.title,
            description: req.body.description,
            project: req.body.project,
            status: req.body.status,
            priority: req.body.priority,
            sprint: req.body.sprint,
            assignees: req.body.assignees
         };

         //update createdBy field if user is admin
         if (req.user.privilege === 'admin') {
            fieldsToUpdate.createdBy = req.body.createdBy;
         }

         let oldTaskData = await 
            Task.findByIdAndUpdate(req.params.taskId, fieldsToUpdate)
               .exec();
         
         if (oldTaskData === null) {
            res.status(404).json({ errors: ['Task not found'] });
         } else {
            res.json({ data: oldTaskData });
         }
      } catch (err) {
         return next(err);
      }
   }
];

exports.delete = [
   async function checkPermissions(req, res, next) {
      if (!req.user) {
         return res.status(404).json({ errors: 'Task not found' });
      }

      return next();
   },

   param('taskId').isString().withMessage('Invalid value for taskId').bail()
      .trim().notEmpty().withMessage('taskId cannot be blank'),

   async function (req, res, next) {
      var validationErrors = validationResult(req);
      if (!validationErrors.isEmpty()) {
         let errorMessageList = validationErrors.array().map(err => err.msg);
         return res.status(400).json({ errors: errorMessageList });
      }

      try {
         let taskData = await Task.findById(req.params.taskId).exec();

         if (taskData === null) {
            return res.status(404).json({ errors: ['Task not found'] });
         } else {
            //prevent task delete if
            //currUser is not admin, lead, or team member of parent project
            if (req.user.privilege !== 'admin') {
               let projectData = await Project.findById(taskData.project._id).exec();

               if (projectData === null) {
                  return res.status(400).json({ errors: ['Parent project not found'] });
               } else if (
                  req.user._id.toString() !== projectData.lead._id.toString() &&
                  !projectData.team.some(member => req.user._id.toString() === member._id.toString())
               ) {
                  return res.status(404).json({ errors: ['Task not found'] });
               }  
            }

            let deletedTaskData = await Task.findByIdAndDelete(req.params.taskId).exec();

            if (deletedTaskData === null) {
               res.status(404).json({ errors: ['Task not found'] });
            } else {
               res.json({ data: deletedTaskData });
            }
         }
      } catch (err) {
         return next(err);
      }
   }
];