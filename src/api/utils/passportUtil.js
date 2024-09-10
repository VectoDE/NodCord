require('dotenv').config();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../../models/userModel');

// Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `http://localhost:3000/api/auth/google/callback`
},
async (accessToken, refreshToken, profile, done) => {
  try {
    const existingUser = await User.findOne({ email: profile._json.email });

    if (existingUser) {
      existingUser.accessToken = accessToken;
      existingUser.refreshToken = refreshToken;
      await existingUser.save();

      return done(null, existingUser);
    }

    const newUser = new User({
      username: profile._json.name,
      email: profile._json.email,
      fullname: profile._json.name,
      termsAccepted: true,
      termsAcceptedAt: new Date(),
      accessToken: accessToken,
      refreshToken: refreshToken,
    });

    await newUser.save();

    done(null, newUser);
  } catch (err) {
    done(err, null);
  }
}));

// GitHub Strategy
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: `http://localhost:3000/api/auth/github/callback`
},
async (accessToken, refreshToken, profile, done) => {
  try {
    const existingUser = await User.findOne({ email: profile._json.email });

    if (existingUser) {
      existingUser.accessToken = accessToken;
      existingUser.refreshToken = refreshToken;
      await existingUser.save();

      return done(null, existingUser);
    }

    const newUser = new User({
      username: profile._json.login,
      email: profile._json.email,
      fullname: profile._json.name || profile._json.login,
      termsAccepted: true,
      termsAcceptedAt: new Date(),
      accessToken: accessToken,
      refreshToken: refreshToken,
    });

    await newUser.save();

    done(null, newUser);
  } catch (err) {
    done(err, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    if (!user) {
      return done(new Error('User not found'), null);
    }
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
