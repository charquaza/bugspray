const Sprint = require('../models/sprint');
const Project = require('../models/project');
const { body, param, query, validationResult } = require('express-validator');
const { sendChannelMessage } = require('../services/slackService');

exports.getAll = [
   async function checkPermissions(req, res, next) {
      if (!req.user) {
         return res.status(404).json({ errors: ['Sprint not found'] });
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

            //do not send sprint data if requesting user is not admin or
            //not involved in parent project or
            //user is demo user and project is not available to demo user
            if (
               req.user.privilege !== 'admin' &&
               req.user._id.toString() !== projectData.lead._id.toString() &&
               !projectData.team.some(member => req.user._id.toString() === member._id.toString()) &&
               !(req.user.privilege === 'demo' && 
                  [ process.env.PROJ_ID_BUGSPRAY, process.env.PROJ_ID_PEARLION ].includes(req.query.projectId))
            ) {
               return res.status(404).json({ errors: ['Sprint not found'] });
            } else {
               let sprintList = await Sprint.find({ project: req.query.projectId })
                  .populate({ path: 'project', populate: { 
                     path: 'lead team', select: '-password' 
                  } })
                  .exec();
               
               return res.json({ data: sprintList });
            }
         } else {
            if (req.user.privilege === 'admin') {
               //send all sprints (of all projects) if user is admin
               let sprintList = await Sprint.find({})
                  .populate({ path: 'project', populate: { 
                     path: 'lead team', select: '-password' 
                  } })
                  .exec();
               
                  return res.json({ data: sprintList });
            } else {
               //send all sprints of only projects that user is involved in
               // or if user is demo user, send sprints of projects available to demo user
               const searchFilter = req.user.privilege === 'demo'
                  ? { $or: [ 
                     { _id: { $in: [ process.env.PROJ_ID_BUGSPRAY, process.env.PROJ_ID_PEARLION ] } }, 
                     { lead: req.user._id }, { team: req.user._id } 
                  ] }
                  : { $or: [ { lead: req.user._id }, { team: req.user._id } ] };
               let projectList = await Project.find(searchFilter).exec();
               projectIdList = projectList.map(project => project._id);

               let sprintList = await Sprint.find({ project: { $in: projectIdList } })
                  .populate({ path: 'project', populate: { 
                     path: 'lead team', select: '-password' 
                  } })
                  .exec();

               return res.json({ data: sprintList });
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
         return res.status(404).json({ errors: ['Sprint not found'] });
      }

      return next();
   },

   param('sprintId').isString().withMessage('Invalid value for sprintId').bail()
      .trim().notEmpty().withMessage('sprintId cannot be blank'),

   async function (req, res, next) {
      var validationErrors = validationResult(req);
      if (!validationErrors.isEmpty()) {
         let errorMessageList = validationErrors.array().map(err => err.msg);
         return res.status(400).json({ errors: errorMessageList });
      }

      try {
         let sprintData = await Sprint.findById(req.params.sprintId)
            .populate({ path: 'project', populate: { path: 'lead team', select: '-password' } })
            .exec();

         if (sprintData === null) {
            res.status(404).json({ errors: ['Sprint not found'] });
         } else {
            //don't send sprint data if 
            //currUser is not admin, lead, or team member of parent project
            //or currUser is demo user and project is not available to demo user
            if (req.user.privilege !== 'admin') {
               let projectData = await Project.findById(sprintData.project._id).exec();

               if (projectData === null) {
                  return res.status(400).json({ errors: ['Parent project not found'] });
               } else if (
                  req.user._id.toString() !== projectData.lead._id.toString() &&
                  !projectData.team.some(member => req.user._id.toString() === member._id.toString()) &&
                  !(req.user.privilege === 'demo' && 
                     [ process.env.PROJ_ID_BUGSPRAY, process.env.PROJ_ID_PEARLION ].includes(projectData._id.toString()))
               ) {
                  return res.status(404).json({ errors: ['Sprint not found'] });
               }  
            }
   
            res.json({ data: sprintData });
         }
      } catch (err) {
         return next(err);
      }
   }
];

exports.create = [
   async function checkPermissions(req, res, next) {
      if (!req.user) {
         return res.status(404).json({ errors: ['Sprint not found'] });
      }

      return next();
   },

   body('name').isString().withMessage('Invalid value for Name').bail()
      .trim().notEmpty().withMessage('Name cannot be blank')
      .isLength({ max: 100 }).withMessage('Name cannot be longer than 100 characters')
      .escape(),
   body('description').isString().withMessage('Invalid value for Description').bail()
      .trim().notEmpty().withMessage('Description cannot be blank')
      .escape(),
   body('project').isString().withMessage('Invalid value for Project').bail()
      .trim().notEmpty().withMessage('Project cannot be blank')
      .escape(),
   body('startDate').isString().withMessage('Invalid value for Start Date').bail()
      .trim().escape().notEmpty().withMessage('Start Date cannot be blank')
      .isISO8601().withMessage('Start Date must be a valid ISO 8601 date'),
   body('endDate').isString().withMessage('Invalid value for End Date').bail()
      .trim().escape().notEmpty().withMessage('End Date cannot be blank')
      .isISO8601().withMessage('End Date must be a valid ISO 8601 date')
      .custom((value, { req }) => {
         const startDate = Date.parse(req.body.startDate);
         const endDate = Date.parse(value);
         return endDate >= startDate;
      }).withMessage('End Date cannot be earlier than Start Date'),

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
               errors: ['Cannot create sprint: project not found'] 
            });
         }

         //prevent sprint creation if 
         //currUser is not admin or lead of parent project
         if (
            req.user.privilege !== 'admin' &&
            req.user._id.toString() !== projectData.lead._id.toString()
         ) {
            return res.status(403).json({ errors: ['Not allowed'] });
         }  
      
         //proceed with sprint creation
         let newSprint = new Sprint({
            name: req.body.name,
            description: req.body.description,
            project: req.body.project,
            startDate: req.body.startDate,
            endDate: req.body.endDate
         });

         let newSprintData = await newSprint.save();

         //send slack message to project channel
         sendChannelMessage(
            projectData.slackChannelId,
            `New sprint created - \n
            Name: ${newSprintData.name}\n
            Start Date: ${newSprintData.startDate.toDateString()}\n
            End Date: ${newSprintData.endDate.toDateString()}\n
            Description: ${newSprintData.description}`
         );

         res.json({ data: newSprintData });
      } catch (err) {
         return next(err);
      }
   }
];

