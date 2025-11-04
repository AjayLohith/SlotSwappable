import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client'
import useAuthStore from '../store/auth'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const { data } = await api.post('/auth/login', { email, password })
      login(data.token, data.user)
      navigate('/')
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed')
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '40px auto' }}>
      <div className="card" style={{ padding: 24 }}>
        <h2 style={{ marginTop: 0 }}>Welcome back</h2>
        <p className="muted">Log in to continue swapping slots</p>
        <div className="spacer" />
        <form onSubmit={submit} className="grid" style={{ gap: 10 }}>
          <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="submit" className="btn btn-primary">Login</button>
          {error && <div className="badge" style={{ borderColor: 'transparent', background: '#fde68a', color: '#0b0f15' }}>{error}</div>}
        </form>
        <div className="spacer" />
        <p className="muted">No account? <Link to="/signup">Create one</Link></p>
      </div>
    </div>
  )
}


