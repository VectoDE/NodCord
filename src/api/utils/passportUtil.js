require('dotenv').config();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const DiscordStrategy = require('passport-discord').Strategy;
const TwitchStrategy = require('passport-twitch').Strategy;
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const User = require('../../models/userModel');

// Helper function to generate a unique username
const generateUniqueUsername = async (baseUsername) => {
  let username = baseUsername;
  let count = 1;
  while (await User.findOne({ username })) {
    username = `${baseUsername}${count}`;
    count++;
  }
  return username;
};

// Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `http://localhost:3000/api/auth/google/callback`
},
async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile._json.email;
    const fullname = profile._json.name;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      existingUser.accessToken = accessToken;
      existingUser.refreshToken = refreshToken;
      await existingUser.save();
      return done(null, existingUser);
    }

    const username = await generateUniqueUsername(fullname);
    const newUser = new User({
      username,
      email,
      fullname,
      termsAccepted: true,
      termsAcceptedAt: new Date(),
      accessToken,
      refreshToken,
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
    const email = profile._json.email;
    const fullname = profile._json.name || profile._json.login;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      existingUser.accessToken = accessToken;
      existingUser.refreshToken = refreshToken;
      await existingUser.save();
      return done(null, existingUser);
    }

    const username = await generateUniqueUsername(profile._json.login);
    const newUser = new User({
      username,
      email,
      fullname,
      termsAccepted: true,
      termsAcceptedAt: new Date(),
      accessToken,
      refreshToken,
    });

    await newUser.save();
    done(null, newUser);
  } catch (err) {
    done(err, null);
  }
}));

// Discord Strategy
passport.use(new DiscordStrategy({
  clientID: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  callbackURL: `http://localhost:3000/api/auth/discord/callback`,
  scope: ['identify', 'email']
},
async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.email;
    const fullname = profile.username;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      existingUser.accessToken = accessToken;
      existingUser.refreshToken = refreshToken;
      await existingUser.save();
      return done(null, existingUser);
    }

    const username = await generateUniqueUsername(fullname);
    const newUser = new User({
      username,
      email,
      fullname,
      termsAccepted: true,
      termsAcceptedAt: new Date(),
      accessToken,
      refreshToken,
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
