const express = require('express');
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
const jwt = require('jwt-simple');
const moment = require('moment');
const mongoose = require('mongoose');
const router = express.Router();
const TOKEN_SECRET = 'J0eyB0mb';

var userSchema = new mongoose.Schema({
  email: { type: String, unique: true, lowercase: true },
  password: { type: String },
  displayName: String
});

var admin = {
  email: 'admin@admin.com',
  display: 'hackfest admin',
  password: 'kubernetes'
};

userSchema.pre('save', function(next) {
  var user = this;
  if (!user.isModified('password')) {
    return next();
  }
  bcrypt.hash(user.password, salt, function(err, hash) {
    user.password = hash;
    next();
  });
});

var User = mongoose.model('User', userSchema);

function comparePassword(input, server, cb) {
  bcrypt.compare(input, server, function(err, isMatch) {
    if (err) console.log('Match Error:', err);
    if (isMatch) console.log('Matched:', isMatch);
    cb(err, isMatch);
  });
}

/*
 |--------------------------------------------------------------------------
 | Login Required Middleware
 |--------------------------------------------------------------------------
 */
function ensureAuthenticated(req, res, next) {
  if (!req.header('Authorization')) {
    return res.status(401).send({
      message: 'Please make sure your request has an Authorization header'
    });
  }
  var token = req.header('Authorization').split(' ')[1];

  var payload = null;
  try {
    payload = jwt.decode(token, config.TOKEN_SECRET);
  } catch (err) {
    return res.status(401).send({ message: err.message });
  }

  if (payload.exp <= moment().unix()) {
    return res.status(401).send({ message: 'Token has expired' });
  }
  req.user._id = payload.sub;
  next();
}

/*
 |--------------------------------------------------------------------------
 | Generate JSON Web Token
 |--------------------------------------------------------------------------
 */
function createJWT(uid) {
  var payload = {
    sub: uid,
    iat: moment().unix(),
    exp: moment()
      .add(14, 'days')
      .unix()
  };
  console.log(payload);
  return jwt.encode(payload, TOKEN_SECRET);
}

/* GET default page. */
router.get('/', function(req, res, next) {
  res.json({ msg: 'default auth endpoint' }).status(200);
});

/*
 |--------------------------------------------------------------------------
 | Create a new user in DB (Mongo/Cosmos)
 |--------------------------------------------------------------------------
 */
router.post('/register', function(req, res, next) {
  User.findOne({ email: req.body.email }, function(err, existingUser) {
    if (existingUser) {
      return res.status(409).json({ message: 'Email is already taken' });
    }
    var user = new User({
      displayName: req.body.displayName,
      email: req.body.email,
      password: req.body.password
    });
    user.save(function(err, result) {
      if (err) {
        res.status(500).json({ message: err.message });
      }
      res.json({ token: createJWT(result) }).status(200);
    });
  });
});

/*
 |--------------------------------------------------------------------------
 | Local fake auth for local development
 |--------------------------------------------------------------------------
 */
router.post('/loginLocal', function(req, res, next) {
  var max = 9999999999;
  var min = 99999;
  var id = Math.floor(Math.random() * (max - min + 1)) + min;

  res.json({ token: createJWT(id) }).status(200);
});

/*
 |--------------------------------------------------------------------------
 | Login with existing user in DB (Mongo/Cosmos)
 |--------------------------------------------------------------------------
 */
router.post('/login', function(req, res, next) {
  var pass = req.body._pass;

  User.findOne({ email: req.body._email }, function(err, user) {
    if (!user) {
      return res.json({ msg: 'Invalid email and/or password -e' }).status(200);
    }

    comparePassword(pass, user.password, function(error, isMatch) {
      if (isMatch) {
        res.json({ token: createJWT(user._id) }).status(200);
      } else {
        res.json({ msg: 'Invalid email and/or password -p' }).status(401);
      }
    });
  });
});

/*
 |--------------------------------------------------------------------------
 | Create admin user in DB (Mongo/Cosmos)
 |--------------------------------------------------------------------------
 */

router.get('/admin/create', function(req, res, next) {
  User.findOne({ email: admin.email }, function(err, existingUser) {
    if (existingUser) {
      return res.status(409).json({ message: 'Admin already created' });
    }
    var user = new User({
      displayName: admin.display,
      email: admin.email,
      password: admin.password
    });
    user.save(function(err, result) {
      if (err) {
        res.status(500).json({ message: err.message });
      }
      res.status(200).json({ message: 'Admin created' });
    });
  });
});

module.exports = router;
