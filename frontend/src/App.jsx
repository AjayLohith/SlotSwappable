import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import useAuthStore from './store/auth'

export default function App() {
  const { token, user, logout } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()
  const displayName = (user?.name || user?.email || '').toLowerCase()
  const initials = (user?.name || user?.email || 'U').slice(0,1).toUpperCase()
  const [open, setOpen] = useState(false)

  return (
    <div className="container">
      <header className="navbar card">
        <div className="brand">SlotSwapper</div>
        <nav className="nav">
          <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>Dashboard</NavLink>
          <NavLink to="/marketplace" className={({ isActive }) => isActive ? 'active' : ''}>Marketplace</NavLink>
          <NavLink to="/requests" className={({ isActive }) => isActive ? 'active' : ''}>Requests</NavLink>
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {token && user && (
            <div className="profile">
              <div className="avatar" onClick={() => setOpen(!open)} aria-label="Profile menu">{initials}</div>
              {open && (
                <div className="menu" onMouseLeave={() => setOpen(false)}>
                  <h4 style={{ textTransform: 'capitalize' }}>{displayName}</h4>
                  <div className="muted">{user.email}</div>
                  <div className="actions">
                    <button className="btn btn-outline" onClick={() => { setOpen(false); logout(); navigate('/login') }}>Logout</button>
                  </div>
                </div>
              )}
            </div>
          )}
          {!token && (
            location.pathname === '/login' ? <Link className="btn btn-outline" to="/signup">Sign Up</Link> : <Link className="btn btn-primary" to="/login">Log In</Link>
          )}
        </div>
      </header>
      <main style={{ marginTop: 24 }}>
        <Outlet />
      </main>
    </div>
  )
}


