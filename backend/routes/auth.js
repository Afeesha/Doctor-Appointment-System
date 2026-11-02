const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const publicUser = (u) => ({
  _id: u._id,
  name: u.name,
  email: u.email,
  role: u.role,
  specialization: u.specialization,
  fees: u.fees,
  experience: u.experience,
});

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role, specialization, fees, experience, about } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
    if (await User.findOne({ email: email.toLowerCase() }))
      return res.status(400).json({ message: 'This email is already registered' });
    const isDoctor = role === 'doctor';
    if (isDoctor && !specialization) return res.status(400).json({ message: 'Doctors must add a specialization' });

    const user = await User.create({
      name,
      email,
      password: await bcrypt.hash(password, 10),
      role: isDoctor ? 'doctor' : 'patient',
      specialization: isDoctor ? specialization : undefined,
      fees: isDoctor ? Number(fees) || 0 : 0,
      experience: isDoctor ? Number(experience) || 0 : 0,
      about: isDoctor ? about || '' : '',
    });
    res.status(201).json({ token: sign(user._id), user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(400).json({ message: 'Incorrect email or password' });
    res.json({ token: sign(user._id), user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

router.get('/me', protect, (req, res) => res.json({ user: publicUser(req.user) }));

module.exports = router;
