const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    profileImage: { type: String },
  username: {
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
    enum: ['doctor', 'patient'],
    default: 'patient', // Set a default role for new users
    required: true,
  }
},
{timestamps: true}

);

const User = mongoose.model('User', userSchema, 'users');

module.exports = User;
