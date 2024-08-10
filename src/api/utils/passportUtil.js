const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const AppleStrategy = require('passport-apple').Strategy;
const MicrosoftStrategy = require('passport-microsoft').Strategy;
const FaceitStrategy = require('passport-faceit').Strategy;

const User = require('../../models/userModel');

// Serialisierung und Deserialisierung der User-Session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});

// Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const user = await User.findOrCreate({ googleId: profile.id }, {
            username: profile.displayName,
            email: profile.emails[0].value
        });
        done(null, user);
    } catch (err) {
        done(err, null);
    }
}));

// GitHub Strategy
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "/auth/github/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const user = await User.findOrCreate({ githubId: profile.id }, {
            username: profile.username,
            email: profile.emails[0].value
        });
        done(null, user);
    } catch (err) {
        done(err, null);
    }
}));

// Apple Strategy
passport.use(new AppleStrategy({
    clientID: process.env.APPLE_CLIENT_ID,
    teamID: process.env.APPLE_TEAM_ID,
    keyID: process.env.APPLE_KEY_ID,
    privateKey: process.env.APPLE_PRIVATE_KEY,
    callbackURL: "/auth/apple/callback",
    scope: ['name', 'email'],
}, async (accessToken, refreshToken, idToken, profile, done) => {
    try {
        const user = await User.findOrCreate({ appleId: profile.id }, {
            username: profile.name,
            email: profile.email
        });
        done(null, user);
    } catch (err) {
        done(err, null);
    }
}));

// Microsoft Strategy
passport.use(new MicrosoftStrategy({
    clientID: process.env.MICROSOFT_CLIENT_ID,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
    callbackURL: "/auth/microsoft/callback",
    scope: ['user.read']
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const user = await User.findOrCreate({ microsoftId: profile.id }, {
            username: profile.displayName,
            email: profile.emails[0].value
        });
        done(null, user);
    } catch (err) {
        done(err, null);
    }
}));

// FACEIT Strategy
passport.use(new FaceitStrategy({
    clientID: process.env.FACEIT_CLIENT_ID,
    clientSecret: process.env.FACEIT_CLIENT_SECRET,
    callbackURL: "/auth/faceit/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const user = await User.findOrCreate({ faceitId: profile.id }, {
            username: profile.displayName,
            email: profile.emails[0].value
        });
        done(null, user);
    } catch (err) {
        done(err, null);
    }
}));

module.exports = passport;
