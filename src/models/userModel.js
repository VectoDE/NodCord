const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const findOrCreate = require('mongoose-findorcreate');

const userSchema = new mongoose.Schema({
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
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: 'user',
  },
  verificationToken: {
    type: String,
    default: '',
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
    apple: {
      id: String,
      token: String,
    },
    github: {
      id: String,
      token: String,
    },
    google: {
      id: String,
      token: String,
    },
    microsoft: {
      id: String,
      token: String,
    },
    faceit: {
      id: String,
      token: String,
    },
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

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
