const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const findOrCreate = require('mongoose-findorcreate');

const socialLinksSchema = new mongoose.Schema({
  facebook: { type: String, default: '' },
  twitter: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  instagram: { type: String, default: '' },
  github: { type: String, default: '' },
  discord: { type: String, default: '' },
});

const oauthProvidersSchema = new mongoose.Schema({
  apple: {
    id: { type: String, default: '' },
    token: { type: String, default: '' }
  },
  github: {
    id: { type: String, default: '' },
    token: { type: String, default: '' }
  },
  google: {
    id: { type: String, default: '' },
    token: { type: String, default: '' }
  },
});

const userSchema = new mongoose.Schema({
  profilePicture: {
    type: String,
    required: false,
  },
  fullname: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: 'user',
    enum: ['user', 'admin', 'moderator'], // Beispielrollen
  },
  bio: {
    type: String,
    default: '',
    trim: true,
  },
  socialLinks: {
    type: socialLinksSchema,
    default: {},
  },
  recentActivity: {
    type: Date,
    default: Date.now,
  },
  verificationToken: {
    type: String,
    default: '',
  },
  verificationTokenExpires: {
    type: Date,
    default: null,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isAuthenticated: {
    type: Boolean,
    default: false,
  },
  oauthProviders: {
    type: oauthProvidersSchema,
    default: {},
  },
  apiKey: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ApiKeySchema',
    sparse: true,
  },
  betaKey: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BetaKey',
    sparse: true,
  },
  isBetaTester: {
    type: Boolean,
    default: false,
  },
  termsAccepted: {
    type: Boolean,
    default: false,
  },
  termsAcceptedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.plugin(findOrCreate);

userSchema.pre('save', async function (next) {
  this.updatedAt = Date.now();
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
