const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const findOrCreate = require('mongoose-findorcreate');

const socialLinkModel = new mongoose.Schema({
  facebook: { type: String, default: '' },
  twitter: { type: String, default: '' },
  google: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  instagram: { type: String, default: '' },
  github: { type: String, default: '' },
  discord: { type: String, default: '' },
});

const oauthProvidersModel = new mongoose.Schema({
  github: {
    id: { type: String, default: '' },
    token: {
      accessToken: { type: String, default: '' },
      refreshToken: { type: String, default: '' },
    },
  },
  google: {
    id: { type: String, default: '' },
    token: {
      accessToken: { type: String, default: '' },
      refreshToken: { type: String, default: '' },
    },
  },
});

const friendModel = new mongoose.Schema({
  follower: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  followed: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  followedAt: { type: Date, default: Date.now },
});

const postModel = new mongoose.Schema({
  picture: { type: String, default: '' },
  title: { type: String, required: true },
  description: { type: String, required: true },
  author: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  tags: [{ type: String }],
});

const projectModel = new mongoose.Schema({
  picture: { type: String, default: '' },
  title: { type: String, required: true },
  shortDescription: { type: String, required: true },
  description: { type: String, required: true },
  features: [{ type: String }],
  services: [{ type: String }],
  supportedPlatforms: [{ type: String }],
  versions: [{ type: String }],
  developer: { type: String, required: true },
  published: { type: Date, default: Date.now },
});

const addressModel = new mongoose.Schema({
  street: { type: String, default: '' },
  houseNumber: { type: String, default: '' },
  state: { type: String, default: '' },
  postcode: { type: String, default: '' },
  country: { type: String, default: '' },
});

const phoneNumbersModel = new mongoose.Schema({
  mobile: { type: String, default: '' },
  landline: { type: String, default: '' },
  business: { type: String, default: '' },
});

const paymentMethodsModel = new mongoose.Schema({
  method: { type: String, enum: ['creditCard', 'debitCard', 'paypal'], required: true }
});

const sessionModel = new mongoose.Schema({
  browser: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

const userModel = new mongoose.Schema({
  id: { type: String, unique: true, },
  profilePicture: { type: String, required: false },
  fullname: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: false, unique: true, lowercase: true, trim: true },
  password: { type: String, required: false },
  role: { type: String, default: 'user', enum: ['user', 'admin', 'moderator'] },
  bio: { type: String, default: '', trim: true },
  address: addressModel,
  phoneNumbers: phoneNumbersModel,
  paymentMethods: [paymentMethodsModel],
  sessions: [sessionModel],
  socialLinks: { type: socialLinkModel, default: {} },
  recentActivity: { type: Date, default: Date.now },
  verificationToken: { type: String, default: '' },
  verificationTokenExpires: { type: Date, default: null },
  isVerified: { type: Boolean, default: false },
  isAuthenticated: { type: Boolean, default: false },
  accessToken: { type: String },
  refreshToken: { type: String },
  oauthProviders: { type: oauthProvidersModel, default: {} },
  apiKey: { type: mongoose.Schema.Types.ObjectId, ref: 'ApiKey', sparse: true },
  betaKey: { type: mongoose.Schema.Types.ObjectId, ref: 'BetaKey', sparse: true },
  isBetaTester: { type: Boolean, default: false },
  termsAccepted: { type: Boolean, default: false },
  termsAcceptedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  posts: [postModel],
  projects: [projectModel],
  friends: [friendModel],
});

userModel.plugin(findOrCreate);

userModel.pre('save', function (next) {
  if (!this.id) {
    this.id = `User-${uuidv4()}`;
  }
  next();
});

userModel.pre('save', async function (next) {
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

userModel.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userModel);
