const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const findOrCreate = require('mongoose-findorcreate');

const socialLinksSchema = new mongoose.Schema({
  facebook: {
    type: String,
    default: ''
  },
  twitter: {
    type: String,
    default: ''
  },
  google: {
    type: String,
    default: ''
  },
  linkedin: {
    type: String,
    default: ''
  },
  instagram: {
    type: String,
    default: ''
  },
  github: {
    type: String,
    default: ''
  },
  discord: {
    type: String,
    default: ''
  },
  apple: {
    type: String,
    default: ''
  },
});

const oauthProvidersSchema = new mongoose.Schema({
  apple: {
    id: {
      type: String,
      default: ''
    },
    token: {
      type: String,
      default: ''
    }
  },
  github: {
    id: {
      type: String,
      default: ''
    },
    token: {
      type: String,
      default: ''
    }
  },
  google: {
    id: {
      type: String,
      default: ''
    },
    token: {
      type: String,
      default: ''
    }
  },
});

const friendSchema = new mongoose.Schema({
  follower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  followed: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  followedAt: {
    type: Date,
    default: Date.now
  },
});

const postSchema = new mongoose.Schema({
  picture: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  tags: [
    {
      type: String
    }
  ],
});

const projectSchema = new mongoose.Schema({
  picture: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    required: true
  },
  shortDescription: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  features: [
    {
      type: String
    }
  ],
  services: [
    {
      type: String
    }
  ],
  supportedPlatforms: [
    {
      type: String
    }
  ],
  versions: [
    {
      type: String
    }
  ],
  developer: {
    type: String,
    required: true
  },
  published: {
    type: Date,
    default: Date.now
  },
});

const addressSchema = new mongoose.Schema({
  street: {
    type: String,
    default: ''
  },
  houseNumber: {
    type: String,
    default: ''
  },
  state: {
    type: String,
    default: ''
  },
  postcode: {
    type: String,
    default: ''
  },
  country: {
    type: String,
    default: ''
  }
});

const phoneNumbersSchema = new mongoose.Schema({
  mobile: {
    type: String,
    default: ''
  },
  landline: {
    type: String,
    default: ''
  },
  business: {
    type: String,
    default: ''
  }
});

const paymentMethodsSchema = new mongoose.Schema({
  method: {
    type: String,
    enum: ['creditCard', 'debitCard', 'paypal'],
    required: true
  }
});

const sessionSchema = new mongoose.Schema({
  browser: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
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
    enum: ['user', 'admin', 'moderator'],
  },
  bio: {
    type: String,
    default: '',
    trim: true,
  },
  address: addressSchema,
  phoneNumbers: phoneNumbersSchema,
  paymentMethods: [paymentMethodsSchema],
  sessions: [sessionSchema],
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
  posts: [postSchema],
  projects: [projectSchema],
  friends: [friendSchema],
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
