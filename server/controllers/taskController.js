const Task = require('../models/task');
const Project = require('../models/project');
const Member = require('../models/member');
const { body, validationResult } = require('express-validator');

exports.getAll = [
    async function (req, res, next) {
        try {
            let taskList = await Task.find({})
                .populate('project').populate('createdBy')
                .populate('assignees').exec();
            res.json({ data: taskList });
        } catch (err) {
            return next(err);
        }
    }
];

exports.getById = [
    async function (req, res, next) {
        try {
            let taskData = await Task.findById(req.params.taskId)
                .populate('project').populate('createdBy')
                .populate('assignees').exec();

            if (taskData === null) {
                res.status(404).json({ errors: ['Task not found'] });
            } else {
                res.json({ data: taskData });
            }
        } catch (err) {
            return next(err);
        }
    }
];

exports.create = [
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
    body('createdBy').isString().withMessage('Invalid value for Creator').bail()
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
    body('assignees').isArray().withMessage('Invalid value for Assignees').bail()
        .isArray({ min: 1 }).withMessage('Assignees cannot be empty')
        .escape(),

    async function (req, res, next) {
        var validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            let errorMessageList = validationErrors.array().map(err => err.msg);
            res.status(400).json({ errors: errorMessageList });
        } else { 
            //check if project exists
            try {
                let project = await Project.findById(req.body.project).exec();

                if (project === null) {
                    res.status(400).json({ errors: ['Cannot create task: project not found'] });
                }
            } catch (err) {
                return next(err);
            }

            //check if creator exists
            try {
                let creator = await Member.findById(req.body.createdBy).exec();

                if (creator === null) {
                    res.status(400).json({ errors: ['Cannot create task: Creator not found'] });
                }
            } catch (err) {
                return next(err);
            }

            //check if assignees exist
            try {
                let assigneesCount = await Member.countDocuments(
                    { _id: { $in: req.body.assignees } }
                );

                if (assigneesCount !== req.body.assignees.length) {
                    res.status(400).json(
                        { errors: ['Cannot create task: Assignee(s) not found'] }
                    );
                }
            } catch (err) {
                return next(err);
            }
            
            //project, creator, and all assignees exist, proceed with task creation
            let newTask = new Task({
                title: req.body.title,
                description: req.body.description,
                project: req.body.project,
                dateCreated: Date.now(),
                createdBy: req.body.createdBy,
                status: req.body.status,
                priority: req.body.priority,
                assignees: req.body.assignees
            });

            try {
                let newTaskData = await newTask.save();
                res.json({ data: newTaskData });
            } catch (err) {
                return next(err);
            }
        }
    }
];

exports.update = [
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
    body('createdBy').isString().withMessage('Invalid value for Creator').bail()
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
    body('assignees').isArray().withMessage('Invalid value for Assignees').bail()
        .isArray({ min: 1 }).withMessage('Assignees cannot be empty')
        .escape(),

    async function (req, res, next) {
        var validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            let errorMessageList = validationErrors.array().map(err => err.msg);
            res.status(400).json({ errors: errorMessageList });
        } else {
            //check if project exists
            try {
                let project = await Project.findById(req.body.project).exec();

                if (project === null) {
                    res.status(400).json({ errors: ['Cannot update task: project not found'] });
                }
            } catch (err) {
                return next(err);
            }

            //check if creator exists
            try {
                let creator = await Member.findById(req.body.createdBy).exec();

                if (creator === null) {
                    res.status(400).json({ errors: ['Cannot update task: Creator not found'] });
                }
            } catch (err) {
                return next(err);
            }

            //check if assignees exist
            try {
                let assigneesCount = await Member.countDocuments(
                    { _id: { $in: req.body.assignees } }
                );

                if (assigneesCount !== req.body.assignees.length) {
                    res.status(400).json(
                        { errors: ['Cannot update task: Assignee(s) not found'] }
                    );
                }
            } catch (err) {
                return next(err);
            }
            
            //project, creator, and all assignees exist, proceed with task update
            let fieldsToUpdate = {
                title: req.body.title,
                description: req.body.description,
                project: req.body.project,
                createdBy: req.body.createdBy,
                status: req.body.status,
                priority: req.body.priority,
                assignees: req.body.assignees
            };

            try {
                let oldTaskData = await 
                    Task.findByIdAndUpdate(req.params.taskId, fieldsToUpdate)
                        .exec();
                
                if (oldTaskData === null) {
                    res.status(404).json({ errors: ['Cannot update task: Task not found'] });
                } else {
                    res.json({ data: oldTaskData });
                }
            } catch (err) {
                return next(err);
            }
        }
    }
];

exports.delete = [
    async function (req, res, next) {
        try {
            let deletedTaskData = await Task.findByIdAndDelete(req.params.taskId).exec();

            if (deletedTaskData === null) {
                res.status(404).json({ errors: ['Cannot delete task: Task not found'] });
            } else {
                res.json({ data: deletedTaskData });
            }
        } catch (err) {
            return next(err);
        }
    }
];