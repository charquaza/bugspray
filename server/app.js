require('dotenv').config();

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const logger = require('morgan');

const cors = require('cors');
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const bcrypt = require('bcryptjs');

const indexRouter = require('./routes/index');
const Member = require('./models/member');

const app = express();

//Configure cors
const corsOptions = {
  origin: process.env.FRONTEND_DOMAIN,
  credentials: true,
  optionsSuccessStatus: 200
};

//Set up mongoose connection
const mongoDB = process.env.MONGODB_URI;
mongoose.connect(mongoDB)
  .catch((err) => console.error(err));
mongoose.connection.on('error', (err) => console.error(err));

//Configure passport
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const member = await Member.findOne({ username: username }).exec();

      if (!member) {
        return done(null, false, { message: 'Incorrect username or password' });
      };

      const passwordMatch = await bcrypt.compare(password, member.password);
      if (!passwordMatch) {
        return done(null, false, { message: 'Incorrect username or password' });
      };

      return done(null, member);
    } catch(err) {
      return done(err);
    };
  })
);

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey : process.env.JWT_SECRET
    }, 
    async function (payload, done) {
      try {
        const user = await Member.findById(payload.id).exec();
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors(corsOptions));

//Set up router
app.use('/',
  (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
      req.user = user; // Attach user (may be falsy) to request
      next();
    })(req, res, next);
  },
  indexRouter
);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({ errors: [ err.message ] });
});

module.exports = app;
