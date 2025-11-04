import { useMemo } from 'react'

function toKey(date) {
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const yyyy = date.getFullYear()
  return `${yyyy}-${mm}-${dd}`
}

export default function Calendar({ value, onChange }) {
  const current = useMemo(() => {
    const [y, m, d] = (value || new Date().toISOString().slice(0, 10)).split('-').map(Number)
    return new Date(y, m - 1, d)
  }, [value])

  const monthModel = useMemo(() => {
    const first = new Date(current.getFullYear(), current.getMonth(), 1)
    const start = new Date(first)
    start.setDate(first.getDate() - ((first.getDay() + 6) % 7)) // Monday start
    const weeks = []
    let day = new Date(start)
    for (let w = 0; w < 6; w++) {
      const days = []
      for (let i = 0; i < 7; i++) {
        days.push(new Date(day))
        day.setDate(day.getDate() + 1)
      }
      weeks.push(days)
    }
    return { first, weeks }
  }, [current])

  function gotoMonth(delta) {
    const d = new Date(current)
    d.setMonth(d.getMonth() + delta)
    const key = toKey(d)
    onChange && onChange(key)
  }

  function selectDay(d) {
    const key = toKey(d)
    onChange && onChange(key)
  }

  const header = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(monthModel.first)
  const selectedKey = value
  const thisMonth = monthModel.first.getMonth()

  return (
    <div className="calendar card">
      <div className="calendar-head">
        <button className="btn btn-outline" onClick={() => gotoMonth(-1)} aria-label="Previous Month">‹</button>
        <div className="calendar-title">{header}</div>
        <button className="btn btn-outline" onClick={() => gotoMonth(1)} aria-label="Next Month">›</button>
      </div>
      <div className="calendar-grid">
        {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d) => (
          <div key={d} className="calendar-wd muted">{d}</div>
        ))}
        {monthModel.weeks.flat().map((d) => {
          const key = toKey(d)
          const isOther = d.getMonth() !== thisMonth
          const isSelected = key === selectedKey
          return (
            <button key={key} className={`calendar-day${isOther ? ' other' : ''}${isSelected ? ' selected' : ''}`} onClick={() => selectDay(d)}>
              {d.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}


