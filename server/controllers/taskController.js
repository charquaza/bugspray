const Task = require('../models/task');
const Project = require('../models/project');
const Member = require('../models/member');
const Sprint = require('../models/sprint');
const { body, param, query, validationResult } = require('express-validator');
const { sendChannelMessage, sendDirectMessage } = require('../services/slackService');

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
            //not involved in parent project or
            //user is demo user and project is not available to demo user
            if (
               req.user.privilege !== 'admin' &&
               req.user._id.toString() !== projectData.lead._id.toString() &&
               !projectData.team.some(member => req.user._id.toString() === member._id.toString()) &&
               !(req.user.privilege === 'demo' && 
                  [ process.env.PROJ_ID_BUGSPRAY, process.env.PROJ_ID_PEARLION ].includes(req.query.projectId))
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
               const searchFilter = req.user.privilege === 'demo'
                  ? { $or: [ 
                     { _id: { $in: [ process.env.PROJ_ID_BUGSPRAY, process.env.PROJ_ID_PEARLION ] } }, 
                     { lead: req.user._id }, { team: req.user._id } 
                  ] }
                  : { $or: [ { lead: req.user._id }, { team: req.user._id } ] };
               let projectList = await Project.find(searchFilter).exec();
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
            //or currUser is demo user and project is not available to demo user
            if (req.user.privilege !== 'admin') {
               let projectData = await Project.findById(taskData.project._id).exec();

               if (projectData === null) {
                  return res.status(400).json({ errors: ['Parent project not found'] });
               } else if (
                  req.user._id.toString() !== projectData.lead._id.toString() &&
                  !projectData.team.some(member => req.user._id.toString() === member._id.toString()) &&
                  !(req.user.privilege === 'demo' && 
                     [ process.env.PROJ_ID_BUGSPRAY, process.env.PROJ_ID_PEARLION ].includes(projectData._id.toString()))
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
         let assigneesList = await Member.find(
            { _id: { $in: req.body.assignees } }
         ).exec();

         if (assigneesList.length !== req.body.assignees.length) {
            return res.status(400).json({ 
               errors: ['Cannot create task: Assignee(s) not found'] 
            });
         }

         //if sprint has been provided, check if sprint exists
         if (req.body.sprint) {
            var sprintData = await Sprint.findById(req.body.sprint).exec();

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
            sprint: req.body.sprint || null,
            assignees: req.body.assignees
         });

         let newTaskData = await newTask.save();

         //send slack message to project channel
         sendChannelMessage(
            projectData.slackChannelId,
            `New task created - \n
            Title: ${newTaskData.title}\n
            Status: ${newTaskData.status}\n
            Priority: ${newTaskData.priority}\n
            Sprint: ${newTaskData.sprint ? sprintData.name : 'N/A'}\n
            Description: ${newTaskData.description}\n
            Assignees: ${assigneesList.map(assignee => {
               return assignee.firstName + ' ' + assignee.lastName;
            }).join(', ')}`
         );

         //send direct message to assignees
         assigneesList.forEach(assignee => {
            sendDirectMessage(
               assignee.slackMemberId,
               `You have been assigned to a new task - \n
               Title: ${newTaskData.title}\n
               Status: ${newTaskData.status}\n
               Priority: ${newTaskData.priority}\n
               Sprint: ${newTaskData.sprint ? sprintData.name : 'N/A'}\n
               Description: ${newTaskData.description}`
            );
         });
         
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
            var sprintData = await Sprint.findById(req.body.sprint).exec();

            if (sprintData === null) {
               return res.status(400).json({ 
                  errors: ['Cannot create task: sprint not found'] 
               });
            }   
         }
         
         //project and all assignees exist, proceed with task update
         let fieldsToUpdate = {
            title: req.body.title,
            description: req.body.description,
            project: req.body.project,
            status: req.body.status,
            priority: req.body.priority,
            sprint: req.body.sprint || null,
            assignees: req.body.assignees
         };

         let oldTaskData = await 
            Task.findByIdAndUpdate(req.params.taskId, fieldsToUpdate)
               .exec();
         
         if (oldTaskData === null) {
            res.status(404).json({ errors: ['Task not found'] });
         } else {
            let slackMessage = [`Task '${oldTaskData.title}' has been updated - `];

            if (fieldsToUpdate.title !== oldTaskData.title) {
               slackMessage.push(`New Title: '${fieldsToUpdate.title}'`);
            }
            if (fieldsToUpdate.status !== oldTaskData.status) {
               slackMessage.push(`New Status: '${fieldsToUpdate.status}'`);
            }
            if (fieldsToUpdate.priority !== oldTaskData.priority) {
               slackMessage.push(`New Priority: '${fieldsToUpdate.priority}'`);
            }

            if (oldTaskData.sprint) {
               if (!fieldsToUpdate.sprint) {
                  //send slack (Sprint -> unassigned)
                  slackMessage.push(`New Sprint: N/A (unassigned)`);
               } else if (oldTaskData.sprint.toString() !== fieldsToUpdate.sprint) {
                  //send slack (Sprint -> new Sprint)
                  slackMessage.push(`New Sprint: '${sprintData.name}'`);
               }
            } else {
               if (fieldsToUpdate.sprint) {
                  //send slack (unassigned -> Sprint)
                  slackMessage.push(`New Sprint: '${sprintData.name}'`);
               }
            }

            if (fieldsToUpdate.description !== oldTaskData.description) {
               slackMessage.push(`New Description: '${fieldsToUpdate.description}'`);
            }

            //map old assignees to check for changes
            let oldAssigneesMap = new Map();
            oldTaskData.assignees.forEach(memberId => {
               oldAssigneesMap.set(memberId.toString(), true);
            });
            
            let newAssignees = [];
            fieldsToUpdate.assignees.forEach(memberId => {
               if (!oldAssigneesMap.has(memberId)) {
                  newAssignees.push(memberId);
               } else {
                  oldAssigneesMap.delete(memberId);
               }
            });

            //members remaining in oldAssigneesMap have been removed
            let removedAssignees = [];
            for (let [memberId] of oldAssigneesMap) {
               removedAssignees.push(memberId);
            }

            //construct Slack channel message regarding new assignees
            //and send direct message to new assignees
            if (newAssignees.length > 0) {
               let newMembers = await Member.find(
                  { _id: { $in: newAssignees } }, 'firstName lastName slackMemberId'
               ).exec();

               slackMessage.push(`New Assignees: ${newMembers.map(member => {
                  return member.firstName + ' ' + member.lastName;
               }).join(', ')}`);

               //send direct message to new assignees
               newMembers.forEach(assignee => {
                  sendDirectMessage(
                     assignee.slackMemberId,
                     `You have been assigned to a new task - \n
                     Title: ${fieldsToUpdate.title}\n
                     Status: ${fieldsToUpdate.status}\n
                     Priority: ${fieldsToUpdate.priority}\n
                     Sprint: ${fieldsToUpdate.sprint ? sprintData.name : 'N/A'}\n
                     Description: ${fieldsToUpdate.description}`
                  );
               });
            }
            
            //construct Slack channel message regarding removed assignees
            //and send direct message to removed assignees
            if (removedAssignees.length > 0) {
               let removedMembers = await Member.find(
                  { _id: { $in: removedAssignees } }, 'firstName lastName slackMemberId'
               ).exec();

               slackMessage.push(`Removed Assignees: ${removedMembers.map(member => {
                  return member.firstName + ' ' + member.lastName;
               }).join(', ')}`);

               //send direct message to removed members
               removedMembers.forEach(member => {
                  sendDirectMessage(
                     member.slackMemberId,
                     `You have been unassigned from the following task - \n
                     Title: ${oldTaskData.title}\n
                     Description: ${oldTaskData.description}`
                  );
               });
            }

            //send Slack channel message if any changes were made
            if (slackMessage.length > 1) {
               sendChannelMessage(projectData.slackChannelId, slackMessage.join('\n'));
            }
      
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
         let projectData = await Project.findById(taskData.project._id).exec();

         if (taskData === null) {
            return res.status(404).json({ errors: ['Task not found'] });
         } else {
            //prevent task delete if
            //currUser is not admin, lead, or team member of parent project
            if (req.user.privilege !== 'admin') {
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
               sendChannelMessage(
                  projectData.slackChannelId, 
                  `Task '${deletedTaskData.title}' has been deleted.`
               );

               res.json({ data: deletedTaskData });
            }
         }
      } catch (err) {
         return next(err);
      }
   }
];