const express = require('express');
const authController = require('../controller/authController');
const passport = require('../middlewares/googleOauth')

const router = express.Router();

router.use(passport.initialize());

// tesing 
router.get('/test', (req,res) => {res.json({succsess: true});});

// user

// register
router.post('/register', authController.register);

// login
router.post('/login', authController.login);
// logout
// refresh

router.get("/login/success", (req, res) => {
  //const
  if (req.user) {
      res.status(200).json({
          error: false,
          message: "Successfully Logged In",
          user: req.user,
      });
  } else {
      res.status(403).json({ error: true, message: "Not Authorized" });
  }
});

router.get('/logout', (req, res) => {
  // Clear authentication cookies or tokens
  res.clearCookie('role');
  res.clearCookie('accessToken');

  // Perform any other cleanup or logout logic if needed

  // Redirect to the login page or any other desired page after logout
  res.redirect('http://localhost:3000/');
});


router.get('/auth/google',(req, res, next) => {
  const { role } = req.query;
  res.cookie('role', role, { httpOnly: true });
  next();
},
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/test' }),
  (req, res) => {
    const role = req.cookies.role;
    const { accessToken, refreshToken} = req.user;
    res.redirect('http://localhost:3000/');
  }
);

module.exports = router;