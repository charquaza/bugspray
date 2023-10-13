require('dotenv').config();

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcryptjs');

const indexRouter = require('./routes/index');
const Member = require('./models/member');

const app = express();

//Set up mongoose connection
const mongoose = require('mongoose');
const mongoDB = process.env.MONGODB_URI;
mongoose.connect(mongoDB)
  .catch((err) => console.error(err));
mongoose.connection.on('error', (err) => console.error(err));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

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
passport.serializeUser((member, done) => {
  done(null, member.id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const member = await Member.findById(id);
    //what to do if member === null?
    done(null, member);
  } catch(err) {
    done(err);
  };
});

//Set up sessions and passport
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
//app.use(passport.initialize());
app.use(passport.session());

//Set up router
app.use('/', indexRouter);

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
