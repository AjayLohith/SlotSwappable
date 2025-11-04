import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api/client'

export default function Requests() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['requests'], queryFn: async () => (await api.get('/swap-requests')).data })

  const respond = useMutation({
    mutationFn: async ({ id, accept }) => (await api.post(`/swap-response/${id}`, { accept })).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['requests'] })
      qc.invalidateQueries({ queryKey: ['my-events'] })
    }
  })

  if (isLoading) return <div className="card">Loading...</div>
  const incoming = data?.incoming || []
  const outgoing = data?.outgoing || []

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="card">
        <div className="section-title">
          <h2 style={{ margin: 0 }}>Requests</h2>
        </div>
      </div>

      <div className="grid" style={{ gap: 12 }}>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Incoming</h3>
          {incoming.length === 0 && <div className="muted">No incoming requests yet.</div>}
          <div className="grid" style={{ gap: 10 }}>
            {incoming.map(r => (
              <div key={r._id} className="list">
                <li>
                  <div>
                    <div><strong>{r.fromUser?.name || 'Someone'}</strong> offers <strong>{r.fromEvent?.title}</strong> for your <strong>{r.toEvent?.title}</strong></div>
                    <div className="meta">Status: {r.status}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {r.status === 'PENDING' && (
                      <>
                        <button className="btn btn-primary" onClick={() => respond.mutate({ id: r._id, accept: true })}>Accept</button>
                        <button className="btn btn-outline" onClick={() => respond.mutate({ id: r._id, accept: false })}>Reject</button>
                      </>
                    )}
                    {r.status !== 'PENDING' && <span className="badge">{r.status}</span>}
                  </div>
                </li>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Outgoing</h3>
          {outgoing.length === 0 && <div className="muted">No outgoing requests yet.</div>}
          <div className="grid" style={{ gap: 10 }}>
            {outgoing.map(r => (
              <div key={r._id} className="list">
                <li>
                  <div>
                    <div>You offered <strong>{r.fromEvent?.title}</strong> for <strong>{r.toEvent?.title}</strong></div>
                    <div className="meta">Status: {r.status}</div>
                  </div>
                  <span className="badge">{r.status}</span>
                </li>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}


