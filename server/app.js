require('dotenv').config();

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const passport = require('passport');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcryptjs');

const indexRouter = require('./routes/index');
const Member = require('./models/member');

const app = express();

//Configure cors
const corsOptions = {
  origin: 'http://localhost:3001', //restrict to frontend domain after deployment
  credentials: true,
  optionsSuccessStatus: 200
};

//Set up mongoose connection
const mongoDB = process.env.MONGODB_URI;
mongoose.connect(mongoDB)
  .catch((err) => console.error(err));
mongoose.connection.on('error', (err) => console.error(err));

//Set up connect-mongodb-session store
const sessionStore = new MongoDBStore(
  {
    uri: mongoDB,
    databaseName: 'bug_tracker',
    collection: 'sessions',
    expires: 1000 * 60 * 60 * 24 // 1 day in milliseconds
  },
  (err) => console.error(err)
);
sessionStore.on('error', (err) => console.error(err));

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
    done(null, member);
  } catch(err) {
    done(err);
  };
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors(corsOptions));

//Set up sessions and passport
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  },
  store: sessionStore
}));
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
