const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const path = require('path');
const axios = require('axios');

const app = express();

// Passport Config
require('./config/passport')(passport);

// DB Config
const db = require('./config/keys').mongoURI;

// Connect to MongoDB
mongoose
  .connect(
    db,
    { useNewUrlParser: true ,useUnifiedTopology: true}
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// EJS
// app.use(expressLayouts);
app.set('views', './views');
app.set('view engine', '.ejs');


// Express body parser
app.use(express.urlencoded({ extended: true }));

// Express session
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// Routes
app.use('/', require('./routes/index.js'));
app.use('/users', require('./routes/users.js'));
app.use(express.static(__dirname + '/public'));
app.get('/order', (req, res) => {
  const url = `https://21198692cddc5991b71d6aa5b5b7e53f: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@outerbloom1.myshopify.com/admin/api/2021-01/orders.json?status=any`
axios.get(url).then((response) => {
console.log(response.data)
  })
  .catch((error) => {
      console.log(error);
  });

});

const PORT = process.env.PORT || 1700;

app.listen(PORT, console.log(`Server running on  ${PORT}`));
