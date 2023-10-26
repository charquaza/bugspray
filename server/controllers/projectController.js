const Project = require('../models/project');
const Member = require('../models/member');
const Task = require('../models/task');
const { body, validationResult } = require('express-validator');

exports.getAll = [
    async function checkPermissions(req, res, next) {
        if (!req.user) {
            return res.status(404).end();
        }

        return next();
    },

    async function (req, res, next) {
        try {
            let projectList = await Project.find({})
                .populate('lead', '-password').populate('team', '-password').exec();
            res.json({ data: projectList });
        } catch (err) {
            return next(err);
        }
    }
];

exports.getById = [
    async function checkPermissions(req, res, next) {
        if (!req.user) {
            return res.status(404).end();
        }

        return next();
    },

    async function (req, res, next) {
        try {
            let projectData = await Project.findById(req.params.projectId)
                .populate('lead', '-password').populate('team', '-password').exec();

            if (projectData === null) {
                res.status(404).json({ errors: ['Project not found'] });
            } else {
                res.json({ data: projectData });
            }
        } catch (err) {
            return next(err);
        }
    }
];

exports.create = [
    async function checkPermissions(req, res, next) {
        if (!req.user) {
            return res.status(404).end();
        }

        if (req.user.privilege !== 'admin') {
            return res.status(403).end();
        }

        return next();
    },

    body('name').isString().withMessage('Invalid value for Name').bail()
        .trim().notEmpty().withMessage('Name cannot be blank')
        .isLength({ max: 100 }).withMessage('Name cannot be longer than 100 characters')
        .escape(),
    body('status').isString().withMessage('Invalid value for Status').bail()
        .trim().notEmpty().withMessage('Status cannot be blank')
        .isLength({ max: 100 }).withMessage('Status cannot be longer than 100 characters')
        .escape(),
    body('priority').isString().withMessage('Invalid value for Priority').bail()
        .trim().notEmpty().withMessage('Priority cannot be blank')
        .isLength({ max: 100 }).withMessage('Priority cannot be longer than 100 characters')
        .escape(),
    body('lead').isString().withMessage('Invalid value for Lead').bail()
        .trim().notEmpty().withMessage('Lead cannot be blank')
        .escape(),
    body('team').isArray().withMessage('Invalid value for Team').bail()
        .isArray({ min: 1 }).withMessage('Team cannot be empty')
        .escape(),

    async function (req, res, next) {
        var validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            let errorMessageList = validationErrors.array().map(err => err.msg);
            return res.status(400).json({ errors: errorMessageList });
        } 

        try {
            //check if lead member exists
            let leadMember = await Member.findById(req.body.lead).exec();

            if (leadMember === null) {
                return res.status(400).json({ 
                    errors: ['Cannot create project: Lead member not found'] 
                });
            }

            //check if team members exist
            let teamMemberCount = await Member.countDocuments(
                { _id: { $in: req.body.team } }
            ).exec();

            if (teamMemberCount !== req.body.team.length) {
                return res.status(400).json(
                    { errors: ['Cannot create project: Team member(s) not found'] }
                );
            }

            //lead and all team members exist, proceed with project creation
            let newProject = new Project({
                name: req.body.name,
                dateCreated: Date.now(),
                status: req.body.status,
                priority: req.body.priority,
                lead: req.body.lead,
                team: req.body.team
            });

            let newProjectData = await newProject.save();
            res.json({ data: newProjectData });
        } catch (err) {
            return next(err);
        }
    }
];

exports.update = [
    async function checkPermissions(req, res, next) {
        if (!req.user) {
            return res.status(404).end();
        }

        if (req.user.privilege !== 'admin') {
            return res.status(403).end();
        }

        return next();
    },

    body('name').isString().withMessage('Invalid value for Name').bail()
        .trim().notEmpty().withMessage('Name cannot be blank')
        .isLength({ max: 100 }).withMessage('Name cannot be longer than 100 characters')
        .escape(),
    body('status').isString().withMessage('Invalid value for Status').bail()
        .trim().notEmpty().withMessage('Status cannot be blank')
        .isLength({ max: 100 }).withMessage('Status cannot be longer than 100 characters')
        .escape(),
    body('priority').isString().withMessage('Invalid value for Priority').bail()
        .trim().notEmpty().withMessage('Priority cannot be blank')
        .isLength({ max: 100 }).withMessage('Priority cannot be longer than 100 characters')
        .escape(),
    body('lead').isString().withMessage('Invalid value for Lead').bail()
        .trim().notEmpty().withMessage('Lead cannot be blank')
        .escape(),
    body('team').isArray().withMessage('Invalid value for Team').bail()
        .isArray({ min: 1 }).withMessage('Team cannot be empty')
        .escape(),

    async function (req, res, next) {
        var validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            let errorMessageList = validationErrors.array().map(err => err.msg);
            return res.status(400).json({ errors: errorMessageList });
        } 

        try {
            //check if lead member exists
            let leadMember = await Member.findById(req.body.lead).exec();

            if (leadMember === null) {
                return res.status(400).json({ 
                    errors: ['Cannot update project: Lead member not found'] 
                });
            }

            //check if team members exist
            let teamMemberCount = await Member.countDocuments(
                { _id: { $in: req.body.team } }
            ).exec();

            if (teamMemberCount !== req.body.team.length) {
                return res.status(400).json(
                    { errors: ['Cannot update project: Team member(s) not found'] }
                );
            }
        
            //lead and all team members exist, proceed with project update
            let fieldsToUpdate = {
                name: req.body.name,
                status: req.body.status,
                priority: req.body.priority,
                lead: req.body.lead,
                team: req.body.team
            };

            let oldProjectData = await 
                Project.findByIdAndUpdate(req.params.projectId, fieldsToUpdate)
                    .exec();
            
            if (oldProjectData === null) {
                res.status(404).json({ errors: ['Cannot update project: Project not found'] });
            } else {
                res.json({ data: oldProjectData });
            }
        } catch (err) {
            return next(err);
        }
    }
];

exports.delete = [
    async function checkPermissions(req, res, next) {
        if (!req.user) {
            return res.status(404).end();
        }

        if (req.user.privilege !== 'admin') {
            return res.status(403).end();
        }

        return next();
    },

    async function (req, res, next) {
        try {
            //delete project
            let deletedProjectData = await Project.findByIdAndDelete(req.params.projectId).exec();

            if (deletedProjectData === null) {
                return res.status(404).json({ 
                    errors: ['Cannot delete project: Project not found'] 
                });
            }

            //delete tasks that reference deleted project
            let deletedTaskCount = await Task.deleteMany({ project: req.params.projectId }).exec();

            res.json({ data: { deletedProjectData, deletedTaskCount } });
        } catch (err) {
            return next(err);
        }
    }
];