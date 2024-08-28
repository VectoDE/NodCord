const mongoose = require('mongoose');
const User = require('../models/userModel');
const serverConfig = require('../config/serverConfig');
const bcrypt = require('bcrypt');

async function createUser(data) {
  try {
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      console.log(`User with email ${data.email} already exists.`);
      return;
    }

    const user = new User(data);
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    await user.save();
    console.log(`User ${data.username} created successfully.`);
  } catch (error) {
    console.error(`Error creating user ${data.username}: `, error);
  }
}

async function seedUsers() {
  // Verbinde dich mit der MongoDB-Datenbank
  await mongoose.connect(serverConfig.mongoURI, { });

  // Benutzer-Daten zum Seed (Beispiel)
  const users = [
    {
      profilePicture: '',
      fullname: 'Admin User',
      username: 'admin',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin',
      bio: 'I am the admin.',
      socialLinks: {
        facebook: 'https://facebook.com/admin',
        twitter: 'https://twitter.com/admin',
        linkedin: 'https://linkedin.com/in/admin',
      },
      isVerified: true,
      isAuthenticated: true,
      isBetaTester: false,
      termsAccepted: true,
      termsAcceptedAt: new Date(),
    },
    {
      profilePicture: '',
      fullname: 'Moderator User',
      username: 'moderator',
      email: 'moderator@example.com',
      password: 'password123',
      role: 'moderator',
      bio: 'I am a moderator.',
      socialLinks: {
        github: 'https://github.com/moderator',
        discord: 'moderator#1234',
      },
      isVerified: true,
      isAuthenticated: true,
      isBetaTester: true,
      termsAccepted: true,
      termsAcceptedAt: new Date(),
    },
    {
      profilePicture: '',
      fullname: 'Regular User',
      username: 'user',
      email: 'user@example.com',
      password: 'password123',
      role: 'user',
      bio: 'I am a regular user.',
      socialLinks: {
        instagram: 'https://instagram.com/user',
        twitter: 'https://twitter.com/user',
      },
      isVerified: true,
      isAuthenticated: false,
      isBetaTester: false,
      termsAccepted: true,
      termsAcceptedAt: new Date(),
    },
  ];

  // Erstelle die Benutzer
  for (const userData of users) {
    await createUser(userData);
  }

  // Verbindung zur Datenbank schließen
  mongoose.connection.close();
}

// Führe das Seed-Skript aus
seedUsers();