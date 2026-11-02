const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const Appointment = require('../models/Appointment');

const router = express.Router();

const SLOTS = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

router.get('/', async (req, res, next) => {
  try {
    const { q, specialization } = req.query;
    const filter = { role: 'doctor' };
    if (q) filter.name = new RegExp(esc(String(q)), 'i');
    if (specialization) filter.specialization = new RegExp(`^${esc(String(specialization))}$`, 'i');
    const doctors = await User.find(filter).select('-password -email').sort({ name: 1 });
    res.json(doctors);
  } catch (err) {
    next(err);
  }
});

router.get('/specializations', async (req, res, next) => {
  try {
    res.json(await User.distinct('specialization', { role: 'doctor' }));
  } catch (err) {
    next(err);
  }
});

router.get('/:id/slots', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date } = req.query;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'Invalid doctor' });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) return res.status(400).json({ message: 'Valid date required (YYYY-MM-DD)' });
    const booked = await Appointment.find({ doctor: id, date, status: { $in: ['pending', 'confirmed'] } }).select('time');
    const taken = new Set(booked.map((a) => a.time));
    res.json(SLOTS.map((time) => ({ time, booked: taken.has(time) })));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
module.exports.SLOTS = SLOTS;
