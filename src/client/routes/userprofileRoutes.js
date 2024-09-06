const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { sendRegistrationVerificationEmail } = require('../../api/services/nodemailerService');

const User = require('../../models/userModel');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/profilePictures/');
  },
  filename: function (req, file, cb) {
    cb(null, req.user.username + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.use((req, res, next) => {
  isAuthenticated = res.locals.isAuthenticated;
  res.locals.user = req.user || null;
  next();
});

router.get('/profile', (req, res) => {
  if (isAuthenticated && res.locals.user) {
    return res.redirect(`/user/profile/${res.locals.user.username}`);
  } else {
    res.redirect('/login');
  }
});

router.get('/profile/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const currentTab = req.query.tab || 'posts';
    const currentUser = req.user;

    const user = await User.findOne({ username: username })
      .populate('friends.follower friends.followed')
      .exec();

    if (!user) {
      return res.status(404).render('error', {
        logoImage: '/assets/img/logo.png',
        errortitle: 'User Not Found',
        errormessage: 'The user you are looking for does not exist.',
        errorstatus: 404,
        errorstack: null,
        currentTab,
        currentUser,
      });
    }

    let posts = [];
    let projects = [];
    let friends = [];

    if (currentTab === 'posts') {
      posts = user.posts;
    } else if (currentTab === 'projects') {
      projects = user.projects;
    } else if (currentTab === 'friends') {
      friends = user.friends.map(friendship => friendship.followed);
    }

    res.render('userprofile/profile', {
      user: {
        thumbnail: user.thumbnail || '/assets/img/default-profile.png',
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
        _id: user._id,
      },
      currentUser: req.user,
      isAuthenticated: res.locals.isAuthenticated,
      logoImage: '/assets/img/logo.png',
      currentTab,
      posts,
      projects,
      friends,
      currentUser,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).render('error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Internal Server Error',
      errormessage: 'An unexpected error occurred while fetching the user profile.',
      errorstatus: 500,
      errorstack: error.stack,
      currentTab,
      currentUser,
    });
  }
});

router.get('/profile/:username/edit', async (req, res) => {
  if (!isAuthenticated || !res.locals.user) {
    return res.redirect('/login');
  }

  try {
    const { username } = req.params;
    const user = await User.findOne({ username: username });

    if (!user || user._id.toString() !== res.locals.user._id.toString()) {
      return res.status(403).render('error', {
        logo404: '/assets/img/404.png',
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
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
    });
  } catch (error) {
    console.error('Error fetching profile for editing:', error);
    res.status(500).render('error', {
      logo404: '/assets/img/404.png',
      logoImage: '/assets/img/logo.png',
      errortitle: 'Internal Server Error',
      errormessage: 'An unexpected error occurred while fetching the profile for editing.',
      errorstatus: 500,
      errorstack: error.stack
    });
  }
});

router.post('/profile/:username/edit', upload.single('profilePicture'), async (req, res) => {
  if (!isAuthenticated || !res.locals.user) {
    return res.redirect('/login');
  }

  try {
    const { username } = req.params;
    const user = await User.findOne({ username: username });

    if (!user || user._id.toString() !== res.locals.user._id.toString()) {
      return res.status(403).render('error', {
        logo404: '/assets/img/404.png',
        logoImage: '/assets/img/logo.png',
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
    res.redirect(`/user/profile/${user.username}`);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).render('error', {
      logo404: '/assets/img/404.png',
      logoImage: '/assets/img/logo.png',
      errortitle: 'Internal Server Error',
      errormessage: 'An unexpected error occurred while updating the user profile.',
      errorstatus: 500,
      errorstack: error.stack
    });
  }
});

router.get('/profile/:username/settings', (req, res) => {
  if (!isAuthenticated) {
    return res.redirect('/login');
  }

  res.render('userprofile/settings', {
    user: res.locals.user,
    logoImage: '/assets/img/logo.png',
    isAuthenticated: res.locals.isAuthenticated,
    api: {
      https: process.env.API_HTTPS,
      baseURL: process.env.API_BASE_URL,
      port: process.env.API_PORT,
    },
  });
});

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
    res.redirect(`/user/profile/${user.username}/settings`);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).render('error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Internal Server Error',
      errormessage: 'An unexpected error occurred while updating your settings.',
      errorstatus: 500,
      errorstack: error.stack,
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
    });
  }
});

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
        errorstack: null,
        api: {
          https: process.env.API_HTTPS,
          baseURL: process.env.API_BASE_URL,
          port: process.env.API_PORT,
        },
      });
    }

    if (user.isVerified) {
      return res.redirect(`/user/profile/${user.username}/settings`);
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = Date.now() + 3600000;
    await user.save();

    await sendRegistrationVerificationEmail(user.email, user.username, verificationToken);

    res.redirect(`/user/profile/${user.username}/settings`);
  } catch (error) {
    console.error('Error sending verification email:', error);
    res.status(500).render('error', {
      logoImage: '/assets/img/logo.png',
      errortitle: 'Internal Server Error',
      errormessage: 'An unexpected error occurred while sending the verification email.',
      errorstatus: 500,
      errorstack: error.stack,
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
    });
  }
});

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
      errorstack: error.stack,
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
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
      errorstack: error.stack,
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
    });
  }
});

module.exports = router;