exports.update = [
   async function checkPermissions(req, res, next) {
      if (!req.user) {
         return res.status(404).json({ errors: ['Sprint not found'] });
      }

      return next();
   },

   body('name').isString().withMessage('Invalid value for Name').bail()
      .trim().notEmpty().withMessage('Name cannot be blank')
      .isLength({ max: 100 }).withMessage('Name cannot be longer than 100 characters')
      .escape(),
   body('description').isString().withMessage('Invalid value for Description').bail()
      .trim().notEmpty().withMessage('Description cannot be blank')
      .escape(),
   body('project').isString().withMessage('Invalid value for Project').bail()
      .trim().notEmpty().withMessage('Project cannot be blank')
      .escape(),
   body('startDate').isString().withMessage('Invalid value for Start Date').bail()
      .trim().escape().notEmpty().withMessage('Start Date cannot be blank')
      .isISO8601().withMessage('Start Date must be a valid ISO 8601 date'),
   body('endDate').isString().withMessage('Invalid value for End Date').bail()
      .trim().escape().notEmpty().withMessage('End Date cannot be blank')
      .isISO8601().withMessage('End Date must be a valid ISO 8601 date')
      .custom((value, { req }) => {
         const startDate = Date.parse(req.body.startDate);
         const endDate = Date.parse(value);
         return endDate >= startDate;
      }).withMessage('End Date cannot be earlier than Start Date'),

   param('sprintId').isString().withMessage('Invalid value for sprintId').bail()
      .trim().notEmpty().withMessage('sprintId cannot be blank'),


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
               errors: ['Cannot update sprint: project not found'] 
            });
         }
         
         //prevent sprint update if 
         //currUser is not admin or lead of parent project
         if (
            req.user.privilege !== 'admin' &&
            req.user._id.toString() !== projectData.lead._id.toString()
         ) {
            return res.status(403).json({ errors: ['Not allowed'] });
         }  
      
         //proceed with sprint update
         let fieldsToUpdate = {
            name: req.body.name,
            description: req.body.description,
            project: req.body.project,
            startDate: req.body.startDate,
            endDate: req.body.endDate
         };

         let oldSprintData = await 
            Sprint.findByIdAndUpdate(req.params.sprintId, fieldsToUpdate)
               .exec();
         
         if (oldSprintData === null) {
            res.status(404).json({ errors: ['Sprint not found'] });
         } else {
            let slackMessage = [`Sprint '${oldSprintData.name}' has been updated - `];

            if (fieldsToUpdate.name !== oldSprintData.name) {
               slackMessage.push(`New Name: '${fieldsToUpdate.name}'`);
            }
            if (Date.parse(fieldsToUpdate.startDate) !== oldSprintData.startDate.valueOf()) {
               let date = new Date(fieldsToUpdate.startDate);
               slackMessage.push(`New Start Date: '${date.toDateString()}'`);
            }
            if (Date.parse(fieldsToUpdate.endDate) !== oldSprintData.endDate.valueOf()) {
               let date = new Date(fieldsToUpdate.endDate);
               slackMessage.push(`New End Date: '${date.toDateString()}'`);
            }
            if (fieldsToUpdate.description !== oldSprintData.description) {
               slackMessage.push(`New Description: '${fieldsToUpdate.description}'`);
            }

            if (slackMessage.length > 1) {
               sendChannelMessage(projectData.slackChannelId, slackMessage.join('\n'));
            }

            res.json({ data: oldSprintData });
         }
      } catch (err) {
         return next(err);
      }
   }
];

