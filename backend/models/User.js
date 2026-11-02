const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['patient', 'doctor'], default: 'patient' },
    specialization: { type: String, trim: true },
    fees: { type: Number, default: 0 },
    experience: { type: Number, default: 0 },
    about: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
