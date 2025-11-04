import { useState } from 'react'

export default function EventForm({ onSubmit, defaultValues }) {
  const [title, setTitle] = useState(defaultValues?.title || '')
  const [startTime, setStartTime] = useState(defaultValues?.startTime || '')
  const [endTime, setEndTime] = useState(defaultValues?.endTime || '')

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit({ title, startTime, endTime }) }} className="grid" style={{ gridTemplateColumns: '2fr 1.5fr 1.5fr auto' }}>
      <input placeholder="Event title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
      <input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
      <button type="submit" className="btn btn-primary">Save</button>
    </form>
  )
}


