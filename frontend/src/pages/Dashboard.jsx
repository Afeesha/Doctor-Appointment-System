import { useCallback, useEffect, useState } from 'react';
import api, { errMsg } from '../api.js';
import { useAuth } from '../AuthContext.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    api
      .get('/appointments/mine')
      .then((r) => { setList(r.data); setError(''); })
      .catch((e) => setError(errMsg(e)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const setStatus = async (id, status) => {
    try {
      await api.patch(`/appointments/${id}/status`, { status });
      load();
    } catch (e) {
      setError(errMsg(e));
    }
  };

  const isDoctor = user.role === 'doctor';

  return (
    <>
      <h1>{isDoctor ? 'Patient appointments' : 'My appointments'}</h1>
      {error && <p className="error">{error}</p>}
      {loading && <p className="muted">Loading...</p>}
      {!loading && list.length === 0 && (
        <p className="muted">{isDoctor ? 'No patients have booked you yet.' : 'You have no appointments. Find a doctor to book one.'}</p>
      )}
      <div className="list">
        {list.map((a) => (
          <article className="card appt" key={a._id}>
            <div>
              <h3>{isDoctor ? a.patient?.name || 'Patient' : a.doctor?.name || 'Doctor'}</h3>
              <p className="muted">{isDoctor ? a.patient?.email : a.doctor?.specialization}</p>
              <p>{a.date} at {a.time}</p>
              {a.reason && <p className="about">Reason: {a.reason}</p>}
            </div>
            <div className="actions">
              <span className={`badge ${a.status}`}>{a.status}</span>
              {isDoctor && a.status === 'pending' && <button className="btn" onClick={() => setStatus(a._id, 'confirmed')}>Confirm</button>}
              {isDoctor && a.status === 'confirmed' && <button className="btn" onClick={() => setStatus(a._id, 'completed')}>Mark completed</button>}
              {['pending', 'confirmed'].includes(a.status) && (
                <button className="btn ghost" onClick={() => setStatus(a._id, 'cancelled')}>Cancel</button>
              )}
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
