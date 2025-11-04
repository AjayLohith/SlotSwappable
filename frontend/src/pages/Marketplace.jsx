import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api/client'

export default function Marketplace() {
  const qc = useQueryClient()
  const { data: theirs, isLoading } = useQuery({ queryKey: ['swappable-slots'], queryFn: async () => (await api.get('/swappable-slots')).data })
  const { data: mine } = useQuery({ queryKey: ['my-events'], queryFn: async () => (await api.get('/events')).data })
  const mySwappable = (mine || []).filter(e => e.status === 'SWAPPABLE')
  const [offerFor, setOfferFor] = useState(null)

  const requestSwap = useMutation({
    mutationFn: async ({ mySlotId, theirSlotId }) => (await api.post('/swap-request', { mySlotId, theirSlotId })).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['swappable-slots'] })
      qc.invalidateQueries({ queryKey: ['my-events'] })
      setOfferFor(null)
    }
  })

  if (isLoading) return <div className="card">Loading...</div>
  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="card">
        <div className="section-title">
          <h2 style={{ margin: 0 }}>Marketplace</h2>
          <span className="badge ok">{(theirs || []).length}</span>
        </div>
      </div>
      <div className="grid" style={{ gap: 10 }}>
        {(theirs || []).length === 0 && <div className="card muted">No swappable slots from others yet.</div>}
        {(theirs || []).map(slot => (
          <div key={slot._id} className="list">
            <li>
              <div>
                <div><strong>{slot.title}</strong></div>
                <div className="meta">{new Date(slot.startTime).toLocaleString()}</div>
              </div>
              <button className="btn btn-primary" onClick={() => setOfferFor(slot)}>Request Swap</button>
            </li>
          </div>
        ))}
      </div>

      {offerFor && (
        <div className="card" style={{ marginTop: 16 }}>
          <h3 style={{ marginTop: 0 }}>Offer a slot for: {offerFor.title}</h3>
          <div className="grid" style={{ gap: 10 }}>
            {mySwappable.length === 0 && <div className="muted">You have no swappable slots. Mark some events as SWAPPABLE in your Dashboard.</div>}
            {mySwappable.map(m => (
              <div key={m._id} className="list">
                <li>
                  <div>
                    <div><strong>{m.title}</strong></div>
                    <div className="meta">{new Date(m.startTime).toLocaleString()}</div>
                  </div>
                  <button className="btn btn-primary" onClick={() => requestSwap.mutate({ mySlotId: m._id, theirSlotId: offerFor._id })}>Offer this</button>
                </li>
              </div>
            ))}
          </div>
          <div className="spacer" />
          <button className="btn btn-outline" onClick={() => setOfferFor(null)}>Cancel</button>
        </div>
      )}
    </div>
  )
}


