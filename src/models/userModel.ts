import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  id: string;
  profilePicture?: string;
  fullname: string;
  username: string;
  email: string;
  password: string;
  role: 'user' | 'admin' | 'moderator';
  bio: string;
  address: IAddress;
  phoneNumbers: IPhoneNumbers;
  paymentMethods: IPaymentMethods[];
  sessions: ISession[];
  socialLinks: ISocialLinks;
  recentActivity: Date;
  verificationToken: string;
  verificationTokenExpires: Date | null;
  isVerified: boolean;
  isAuthenticated: boolean;
  accessToken: string;
  refreshToken: string;
  oauthProviders: IOauthProviders;
  apiKey: mongoose.Types.ObjectId | null;
  betaKey: mongoose.Types.ObjectId | null;
  isBetaTester: boolean;
  termsAccepted: boolean;
  termsAcceptedAt: Date | null;
  posts: IPost[];
  projects: IProject[];
  friends: IFriend[];
  comparePassword(candidatePassword: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema: Schema<IUser> = new Schema({
  id: { type: String, unique: true },
  profilePicture: { type: String, required: false },
  fullname: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, lowercase: true, trim: true },
  password: { type: String, required: false },
  role: { type: String, enum: ['user', 'admin', 'moderator'], default: 'user' },
  bio: { type: String, default: '', trim: true },
  address: {
    street: { type: String, default: '' },
    houseNumber: { type: String, default: '' },
    state: { type: String, default: '' },
    postcode: { type: String, default: '' },
    country: { type: String, default: '' },
  },
  phoneNumbers: {
    mobile: { type: String, default: '' },
    landline: { type: String, default: '' },
    business: { type: String, default: '' },
  },
  paymentMethods: [ {
    method: { type: String, enum: ['creditCard', 'debitCard', 'paypal'], required: true },
  }],
  sessions: [{
    browser: { type: String, required: true },
    date: { type: Date, default: Date.now },
  }],
  socialLinks: {
    facebook: { type: String, default: '' },
    twitter: { type: String, default: '' },
    google: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    instagram: { type: String, default: '' },
    github: { type: String, default: '' },
    discord: { type: String, default: '' },
  },
  recentActivity: { type: Date, default: Date.now },
  verificationToken: { type: String, default: '' },
  verificationTokenExpires: { type: Date, default: null },
  isVerified: { type: Boolean, default: false },
  isAuthenticated: { type: Boolean, default: false },
  accessToken: { type: String },
  refreshToken: { type: String },
  oauthProviders: {
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
  },
  apiKey: { type: mongoose.Schema.Types.ObjectId, ref: 'ApiKey', sparse: true },
  betaKey: { type: mongoose.Schema.Types.ObjectId, ref: 'BetaKey', sparse: true },
  isBetaTester: { type: Boolean, default: false },
  termsAccepted: { type: Boolean, default: false },
  termsAcceptedAt: { type: Date },
  createdAt: { type: Date, default: () => new Date() },
  updatedAt: { type: Date, default: () => new Date() },
  posts: [{
    picture: { type: String, default: '' },
    title: { type: String, required: true },
    description: { type: String, required: true },
    author: { type: String, required: true },
    tags: [{ type: String }],
    createdAt: { type: Date, default: () => new Date() },
    updatedAt: { type: Date, default: () => new Date() },
  }],
  projects: [{
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
    createdAt: { type: Date, default: () => new Date() },
    updatedAt: { type: Date, default: () => new Date() },
  }],
  friends: [{
    follower: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    followed: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    followedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: () => new Date() },
    updatedAt: { type: Date, default: () => new Date() },
  }],
});

userSchema.statics.findOrCreate = async function (conditions: object, docToInsert: object) {
  let doc = await this.findOne(conditions);
  if (!doc) {
    doc = await this.create(docToInsert);
  }
  return doc;
};

userSchema.pre<IUser>('save', function (next) {
  if (!this.id) {
    this.id = `User-${uuidv4()}`;
  }
  next();
});

userSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: unknown) {
    if (error instanceof Error) {
      next(error);
    } else {
      next(new Error('Unknown error occurred during password hashing.'));
    }
  }
});

userSchema.methods.comparePassword = function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', userSchema);
