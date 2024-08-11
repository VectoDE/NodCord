const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const AppleStrategy = require('passport-apple').Strategy;
const MicrosoftStrategy = require('passport-microsoft').Strategy;
const FaceitStrategy = require('passport-faceit').Strategy;

const User = require('../../models/userModel');
const logger = require('../services/loggerService');

passport.serializeUser((user, done) => {
  logger.info(`Serializing user with ID: ${user.id}`);
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    if (user) {
      logger.info(`Deserialized user with ID: ${id}`);
      done(null, user);
    } else {
      logger.warn(`User with ID: ${id} not found during deserialization`);
      done(new Error('User not found'), null);
    }
  } catch (err) {
    logger.error(`Error during deserialization of user with ID: ${id}`, err);
    done(err, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        logger.info(
          `Google authentication initiated for profile ID: ${profile.id}`
        );
        const user = await User.findOrCreate(
          { googleId: profile.id },
          {
            username: profile.displayName,
            email: profile.emails[0].value,
          }
        );
        logger.info(
          `Google authentication successful for profile ID: ${profile.id}`
        );
        done(null, user);
      } catch (err) {
        logger.error(
          `Error during Google authentication for profile ID: ${profile.id}`,
          err
        );
        done(err, null);
      }
    }
  )
);

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: '/auth/github/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        logger.info(
          `GitHub authentication initiated for profile ID: ${profile.id}`
        );
        const user = await User.findOrCreate(
          { githubId: profile.id },
          {
            username: profile.username,
            email: profile.emails[0].value,
          }
        );
        logger.info(
          `GitHub authentication successful for profile ID: ${profile.id}`
        );
        done(null, user);
      } catch (err) {
        logger.error(
          `Error during GitHub authentication for profile ID: ${profile.id}`,
          err
        );
        done(err, null);
      }
    }
  )
);

passport.use(
  new AppleStrategy(
    {
      clientID: process.env.APPLE_CLIENT_ID,
      teamID: process.env.APPLE_TEAM_ID,
      keyID: process.env.APPLE_KEY_ID,
      privateKey: process.env.APPLE_PRIVATE_KEY,
      callbackURL: '/auth/apple/callback',
      scope: ['name', 'email'],
    },
    async (accessToken, refreshToken, idToken, profile, done) => {
      try {
        logger.info(
          `Apple authentication initiated for profile ID: ${profile.id}`
        );
        const user = await User.findOrCreate(
          { appleId: profile.id },
          {
            username: profile.name,
            email: profile.email,
          }
        );
        logger.info(
          `Apple authentication successful for profile ID: ${profile.id}`
        );
        done(null, user);
      } catch (err) {
        logger.error(
          `Error during Apple authentication for profile ID: ${profile.id}`,
          err
        );
        done(err, null);
      }
    }
  )
);

passport.use(
  new MicrosoftStrategy(
    {
      clientID: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
      callbackURL: '/auth/microsoft/callback',
      scope: ['user.read'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        logger.info(
          `Microsoft authentication initiated for profile ID: ${profile.id}`
        );
        const user = await User.findOrCreate(
          { microsoftId: profile.id },
          {
            username: profile.displayName,
            email: profile.emails[0].value,
          }
        );
        logger.info(
          `Microsoft authentication successful for profile ID: ${profile.id}`
        );
        done(null, user);
      } catch (err) {
        logger.error(
          `Error during Microsoft authentication for profile ID: ${profile.id}`,
          err
        );
        done(err, null);
      }
    }
  )
);

passport.use(
  new FaceitStrategy(
    {
      clientID: process.env.FACEIT_CLIENT_ID,
      clientSecret: process.env.FACEIT_CLIENT_SECRET,
      callbackURL: '/auth/faceit/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        logger.info(
          `FACEIT authentication initiated for profile ID: ${profile.id}`
        );
        const user = await User.findOrCreate(
          { faceitId: profile.id },
          {
            username: profile.displayName,
            email: profile.emails[0].value,
          }
        );
        logger.info(
          `FACEIT authentication successful for profile ID: ${profile.id}`
        );
        done(null, user);
      } catch (err) {
        logger.error(
          `Error during FACEIT authentication for profile ID: ${profile.id}`,
          err
        );
        done(err, null);
      }
    }
  )
);

module.exports = passport;
