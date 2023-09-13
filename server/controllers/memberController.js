const Member = require('../models/member');
const { body, validationResult } = require('express-validator');

exports.getAll = [
    async function (req, res, next) {
        try {
            let memberList = await Member.find({}).exec();
            res.json({ data: memberList });
        } catch (err) {
            return next(err);
        }
    }
];

exports.getById = [
    async function (req, res, next) {
        try {
            let memberData = await Member.findById(req.params.memberId).exec();

            if (memberData === null) {
                res.status(404).json({ errors: ['Member not found'] });
            } else {
                res.json({ data: memberData });
            }
        } catch (err) {
            return next(err);
        }
    }
];

exports.create = [
    body('firstName').isString().withMessage('Invalid value for First Name').bail()
        .trim().notEmpty().withMessage('First name cannot be blank')
        .isLength({ max: 100 }).withMessage('First name cannot be longer than 100 characters')
        .escape(),
    body('lastName').isString().withMessage('Invalid value for Last Name').bail()
        .trim().notEmpty().withMessage('Last name cannot be blank')
        .isLength({ max: 100 }).withMessage('Last name cannot be longer than 100 characters')
        .escape(),
    body('role').isString().withMessage('Invalid value for Role').bail()
        .trim().notEmpty().withMessage('Role cannot be blank')
        .isLength({ max: 100}).withMessage('Role cannot be longer than 100 characters')
        .escape(),

    async function (req, res, next) {
        var validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            let errorMessageList = validationErrors.array().map(err => err.msg);
            res.status(400).json({ errors: errorMessageList });
        } else {
            let newMember = new Member({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                dateJoined: Date.now(),
                role: req.body.role
            });

            try {
                let newMemberData = await newMember.save();
                res.json({ data: newMemberData });
            } catch (err) {
                return next(err);
            }
        }
    }
];

exports.update = [
    body('firstName').isString().withMessage('Invalid value for First Name').bail()
        .trim().notEmpty().withMessage('First name cannot be blank')
        .isLength({ max: 100 }).withMessage('First name cannot be longer than 100 characters')
        .escape(),
    body('lastName').isString().withMessage('Invalid value for Last Name').bail()
        .trim().notEmpty().withMessage('Last name cannot be blank')
        .isLength({ max: 100 }).withMessage('Last name cannot be longer than 100 characters')
        .escape(),
    body('role').isString().withMessage('Invalid value for Role').bail()
        .trim().notEmpty().withMessage('Role cannot be blank')
        .isLength({ max: 100}).withMessage('Role cannot be longer than 100 characters')
        .escape(),

    async function (req, res, next) {
        var validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            let errorMessageList = validationErrors.array().map(err => err.msg);
            res.status(400).json({ errors: errorMessageList });
        } else {
            let fieldsToUpdate = {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                role: req.body.role
            };

            try {
                let oldMemberData = await 
                    Member.findByIdAndUpdate(req.params.memberId, fieldsToUpdate)
                    .exec();
                
                if (oldMemberData === null) {
                    res.status(404).json({ errors: ['Cannot update member: Member not found'] });
                } else {
                    res.json({ data: oldMemberData });
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
            let deletedMemberData = await Member.findByIdAndDelete(req.params.memberId).exec();

            if (deletedMemberData === null) {
                res.status(404).json({ errors: ['Cannot delete member: Member not found'] });
            } else {
                res.json({ data: deletedMemberData });
            }
        } catch (err) {
            return next(err);
        }
    }
];