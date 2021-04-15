const express = require('express');
const router = express.Router();
const mongo = require('mongodb');
const assert = require('assert');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const session = require('express-session');
const axios = require('axios');

// Load User model
const User = require('../models/User');
const { forwardAuthenticated } = require('../config/auth');

// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));

// Register Page
router.get('/register', forwardAuthenticated, (req, res) => res.render('register'));

// Register
router.post('/register', (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (password != password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
    res.render('register', {
      errors,
      name,
      email,
      password,
      password2
    });
  } else {
    User.findOne({ email: email }).then(user => {
      if (user) {
        errors.push({ msg: 'Email already exists' });
        res.render('register', {
          errors,
          name,
          email,
          password,
          password2
        });
      } else {
        const newUser = new User({
          name,
          email,
          password
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                req.flash(
                  'success_msg',
                  'You are now registered and can log in'
                );
                res.redirect('/users/login');
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  }
});

// Login
let sess;
router.post('/login', (req, res, next) => {
  sess = req.session;
  sess.email = req.body.email;
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});


// Logout
router.get('/logout', (req, res) => {
  req.logout();
  // req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
});

// User
/*router.get('/order', (req, res) => {
  const url = `https://21198692cddc5991b71d6aa5b5b7e53f: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@outerbloom1.myshopify.com/admin/api/2021-01/orders.json?status=any`
  axios.get(url).then((response) => {
  console.log(response.data)
  })
  .catch((error) => {
      console.log(error);
  });

}); */

router.get('User',(req,res) => {
  sess = req.session;
  if(sess.email) {
    return res.redirect('/data');
  }
  res.sendFile('dashboard');
});

/*router.post('/login',(req,res) => {
  sess = req.session;
  sess.email = req.body.email;
  res.end('done');
}); */

router.get('/data',(req,res) => {
  sess = req.session;
  if(sess.email) {
      res.write(`<h1>Hello ${sess.email} </h1><br>`);
      res.end('<a href='+'/logout'+'>Logout</a>');
  }
  else {
      res.write('<h1>Please login first.</h1>');
      res.end('<a href='+'/'+'>Login</a>');
  }
});



module.exports = router;
