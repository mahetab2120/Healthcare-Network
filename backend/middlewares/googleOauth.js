// googleAuth.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
    clientID: '475357600352-bo3lho3t6m61dcrn99k0t206shrig81m.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: 'http://localhost:5000/auth/google/callback',
    scope: ['profile', 'email']
}, (accessToken, refreshToken, profile, done) => {
  // Verify user and create or retrieve user record in the database
  // For simplicity, you can just return the user profile for now
  done(null, { accessToken, refreshToken, profile });
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

module.exports = passport;
