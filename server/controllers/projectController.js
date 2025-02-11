const Project = require('../models/project');
const Member = require('../models/member');
const Task = require('../models/task');
const Sprint = require('../models/sprint');
const { body, param, validationResult } = require('express-validator');
const { 
    createSlackChannel, renameSlackChannel, inviteUsersToChannel,
    sendSlackMessage, archiveSlackChannel
} = require('../services/slackService');

exports.getAll = [
    async function checkPermissions(req, res, next) {
        if (!req.user) {
            return res.status(404).json({ errors: ['Project not found'] });
        }

        return next();
    },

    async function (req, res, next) {
        const searchFilter = req.user.privilege === 'admin' 
            ? {}
            : { $or: [ { lead: req.user._id }, { team: req.user._id } ] };
        
        try {
            let projectList = await Project.find(searchFilter)
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
            return res.status(404).json({ errors: ['Project not found'] });
        }

        return next();
    },

    param('projectId').isString().withMessage('Invalid value for projectId').bail()
        .trim().notEmpty().withMessage('projectId cannot be blank'),

    async function (req, res, next) {
        var validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            let errorMessageList = validationErrors.array().map(err => err.msg);
            return res.status(400).json({ errors: errorMessageList });
        }

        try {
            let projectData = await Project.findById(req.params.projectId)
                .populate('lead', '-password').populate('team', '-password').exec();

            if (projectData === null) {
                res.status(404).json({ errors: ['Project not found'] });
            } else if (
                //don't send project data if 
                //currUser is not admin, lead, or team member of project
                req.user.privilege !== 'admin' &&
                req.user._id.toString() !== projectData.lead._id.toString() &&
                !projectData.team.some(member => req.user._id.toString() === member._id.toString())
            ) {
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
            return res.status(404).json({ errors: ['Project not found'] });
        }

        if (req.user.privilege !== 'admin') {
            return res.status(403).json({ errors: ['Not allowed'] });
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
        .isArray({ min: 1 }).withMessage('Team cannot be empty').bail()
        .custom((value, { req }) => {
            const leadIsInTeam = value.some(member => {
                return member === req.body.lead;                
            });
            return !leadIsInTeam;
        }).withMessage('Lead member cannot be assigned as a team member')
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
            let teamMembers = await Member.find(
                { _id: { $in: req.body.team } }, 'slackMemberId'
            ).exec();

            if (teamMembers.length !== req.body.team.length) {
                return res.status(400).json(
                    { errors: ['Cannot create project: Team member(s) not found'] }
                );
            }

            //create Slack channel for project
            const channelId = await createSlackChannel(`project-${req.body.name}`);

            const slackMemberIdList = [ 
                leadMember.slackMemberId, ...teamMembers.map(member => member.slackMemberId)
            ];

            inviteUsersToChannel(channelId, slackMemberIdList);
            sendSlackMessage(channelId, `Welcome to '${req.body.name}'! This channel will be home base for all communications related to this project.`);
            
            let newProject = new Project({
                name: req.body.name,
                dateCreated: Date.now(),
                status: req.body.status,
                priority: req.body.priority,
                lead: req.body.lead,
                team: req.body.team,
                slackChannelId: channelId
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
            return res.status(404).json({ errors: ['Project not found'] });
        }

        if (req.user.privilege !== 'admin') {
            return res.status(403).json({ errors: ['Not allowed'] });
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
        .custom((value, { req }) => {
            const leadIsInTeam = value.some(member => {
                return member === req.body.lead;                
            });
            return !leadIsInTeam;
        }).withMessage('Lead member cannot be assigned as a team member')
        .escape(),

    param('projectId').isString().withMessage('Invalid value for projectId').bail()
        .trim().notEmpty().withMessage('projectId cannot be blank'),

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
                res.status(404).json({ errors: ['Project not found'] });
            } else {
                if (fieldsToUpdate.name !== oldProjectData.name) {
                    renameSlackChannel(oldProjectData.slackChannelId, `project-${fieldsToUpdate.name}`);
                    sendSlackMessage(oldProjectData.slackChannelId, `Project name updated to '${fieldsToUpdate.name}'`);
                }
                if (fieldsToUpdate.status !== oldProjectData.status) {
                    sendSlackMessage(oldProjectData.slackChannelId, `Project status updated to '${fieldsToUpdate.status}'`);
                }
                if (fieldsToUpdate.priority !== oldProjectData.priority) {
                    sendSlackMessage(oldProjectData.slackChannelId, `Project priority updated to '${fieldsToUpdate.priority}'`);
                }
                if (fieldsToUpdate.lead !== oldProjectData.lead.toString()) {
                    sendSlackMessage(oldProjectData.slackChannelId, `Project lead updated: ${leadMember.firstName} ${leadMember.lastName} is now project lead`);
                }

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
            return res.status(404).json({ errors: ['Project not found'] });
        }

        if (req.user.privilege !== 'admin') {
            return res.status(403).json({ errors: ['Not allowed'] });
        }

        return next();
    },

    param('projectId').isString().withMessage('Invalid value for projectId').bail()
        .trim().notEmpty().withMessage('projectId cannot be blank'),

    async function (req, res, next) {
        var validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            let errorMessageList = validationErrors.array().map(err => err.msg);
            return res.status(400).json({ errors: errorMessageList });
        }

        try {
            //delete project
            let deletedProjectData = await Project.findByIdAndDelete(req.params.projectId).exec();

            if (deletedProjectData === null) {
                return res.status(404).json({ errors: ['Project not found'] });
            }

            sendSlackMessage(deletedProjectData.slackChannelId, `Project '${deletedProjectData.name}' has been removed from Bugspray. Please consult management for further direction.`);
            archiveSlackChannel(deletedProjectData.slackChannelId);

            //delete tasks that reference deleted project
            let deletedTaskCount = await Task.deleteMany({ project: req.params.projectId }).exec();

            //delete sprints that reference deleted project
            let deletedSprintCount = await Sprint.deleteMany({ project: req.params.projectId }).exec();

            res.json({ data: { deletedProjectData, deletedTaskCount, deletedSprintCount } });
        } catch (err) {
            return next(err);
        }
    }
];