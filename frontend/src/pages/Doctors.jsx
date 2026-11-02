import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { errMsg } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import BookModal from '../components/BookModal.jsx';

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [specs, setSpecs] = useState([]);
  const [q, setQ] = useState('');
  const [spec, setSpec] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [notice, setNotice] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/doctors/specializations').then((r) => setSpecs(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      api
        .get('/doctors', { params: { q, specialization: spec } })
        .then((r) => { setDoctors(r.data); setError(''); })
        .catch((e) => setError(errMsg(e)))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [q, spec]);

  const book = (d) => (user ? setSelected(d) : navigate('/login'));

  return (
    <>
      <section className="hero">
        <h1>See a doctor this week, not next month.</h1>
        <p>Search by name or specialty, pick an open slot, and you are booked.</p>
      </section>

      <div className="filters">
        <input placeholder="Search doctor by name" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={spec} onChange={(e) => setSpec(e.target.value)}>
          <option value="">All specialties</option>
          {specs.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {notice && <p className="success">{notice}</p>}
      {error && <p className="error">{error}</p>}
      {loading && <p className="muted">Loading doctors...</p>}
      {!loading && !error && doctors.length === 0 && (
        <p className="muted">No doctors match your search. Clear the filters or register a doctor account.</p>
      )}

      <div className="grid">
        {doctors.map((d) => (
          <article className="card doc" key={d._id}>
            <div className="avatar">{d.name.replace('Dr. ', '').charAt(0)}</div>
            <div>
              <h3>{d.name}</h3>
              <p className="spec">{d.specialization}</p>
              <p className="muted">{d.experience} yrs experience - INR {d.fees}</p>
              {d.about && <p className="about">{d.about}</p>}
              {user?.role !== 'doctor' && <button className="btn" onClick={() => book(d)}>Book appointment</button>}
            </div>
          </article>
        ))}
      </div>

      {selected && (
        <BookModal
          doctor={selected}
          onClose={() => setSelected(null)}
          onBooked={() => {
            setSelected(null);
            setNotice('Appointment booked. Track it under My appointments.');
          }}
        />
      )}
    </>
  );
}
