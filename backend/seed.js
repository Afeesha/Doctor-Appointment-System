// Optional: npm run seed  -> adds demo doctors and one demo patient
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const doctors = [
  { name: 'Dr. Ananya Rao', email: 'ananya@demo.com', specialization: 'Cardiologist', fees: 600, experience: 12, about: 'Heart health and preventive cardiology.' },
  { name: 'Dr. Rahul Verma', email: 'rahul@demo.com', specialization: 'Dermatologist', fees: 400, experience: 8, about: 'Skin, hair and allergy care.' },
  { name: 'Dr. Sneha Reddy', email: 'sneha@demo.com', specialization: 'Pediatrician', fees: 350, experience: 10, about: 'Child health and vaccinations.' },
  { name: 'Dr. Kiran Kumar', email: 'kiran@demo.com', specialization: 'General Physician', fees: 300, experience: 15, about: 'Everyday illness and health checkups.' },
];

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const hash = await bcrypt.hash('password123', 10);
  for (const d of doctors) {
    await User.updateOne({ email: d.email }, { $setOnInsert: { ...d, role: 'doctor', password: hash } }, { upsert: true });
  }
  await User.updateOne(
    { email: 'patient@demo.com' },
    { $setOnInsert: { name: 'Demo Patient', email: 'patient@demo.com', role: 'patient', password: hash } },
    { upsert: true }
  );
  console.log('Seeded. Login with any demo email + password123 (e.g. patient@demo.com)');
  await mongoose.disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
