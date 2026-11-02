import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="nav">
      <Link to="/" className="brand">CareSlot</Link>
      <nav>
        <NavLink to="/" end>Find doctors</NavLink>
        {user && <NavLink to="/appointments">My appointments</NavLink>}
        {user ? (
          <>
            <span className="who">{user.name}</span>
            <button className="btn ghost" onClick={() => { logout(); navigate('/'); }}>Log out</button>
          </>
        ) : (
          <>
            <NavLink to="/login">Log in</NavLink>
            <Link to="/register" className="btn">Create account</Link>
          </>
        )}
      </nav>
    </header>
  );
}
