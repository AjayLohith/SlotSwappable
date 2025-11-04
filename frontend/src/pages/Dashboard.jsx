import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import api from '../api/client'
import EventForm from '../components/EventForm'
import Calendar from '../components/Calendar'

export default function Dashboard() {
  const [editingId, setEditingId] = useState('')
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [newTitle, setNewTitle] = useState('')
  const [newFrom, setNewFrom] = useState('10:00')
  const [newTo, setNewTo] = useState('11:00')
  const [showCalendar, setShowCalendar] = useState(false)
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['my-events'], queryFn: async () => (await api.get('/events')).data })

  const createEvent = useMutation({
    mutationFn: async (payload) => (await api.post('/events', {
      ...payload,
      startTime: new Date(payload.startTime).toISOString(),
      endTime: new Date(payload.endTime).toISOString()
    })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-events'] })
  })

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }) => (await api.patch(`/events/${id}`, { status })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-events'] })
  })

  const updateEvent = useMutation({
    mutationFn: async ({ id, payload }) => (await api.patch(`/events/${id}`, {
      ...payload,
      startTime: payload.startTime ? new Date(payload.startTime).toISOString() : undefined,
      endTime: payload.endTime ? new Date(payload.endTime).toISOString() : undefined
    })).data,
    onSuccess: () => { setEditingId(''); qc.invalidateQueries({ queryKey: ['my-events'] }) }
  })

  const deleteEvent = useMutation({
    mutationFn: async (id) => (await api.delete(`/events/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-events'] })
  })

  const sameDayEvents = useMemo(() => {
    const all = data || []
    const [y, m, d] = selectedDate.split('-').map(Number)
    return all.filter(e => {
      const dt = new Date(e.startTime)
      return dt.getFullYear() === y && (dt.getMonth() + 1) === m && dt.getDate() === d
    })
  }, [data, selectedDate])

  function formatDateTimeRange(startIso, endIso) {
    const s = new Date(startIso)
    const e = new Date(endIso)
    const dd = String(s.getDate()).padStart(2, '0')
    const mm = String(s.getMonth() + 1).padStart(2, '0')
    const yyyy = s.getFullYear()
    const fmt = (d) => {
      let h = d.getHours()
      const m = String(d.getMinutes()).padStart(2, '0')
      const ampm = h >= 12 ? 'pm' : 'am'
      h = h % 12
      if (h === 0) h = 12
      return `${h}${m !== '00' ? ':' + m : ''}${ampm}`
    }
    return `${dd}-${mm}-${yyyy} ${fmt(s)}-${fmt(e)}`
  }

  function toIsoFromParts(yyyymmdd, hhmm) {
    const [yyyy, mm, dd] = yyyymmdd.split('-').map(Number)
    const [hh, mi] = hhmm.split(':').map(Number)
    const d = new Date(yyyy, (mm - 1), dd, hh, mi, 0)
    return d.toISOString()
  }

  function createFromParts() {
    if (!newTitle || !selectedDate || !newFrom || !newTo) return
    const startTime = toIsoFromParts(selectedDate, newFrom)
    const endTime = toIsoFromParts(selectedDate, newTo)
    createEvent.mutate({ title: newTitle, startTime, endTime })
    setNewTitle('')
  }

  if (isLoading) return <div className="card">Loading...</div>
  const events = sameDayEvents

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="card">
        <div className="section-title">
          <h2 style={{ margin: 0 }}>My Events</h2>
          <span className="badge ok">{events.length}</span>
        </div>
        <div className="grid" style={{ gap: 12 }}>
          <div className="grid" style={{ gridTemplateColumns: '1fr 1.2fr', gap: 12, alignItems: 'start' }}>
            <div>
              <button className="btn btn-outline" onClick={() => setShowCalendar(s => !s)}>{showCalendar ? 'Hide Calendar' : 'Pick Day'}</button>
              <div style={{ marginTop: 10 }}>
                {showCalendar && <Calendar value={selectedDate} onChange={(v) => { setSelectedDate(v); setShowCalendar(false) }} />}
              </div>
            </div>
            <div className="grid" style={{ gap: 10 }}>
              <input placeholder="Event title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
              <div className="grid" style={{ gridTemplateColumns: '1fr 1fr auto', gap: 10, alignItems: 'center' }}>
                <input type="time" value={newFrom} onChange={(e) => setNewFrom(e.target.value)} />
                <input type="time" value={newTo} onChange={(e) => setNewTo(e.target.value)} />
                <button className="btn btn-primary" onClick={createFromParts}>Save</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid" style={{ gap: 10 }}>
        {events.length === 0 && <div className="card muted">No events for this day.</div>}
        {events.map(e => (
          <div key={e._id} className="list">
            <li>
              <div style={{ flex: 1 }}>
                {editingId === e._id ? (
                  <EventForm
                    defaultValues={{ title: e.title, startTime: e.startTime?.slice(0, 16), endTime: e.endTime?.slice(0, 16) }}
                    onSubmit={(payload) => updateEvent.mutate({ id: e._id, payload })}
                  />
                ) : (
                  <>
                    <div><strong>{e.title}</strong></div>
                    <div className="meta">{formatDateTimeRange(e.startTime, e.endTime)}</div>
                  </>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="badge">{e.status}</span>
                {editingId === e._id ? (
                  <button className="btn btn-outline" onClick={() => setEditingId('')}>Cancel</button>
                ) : (
                  <>
                    <button className="btn btn-outline" onClick={() => setEditingId(e._id)}>Edit</button>
                    <button className="btn btn-danger" onClick={() => { if (confirm('Delete this event?')) deleteEvent.mutate(e._id) }}>Delete</button>
                    {e.status === 'BUSY' && <button className="btn btn-outline" onClick={() => updateStatus.mutate({ id: e._id, status: 'SWAPPABLE' })}>Make Swappable</button>}
                    {e.status === 'SWAPPABLE' && <button className="btn btn-primary" onClick={() => updateStatus.mutate({ id: e._id, status: 'BUSY' })}>Make Busy</button>}
                  </>
                )}
              </div>
            </li>
          </div>
        ))}
      </div>
    </div>
  )
}