//should sprint be deletable if it is still referenced by task(s)?
exports.delete = [
   async function checkPermissions(req, res, next) {
      if (!req.user) {
         return res.status(404).json({ errors: ['Sprint not found'] });
      }

      return next();
   },

   param('sprintId').isString().withMessage('Invalid value for sprintId').bail()
      .trim().notEmpty().withMessage('sprintId cannot be blank'),

   async function (req, res, next) {
      var validationErrors = validationResult(req);
      if (!validationErrors.isEmpty()) {
         let errorMessageList = validationErrors.array().map(err => err.msg);
         return res.status(400).json({ errors: errorMessageList });
      }

      try {
         let sprintData = await Sprint.findById(req.params.sprintId).exec();

         if (sprintData === null) {
            return res.status(404).json({ errors: ['Sprint not found'] });
         } else {
            let projectData = await Project.findById(sprintData.project._id).exec();

            if (projectData === null) {
               return res.status(400).json({ errors: ['Parent project not found'] });
            }

            //prevent sprint delete if
            //currUser is not admin or lead of parent project
            if (
               req.user.privilege !== 'admin' && 
               req.user._id.toString() !== projectData.lead._id.toString()
            ) {
               return res.status(404).json({ errors: ['Sprint not found'] });
            }  

            let deletedSprintData = await Sprint.findByIdAndDelete(req.params.sprintId).exec();

            if (deletedSprintData === null) {
               res.status(404).json({ errors: ['Sprint not found'] });
            } else {
               sendChannelMessage(
                  projectData.slackChannelId, 
                  `Sprint '${deletedSprintData.name}' has been discontinued.`
               );
               res.json({ data: deletedSprintData });
            }
         }
      } catch (err) {
         return next(err);
      }
   }
];