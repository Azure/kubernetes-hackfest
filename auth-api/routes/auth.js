var express = require("express");
var bcrypt = require("bcryptjs");
var jwt = require("jwt-simple");
var moment = require("moment");
var mongoose = require("mongoose");
var router = express.Router();

var userSchema = new mongoose.Schema({
  email: { type: String, unique: true, lowercase: true },
  password: { type: String, select: false },
  displayName: String
});

var admin = {email:"admin@admin.com",
display:"hackfest admin",
password:"kubernetes"};

userSchema.pre("save", function(next) {
  var user = this;
  if (!user.isModified("password")) {
    return next();
  }
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(user.password, salt, function(err, hash) {
      user.password = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = function(password, done) {
  bcrypt.compare(password, this.password, function(err, isMatch) {
    done(err, isMatch);
  });
};

var User = mongoose.model("User", userSchema);

/*
 |--------------------------------------------------------------------------
 | Login Required Middleware
 |--------------------------------------------------------------------------
 */
function ensureAuthenticated(req, res, next) {
  if (!req.header("Authorization")) {
    return res
      .status(401)
      .send({
        message: "Please make sure your request has an Authorization header"
      });
  }
  var token = req.header("Authorization").split(" ")[1];

  var payload = null;
  try {
    payload = jwt.decode(token, config.TOKEN_SECRET);
  } catch (err) {
    return res.status(401).send({ message: err.message });
  }

  if (payload.exp <= moment().unix()) {
    return res.status(401).send({ message: "Token has expired" });
  }
  req.user = payload.sub;
  next();
}

/*
 |--------------------------------------------------------------------------
 | Generate JSON Web Token
 |--------------------------------------------------------------------------
 */
function createJWT(user) {
  var payload = {
    sub: user._id,
    iat: moment().unix(),
    exp: moment()
      .add(14, "days")
      .unix()
  };
  return jwt.encode(payload, config.TOKEN_SECRET);
}

/* GET default page. */
router.get("/", function(req, res, next) {
  res.json({ msg: "default auth endpoint" }).status(200);
});


/*
 |--------------------------------------------------------------------------
 | Register new user
 |--------------------------------------------------------------------------
 */
router.post("/register", function(req, res, next) {
  User.findOne({ email: req.body.email }, function(err, existingUser) {
    if (existingUser) {
      return res.status(409).json({ message: "Email is already taken" });
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
 | Login with existing user
 |--------------------------------------------------------------------------
 */
router.post("/login", function(req, res, next) {
    console.log('trying to auth');
    console.log(req.body);
    // console.log(req.body.password);
  User.findOne({ email: req.body._email }, "+password", function(err, user) {
    if (!user) {
      return res.status(200).json({ message: "Invalid email and/or password" });
    }
    user.comparePassword(req.body._password, function(err, isMatch) {
      if (!isMatch) {
        return res
          .status(200)
          .json({ message: "Invalid email and/or password" });
      }
      res.json({ token: createJWT(user) }).status(200);
    });
  });
});



/*
 |--------------------------------------------------------------------------
 | Login with existing user
 |--------------------------------------------------------------------------
 */

router.get("/admin/create", function(req, res, next) {
    User.findOne({ email: admin.email }, function(err, existingUser) {
        if (existingUser) {
          return res.status(409).json({ message: "Admin already created" });
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
        res.status(200).json({ message: "Admin created" });
      });
    });
});





module.exports = router;
