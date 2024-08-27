const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('../../models/userModel');
const { sendRegistrationVerificationEmail } = require('../services/nodemailerService');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/profilePictures/');
  },
  filename: function (req, file, cb) {
    cb(null, req.user.username + path.extname(file.originalname)); // Speichert die Datei mit dem Benutzernamen
  }
});

const upload = multer({ storage: storage });

// Middleware for authentication and user setup
router.use((req, res, next) => {
  isAuthenticated = res.locals.isAuthenticated;
  res.locals.user = req.user || null;
  next();
});

// Route to redirect to the current user's profile
router.get('/profile', (req, res) => {
  if (isAuthenticated && res.locals.user) {
    return res.redirect(`/user/profile/${res.locals.user.username}`);
  } else {
    res.redirect('/login');
  }
});

// Route to render user profile by username
router.get('/profile/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username: username });

    if (!user) {
      return res.status(404).render('error', {
        logoImage: '/assets/img/logo.png',
        errortitle: 'User Not Found',
        errormessage: 'The user you are looking for does not exist.',
        errorstatus: 404,
        errorstack: null
      });
    }

    res.render('userprofile/profile', {
      user: {
        profilePicture: user.profilePicture || '/assets/img/default-profile.png',
        username: user.username,
        fullName: user.fullname,
        email: user.email,
        bio: user.bio,
        socialLinks: user.socialLinks || {},
        recentActivity: user.recentActivity || [],
        createdAt: user.createdAt || null,
        isBetaTester: user.isBetaTester || false,
        role: user.role || 'User',
        _id: user._id
      },
      currentUser: req.user,
      isAuthenticated: res.locals.isAuthenticated,
      logoImage: '/assets/img/logo.png',
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).render('error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Internal Server Error',
      errormessage: 'An unexpected error occurred while fetching the user profile.',
      errorstatus: 500,
      errorstack: error.stack
    });
  }
});

// Route to render profile edit page
router.get('/profile/:username/edit', async (req, res) => {
  if (!isAuthenticated || !res.locals.user) {
    return res.redirect('/login');
  }

  try {
    const { username } = req.params;
    const user = await User.findOne({ username: username });

    if (!user || user._id.toString() !== res.locals.user._id.toString()) {
      return res.status(403).render('error', {
        logoImage: '/assets/img/logo.png',
        errortitle: 'Access Denied',
        errormessage: 'You are not authorized to edit this profile.',
        errorstatus: 403,
        errorstack: null
      });
    }

    res.render('userprofile/editProfile', {
      user: user,
      isAuthenticated: res.locals.isAuthenticated,
      logoImage: '/assets/img/logo.png',
    });
  } catch (error) {
    console.error('Error fetching profile for editing:', error);
    res.status(500).render('error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Internal Server Error',
      errormessage: 'An unexpected error occurred while fetching the profile for editing.',
      errorstatus: 500,
      errorstack: error.stack
    });
  }
});

// Route to handle profile edits
router.post('/profile/:username/edit', upload.single('profilePicture'), async (req, res) => {
  if (!isAuthenticated || !res.locals.user) {
    return res.redirect('/login');
  }

  try {
    const { username } = req.params;
    const user = await User.findOne({ username: username });

    if (!user || user._id.toString() !== res.locals.user._id.toString()) {
      return res.status(403).render('error', {
        errortitle: 'Access Denied',
        errormessage: 'You are not authorized to edit this profile.',
        errorstatus: 403,
        errorstack: null
      });
    }

    const { fullname, email, bio, socialLinks } = req.body;

    user.fullname = fullname;
    user.email = email;
    user.bio = bio;
    user.socialLinks = socialLinks;

    if (req.file) {
      user.profilePicture = `/uploads/profilePictures/${req.file.filename}`;
    }

    await user.save();
    res.redirect(`/profile/${user.username}`);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).render('error', {
      errortitle: 'Internal Server Error',
      errormessage: 'An unexpected error occurred while updating the user profile.',
      errorstatus: 500,
      errorstack: error.stack
    });
  }
});

// Route to render settings page
router.get('/profile/:username/settings', (req, res) => {
  if (!isAuthenticated) {
    return res.redirect('/login');
  }

  res.render('userprofile/settings', {
    user: res.locals.user,
    logoImage: '/assets/img/logo.png',
    isAuthenticated: res.locals.isAuthenticated,
  });
});

// Route to handle settings form submission
router.post('/profile/:username/settings', async (req, res) => {
  if (!isAuthenticated) {
    return res.redirect('/login');
  }

  try {
    const user = await User.findById(req.user._id);

    const { email, fullname, username, password } = req.body;

    if (email) user.email = email;
    if (fullname) user.fullname = fullname;
    if (username) user.username = username;
    if (password) user.password = await bcrypt.hash(password, 10);

    await user.save();
    res.redirect(`/profile/${user.username}/settings`);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).render('error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Internal Server Error',
      errormessage: 'An unexpected error occurred while updating your settings.',
      errorstatus: 500,
      errorstack: error.stack
    });
  }
});

// Route to send verification email
router.get('/profile/:username/send-verification', async (req, res) => {
  if (!isAuthenticated) {
    return res.redirect('/login');
  }

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).render('error', {
        logoImage: '/assets/img/logo.png',
        errortitle: 'User Not Found',
        errormessage: 'The user you are looking for does not exist.',
        errorstatus: 404,
        errorstack: null
      });
    }

    if (user.isVerified) {
      return res.redirect(`/profile/${user.username}/settings`);
    }

    // Generate a verification token and save it
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = Date.now() + 3600000;
    await user.save();

    await sendRegistrationVerificationEmail(user.email, user.username, verificationToken);

    res.redirect(`/profile/${user.username}/settings`);
  } catch (error) {
    console.error('Error sending verification email:', error);
    res.status(500).render('error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Internal Server Error',
      errormessage: 'An unexpected error occurred while sending the verification email.',
      errorstatus: 500,
      errorstack: error.stack
    });
  }
});

// Route to log out from all sessions
router.get('/profile/:username/logout-all-sessions', async (req, res) => {
  if (!isAuthenticated) {
    return res.redirect('/login');
  }

  try {
    req.logout();
    res.redirect('/login');
  } catch (error) {
    console.error('Error logging out from all sessions:', error);
    res.status(500).render('error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Internal Server Error',
      errormessage: 'An unexpected error occurred while logging out from all sessions.',
      errorstatus: 500,
      errorstack: error.stack
    });
  }
});

// Route to handle account deletion
router.post('/profile/delete-account', async (req, res) => {
  if (!isAuthenticated) {
    return res.redirect('/login');
  }

  try {
    await User.findByIdAndDelete(req.user._id);
    req.logout();
    res.redirect('/');
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).render('error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Internal Server Error',
      errormessage: 'An unexpected error occurred while deleting your account.',
      errorstatus: 500,
      errorstack: error.stack
    });
  }
});

module.exports = router;
