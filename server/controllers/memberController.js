const Member = require('../models/member');
const { body, validationResult } = require('express-validator');

exports.getById = [
    function (req, res, next) {
        Member.findById(req.params.id)
            .exec(function (err, member) {
                if (err) {
                    return next(err);
                }

                if (member === null) {
                    res.status(404).json({ errors: ['Member not found'] });
                } else {
                    res.json({ data: member });
                }
            });
    }
];

exports.create = [
    body('firstName').trim().notEmpty().withMessage('First name cannot be blank')
        .isLength({ max: 100 }).withMessage('First name cannot be longer than 100 characters')
        .escape(),
    body('lastName').trim().notEmpty().withMessage('Last name cannot be blank')
        .isLength({ max: 100 }).withMessage('Last name cannot be longer than 100 characters')
        .escape(),
    body('role').trim().notEmpty().withMessage('Role cannot be blank')
        .isLength({ max: 100}).withMessage('Role cannot be longer than 100 characters')
        .escape(),

    function (req, res, next) {
        var validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            let errorMessages = validationErrors.array().map(err => err.msg);
            res.status(400).json({ errors: errorMessages });
        } else {
            let newMember = new Member({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                dateJoined: Date.now(),
                role: req.body.role
            });

            newMember.save(function (err, member) {
                if (err) {
                    return next(err);
                }

                res.json({ data: member });
            });
        }
    }
];

exports.update = [
    body('firstName').trim().notEmpty().withMessage('First name cannot be blank')
        .isLength({ max: 100 }).withMessage('First name cannot be longer than 100 characters')
        .escape(),
    body('lastName').trim().notEmpty().withMessage('Last name cannot be blank')
        .isLength({ max: 100 }).withMessage('Last name cannot be longer than 100 characters')
        .escape(),
    body('role').trim().notEmpty().withMessage('Role cannot be blank')
        .isLength({ max: 100}).withMessage('Role cannot be longer than 100 characters')
        .escape(),

    function (req, res, next) {
        var validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            let errorMessages = validationErrors.array().map(err => err.msg);
            res.status(400).json({ errors: errorMessages });
        } else {
            let fieldsToUpdate = {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                role: req.body.role
            };

            Member.findByIdAndUpdate(req.params.memberId, fieldsToUpdate)
                .exec(function (err, member) {
                    if (err) {
                        return next(err);
                    }

                    res.json({ data: member });
                });
        }
    }
];

exports.delete = [
    function (req, res, next) {
        Member.findByIdAndDelete(req.params.memberId)
            .exec(function (err, member) {
                if (err) {
                    return next(err);
                }

                if (member === null) {
                    res.status(404).json({ errors: ['Member not found'] });
                } else {
                    res.json({ data: member });
                }
            });
    }
];