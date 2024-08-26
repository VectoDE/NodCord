const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const User = require('../../models/userModel');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/profilePictures/');
  },
  filename: function (req, file, cb) {
    cb(null, req.user.username + path.extname(file.originalname)); // Speichert die Datei mit dem Benutzernamen
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

    const user = await User.findOne({ username: username });

    if (!user) {
      return res.status(404).render('error', {
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
      isAuthenticated: res.locals.isAuthenticated
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).render('error', {
      errortitle: 'Internal Server Error',
      errormessage: 'An unexpected error occurred while fetching the user profile.',
      errorstatus: 500,
      errorstack: error.stack
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
        errortitle: 'Access Denied',
        errormessage: 'You are not authorized to edit this profile.',
        errorstatus: 403,
        errorstack: null
      });
    }

    res.render('userprofile/editProfile', {
      user: user,
      isAuthenticated: res.locals.isAuthenticated
    });
  } catch (error) {
    console.error('Error fetching profile for editing:', error);
    res.status(500).render('error', {
      errortitle: 'Internal Server Error',
      errormessage: 'An unexpected error occurred while fetching the profile for editing.',
      errorstatus: 500,
      errorstack: error.stack
    });
  }
});

router.post('/profile/:username/edit', upload.single('profilePicture'), async (req, res) => {
  if (!res.locals.isAuthenticated || !res.locals.user) {
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

module.exports = router;
