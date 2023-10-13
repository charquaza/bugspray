const Member = require('../models/member');
const { body, validationResult } = require('express-validator');
const passport = require('passport');
const bcrypt = require('bcryptjs');

exports.signUp = [
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
    body('username').isString().withMessage('Invalid value for Username').bail()
        .trim().notEmpty().withMessage('Username cannot be blank')
        .isLength({ max: 100 }).withMessage('Username cannot be longer than 100 characters')
        .not().matches(/[<>&'"/]/).withMessage('Username cannot contain the following characters: <, >, &, \', ", /')
        .bail().custom(async (value) => {
            try {
                var member = await Member.findOne({ username: value }).exec();
            } catch (err) {
                throw new Error('Error in checking uniqueness of username. Please try again later, or report the issue.');
            }

            if (member) {
                throw new Error('Username is already in use. Please enter a different username');
            }
        }),
    body('password').isString().withMessage('Invalid value for Password').bail()
        .trim().notEmpty().withMessage('Password cannot be blank')
        .isLength({ min: 8 }).withMessage('Password cannot be shorter than 8 characters')
        .isLength({ max: 15 }).withMessage('Password cannot be longer than 15 characters')
        .isStrongPassword({ minLength: 0, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 0 })
        .withMessage('Password must contain at least 1 lowercase letter, 1 uppercase letter, and 1 number')
        .not().matches(/[<>&'"/]/).withMessage('Password cannot contain the following characters: <, >, &, \', ", /'),
    body('confirmPassword').custom((value, { req }) => value === req.body.password)
        .withMessage('Passwords do not match'),

    async function (req, res, next) {
        var validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            let errorMessageList = validationErrors.array().map(err => err.msg);
            return res.status(400).json({ errors: errorMessageList });
        } 

        //if a user is logged in, log out before proceeding with new user sign up
        if (req.user) {
            req.logout(function (err) {
                if (err) {
                    return next(err);
                }
            });
        }

        try {
            let hashedPassword = await bcrypt.hash(req.body.password, 10);

            let newMember = new Member({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                dateJoined: Date.now(),
                role: req.body.role,
                username: req.body.username,
                password: hashedPassword
            });

            let newMemberData = await newMember.save();
            req.login(newMemberData, next);
        } catch (err) {
            return next(err);
        }
    },

    function (req, res, next) {
        res.json({ user: req.user });
    }
];

exports.logIn = [
    function (req, res, next) {
        //if a user is logged in, log out before proceeding with new log in
        if (req.user) {
            req.logout(function (err) {
                if (err) {
                    return next(err);
                }
            });
        }

        passport.authenticate('local', function (err, user, info) {
            if (err) {
                return next(err);
            }

            if (!user) {
                res.status(401).json({ errors: [ info.message ] });
            } else {
                req.login(user, next);
            }
        })(req, res, next);
    },
    function (req, res, next) {
        res.json({ user: req.user });
    }
];

exports.logOut = [
    function (req, res, next) {
        req.logout(function (err) {
            if (err) {
                return next(err);
            }

            res.status(200).end();
        });
    }
];

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
    body('username').isString().withMessage('Invalid value for Username').bail()
        .trim().notEmpty().withMessage('Username cannot be blank')
        .isLength({ max: 100 }).withMessage('Username cannot be longer than 100 characters')
        .not().matches(/[<>&'"/]/).withMessage('Username cannot contain the following characters: <, >, &, \', ", /')
        .bail().custom(async (value) => {
            try {
                var member = await Member.findOne({ username: value }).exec();
            } catch (err) {
                throw new Error('Error in checking uniqueness of username. Please try again later, or report the issue.');
            }

            if (member) {
                throw new Error('Username is already in use. Please enter a different username');
            }
        }),
    body('password').isString().withMessage('Invalid value for Password').bail()
        .trim().notEmpty().withMessage('Password cannot be blank')
        .isLength({ min: 8 }).withMessage('Password cannot be shorter than 8 characters')
        .isLength({ max: 15 }).withMessage('Password cannot be longer than 15 characters')
        .isStrongPassword({ minLength: 0, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 0 })
        .withMessage('Password must contain at least 1 lowercase letter, 1 uppercase letter, and 1 number')
        .not().matches(/[<>&'"/]/).withMessage('Password cannot contain the following characters: <, >, &, \', ", /'),
    body('confirmPassword').custom((value, { req }) => value === req.body.password)
        .withMessage('Passwords do not match'),

    async function (req, res, next) {
        var validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            let errorMessageList = validationErrors.array().map(err => err.msg);
            return res.status(400).json({ errors: errorMessageList });
        } 

        try {
            let hashedPassword = await bcrypt.hash(req.body.password, 10);

            let fieldsToUpdate = {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                role: req.body.role,
                username: req.body.username,
                password: hashedPassword
            };

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