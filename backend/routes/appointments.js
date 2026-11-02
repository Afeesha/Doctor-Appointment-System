const express = require('express');
const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { protect, requireRole } = require('../middleware/auth');
const { SLOTS } = require('./doctors');

const router = express.Router();
router.use(protect);

router.post('/', requireRole('patient'), async (req, res, next) => {
  try {
    const { doctorId, date, time, reason } = req.body;
    if (!mongoose.isValidObjectId(doctorId)) return res.status(400).json({ message: 'Invalid doctor' });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) return res.status(400).json({ message: 'Valid date required' });
    if (!SLOTS.includes(time)) return res.status(400).json({ message: 'Invalid time slot' });
    if (date < new Date().toISOString().slice(0, 10)) return res.status(400).json({ message: 'Choose a future date' });

    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    const clash = await Appointment.findOne({ doctor: doctorId, date, time, status: { $in: ['pending', 'confirmed'] } });
    if (clash) return res.status(409).json({ message: 'That slot was just taken. Pick another time.' });

    const appt = await Appointment.create({ patient: req.user._id, doctor: doctorId, date, time, reason });
    res.status(201).json(appt);
  } catch (err) {
    next(err);
  }
});

router.get('/mine', async (req, res, next) => {
  try {
    const filter = req.user.role === 'doctor' ? { doctor: req.user._id } : { patient: req.user._id };
    const list = await Appointment.find(filter)
      .populate('doctor', 'name specialization fees')
      .populate('patient', 'name email')
      .sort({ date: -1, time: -1 });
    res.json(list);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid appointment' });
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ message: 'Appointment not found' });

    const isDoctor = req.user.role === 'doctor' && String(appt.doctor) === String(req.user._id);
    const isPatient = req.user.role === 'patient' && String(appt.patient) === String(req.user._id);
    if (!isDoctor && !isPatient) return res.status(403).json({ message: 'Not allowed' });

    const allowed = isDoctor ? ['confirmed', 'completed', 'cancelled'] : ['cancelled'];
    if (!allowed.includes(status)) return res.status(400).json({ message: 'Status change not allowed' });
    if (['cancelled', 'completed'].includes(appt.status)) return res.status(400).json({ message: `Appointment is already ${appt.status}` });

    appt.status = status;
    await appt.save();
    res.json(appt);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
