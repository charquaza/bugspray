const Member = require('../models/member');
const { body, validationResult } = require('express-validator');
const passport = require('passport');
const bcrypt = require('bcryptjs');

exports.getCurrUser = [
    function (req, res, next) {
        if (req.user) {
            let memberDataCopy = { ...req.user._doc };
            delete memberDataCopy.password;
            res.json({ data: memberDataCopy });
        } else {
            res.status(404).json({});
        }
    }
];

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
    body('privilege').isString().withMessage('Invalid value for Privilege').bail()
        .trim().notEmpty().withMessage('Privilege cannot be blank').bail()
        .custom((value) => {
            const allowedValues = [ 'admin', 'user' ];
            return allowedValues.includes(value); 
        }).withMessage('Invalid value for Privilege'),
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
                privilege: req.body.privilege,
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
        let memberDataCopy = { ...req.user._doc };
        delete memberDataCopy.password;
        res.json({ data: memberDataCopy });
    }
];

exports.logIn = [
    body('username').isString().withMessage('Invalid value for Username').bail()
        .trim().notEmpty().withMessage('Please enter a Username'),
    body('password').isString().withMessage('Invalid value for Password').bail()
        .trim().notEmpty().withMessage('Please enter a Password'),

    function (req, res, next) {
        var validationErrors = validationResult(req);

        if (!validationErrors.isEmpty()) {
            let errorMessageList = validationErrors.array().map(err => err.msg);
            return res.status(400).json({ errors: errorMessageList });
        } 

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
        let memberDataCopy = { ...req.user._doc };
        delete memberDataCopy.password;
        res.json({ data: memberDataCopy });
    }
];

exports.logOut = [
    function (req, res, next) {
        if (!req.user) {
            return res.status(200).end();
        }

        req.logout(function (err) {
            if (err) {
                return next(err);
            }

            // req.logout causes a new session object to be created
            // (even if there is no authenticated user to log out),
            // thus causing the new session to be stored
            // even though it is devoid of any user info
            req.session.destroy(function (err) {
                if (err) {
                    return next(err);
                }

                res.status(200).end();
            });
        });
    }
];

exports.getAll = [
    async function checkPermissions(req, res, next) {
        if (!req.user) {
            return res.status(404).end();
        }
    },

    async function (req, res, next) {
        try {
            let memberList = await Member.find({}, '-password').exec();
            res.json({ data: memberList });
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
    },

    async function (req, res, next) {
        try {
            let memberData = await Member.findById(req.params.memberId, '-password').exec();

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
    async function checkPermissions(req, res, next) {
        if (!req.user) {
            return res.status(404).end();
        }

        if (req.user._id !== req.params.memberId) {
            return res.status(403).end();
        }
    },
    
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
    body('privilege').isString().withMessage('Invalid value for Privilege').bail()
        .trim().notEmpty().withMessage('Privilege cannot be blank').bail()
        .custom((value) => {
            const allowedValues = [ 'admin', 'user' ];
            return allowedValues.includes(value); 
        }).withMessage('Invalid value for Privilege'),
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
                privilege: req.body.privilege,
                username: req.body.username,
                password: hashedPassword
            };

            let oldMemberData = await 
                Member.findByIdAndUpdate(req.params.memberId, fieldsToUpdate)
                    .exec();
            
            if (oldMemberData === null) {
                res.status(404).json({ errors: ['Cannot update member: Member not found'] });
            } else {
                let memberDataCopy = { ...oldMemberData._doc };
                delete memberDataCopy.password;
                res.json({ data: memberDataCopy });
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

        if (req.user._id !== req.params.memberId) {
            return res.status(403).end();
        }
    },

    async function (req, res, next) {
        try {
            let deletedMemberData = await Member.findByIdAndDelete(req.params.memberId).exec();

            if (deletedMemberData === null) {
                res.status(404).json({ errors: ['Cannot delete member: Member not found'] });
            } else {
                let memberDataCopy = { ...deletedMemberData._doc }; //get POJO from Mongoose document
                delete memberDataCopy.password;
                res.json({ data: memberDataCopy });
            }
        } catch (err) {
            return next(err);
        }
    }
];