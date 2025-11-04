import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client'
import useAuthStore from '../store/auth'

export default function Signup() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const { data } = await api.post('/auth/signup', { name, email, password })
      login(data.token, data.user)
      navigate('/')
    } catch (err) {
      setError(err?.response?.data?.message || 'Signup failed')
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '40px auto' }}>
      <div className="card" style={{ padding: 24 }}>
        <h2 style={{ marginTop: 0 }}>Create account</h2>
        <p className="muted">Start swapping your calendar slots</p>
        <div className="spacer" />
        <form onSubmit={submit} className="grid" style={{ gap: 10 }}>
          <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="submit" className="btn btn-primary">Create account</button>
          {error && <div className="badge" style={{ borderColor: 'transparent', background: '#fde68a', color: '#0b0f15' }}>{error}</div>}
        </form>
        <div className="spacer" />
        <p className="muted">Have an account? <Link to="/login">Log in</Link></p>
      </div>
    </div>
  )
}


