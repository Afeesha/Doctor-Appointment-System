import { useEffect, useState } from 'react';
import api, { errMsg } from '../api.js';

const today = () => new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD in local time

export default function BookModal({ doctor, onClose, onBooked }) {
  const [date, setDate] = useState(today());
  const [slots, setSlots] = useState([]);
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    setTime('');
    api
      .get(`/doctors/${doctor._id}/slots`, { params: { date } })
      .then((r) => alive && setSlots(r.data))
      .catch((e) => alive && setError(errMsg(e)));
    return () => { alive = false; };
  }, [doctor._id, date]);

  const submit = async (e) => {
    e.preventDefault();
    if (!time) return setError('Pick a time slot');
    setError('');
    setBusy(true);
    try {
      await api.post('/appointments', { doctorId: doctor._id, date, time, reason });
      onBooked();
    } catch (err) {
      setError(errMsg(err));
      api.get(`/doctors/${doctor._id}/slots`, { params: { date } }).then((r) => setSlots(r.data)).catch(() => {});
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <form className="card modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h2>Book {doctor.name}</h2>
        <p className="muted">{doctor.specialization} - Fees INR {doctor.fees}</p>
        {error && <p className="error">{error}</p>}
        <label>Date
          <input type="date" min={today()} value={date} onChange={(e) => setDate(e.target.value || today())} />
        </label>
        <div className="slots">
          {slots.map((s) => (
            <button
              type="button"
              key={s.time}
              disabled={s.booked}
              className={`slot ${time === s.time ? 'on' : ''}`}
              onClick={() => setTime(s.time)}
            >
              {s.time}
            </button>
          ))}
        </div>
        <label>Reason for visit (optional)
          <textarea rows="2" value={reason} onChange={(e) => setReason(e.target.value)} />
        </label>
        <div className="row end">
          <button type="button" className="btn ghost" onClick={onClose}>Close</button>
          <button className="btn" disabled={busy}>{busy ? 'Booking...' : 'Confirm booking'}</button>
        </div>
      </form>
    </div>
  );
}
