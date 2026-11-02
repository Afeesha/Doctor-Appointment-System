import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { errMsg } from '../api.js';
import { useAuth } from '../AuthContext.jsx';

export default function Register() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'patient', specialization: '', fees: '', experience: '', about: '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const { data } = await api.post('/auth/register', form);
      login(data);
      navigate(data.user.role === 'doctor' ? '/appointments' : '/');
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="card auth" onSubmit={submit}>
      <h1>Create your account</h1>
      {error && <p className="error">{error}</p>}
      <label>I am a
        <select value={form.role} onChange={set('role')}>
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
        </select>
      </label>
      <label>Full name <input required value={form.name} onChange={set('name')} /></label>
      <label>Email <input type="email" required value={form.email} onChange={set('email')} /></label>
      <label>Password (6+ characters)
        <input type="password" required minLength={6} value={form.password} onChange={set('password')} />
      </label>
      {form.role === 'doctor' && (
        <>
          <label>Specialization <input required placeholder="e.g. Cardiologist" value={form.specialization} onChange={set('specialization')} /></label>
          <div className="row">
            <label>Fees (INR) <input type="number" min="0" value={form.fees} onChange={set('fees')} /></label>
            <label>Experience (years) <input type="number" min="0" value={form.experience} onChange={set('experience')} /></label>
          </div>
          <label>About you <textarea rows="3" value={form.about} onChange={set('about')} /></label>
        </>
      )}
      <button className="btn" disabled={busy}>{busy ? 'Creating...' : 'Create account'}</button>
      <p className="muted">Already registered? <Link to="/login">Log in</Link></p>
    </form>
  );
}
