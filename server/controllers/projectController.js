const Project = require('../models/project');
const Member = require('../models/member');
const { body, validationResult } = require('express-validator');

exports.getAll = [
    async function (req, res, next) {
        try {
            let projectList = await Project.find({})
                .populate('lead').populate('team').exec();
            res.json({ data: projectList });
        } catch (err) {
            return next(err);
        }
    }
];

exports.getById = [
    async function (req, res, next) {
        try {
            let projectData = await Project.findById(req.params.projectId)
                .populate('lead').populate('team').exec();

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
        console.log(req.body.team);
        var validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            let errorMessageList = validationErrors.array().map(err => err.msg);
            res.status(400).json({ errors: errorMessageList });
        } else { 
            //check if lead member exists
            try {
                let leadMember = Member.findById(req.body.lead).exec();

                if (leadMember === null) {
                    res.status(400).json({ errors: ['Lead member not found'] });
                }
            } catch (err) {
                return next(err);
            }

            //check if team members exist
            try {
                for (let i = 0; i < req.body.team.length; i++) {
                    let currId = req.body.team[i];
                    let currMember = await Member.findById(currId).exec();

                    if (currMember === null) {
                        res.status(400).json({ errors: ['Team member not found'] });
                    }
                }
            } catch (err) {
                return next(err);
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

            try {
                let newProjectData = await newProject.save();
                res.json({ data: newProjectData });
            } catch (err) {
                return next(err);
            }
        }
    }
];

exports.update = [
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
            res.status(400).json({ errors: errorMessageList });
        } else {
            //check if lead member exists
            try {
                let leadMember = Member.findById(req.body.lead).exec();

                if (leadMember === null) {
                    res.status(400).json({ errors: ['Lead member not found'] });
                }
            } catch (err) {
                return next(err);
            }

            //check if team members exist
            try {
                for (let i = 0; i < req.body.team.length; i++) {
                    let currId = req.body.team[i];
                    let currMember = await Member.findById(currId).exec();

                    if (currMember === null) {
                        res.status(400).json({ errors: ['Team member not found'] });
                    }
                }
            } catch (err) {
                return next(err);
            }

            //lead and all team members exist, proceed with project update
            let fieldsToUpdate = {
                name: req.body.name,
                status: req.body.status,
                priority: req.body.priority,
                lead: req.body.lead,
                team: req.body.team
            };

            try {
                let oldProjectData = await 
                    Project.findByIdAndUpdate(req.params.projectId, fieldsToUpdate)
                        .exec();
                
                if (oldProjectData === null) {
                    res.status(404).json({ errors: ['Project not found'] });
                } else {
                    res.json({ data: oldProjectData });
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
            let deletedProjectData = await Project.findByIdAndDelete(req.params.projectId).exec();

            if (deletedProjectData === null) {
                res.status(404).json({ errors: ['Project not found'] });
            } else {
                res.json({ data: deletedProjectData });
            }
        } catch (err) {
            return next(err);
        }
    }
];