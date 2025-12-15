import React, { useEffect, useState } from 'react'
import './App.css'

function formatWithCommas(value) {
  return value
    .replace(/\D/g, '')
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

function formatNumberOutput(num) {
  const fixed = Number(num).toFixed(2)
  return fixed.replace(/\B(?=(\d{3})+\b)/g, ',')
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch() {}
  render() {
    if (this.state.hasError) {
      return <div>Bir hata oluştu. Sayfayı yenileyin.</div>
    }
    return this.props.children
  }
}

function App() {
  const [number, setNumber] = useState('')
  const [percentage, setPercentage] = useState('')
  const [days, setDays] = useState('')
  const [result, setResult] = useState('')

  const [calcInput, setCalcInput] = useState('')
  const [history, setHistory] = useState([])
  const [dbConfigured, setDbConfigured] = useState(false)
  const [dbAlive, setDbAlive] = useState(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((h) => {
        setDbConfigured(Boolean(h.dbConfigured))
        if (h.dbConfigured) {
          return fetch(`/api/calculations?limit=${pageSize}&page=1`)
            .then((r2) => r2.json())
            .then((resp) => {
              setHistory(resp.rows || [])
              setTotal(resp.total || 0)
              setPage(resp.page || 1)
              setPageSize(resp.limit || 50)
            })
        }
      })
      .catch(() => {})
    fetch('/api/db-check')
      .then((r) => r.json())
      .then((d) => setDbAlive(Boolean(d.ok)))
      .catch(() => setDbAlive(false))
  }, [])

  const handleCalcAppend = (val) => {
    setCalcInput((prev) => prev + val)
  }

  const handleCalcClearOne = () => {
    setCalcInput((prev) => prev.slice(0, -1))
  }

  const handleCalcEquals = () => {
    try {
      const evaluated = eval(calcInput)
      setCalcInput(String(evaluated))
    } catch {
      setCalcInput('Hata')
    }
  }

  const calculateCompound = () => {
    const num = parseFloat(number.replace(/,/g, ''))
    const pct = parseFloat(percentage.replace(/,/g, ''))
    const d = parseFloat(days.replace(/,/g, ''))

    if (isNaN(num) || isNaN(pct) || isNaN(d)) {
      alert('Lütfen geçerli sayısal değerler girin.')
      return
    }

    let r = num
    for (let i = 0; i < d; i++) {
      r += r * (pct / 100)
    }
    setResult(formatNumberOutput(r))

    if (dbConfigured) {
      fetch('/api/calculations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number: num, percentage: pct, days: Math.trunc(d) }),
      })
        .then(() => fetch(`/api/calculations?limit=${pageSize}&page=${page}`))
        .then((r2) => r2.json())
        .then((resp) => {
          setHistory(resp.rows || [])
          setTotal(resp.total || 0)
        })
        .catch(() => {})
    }
  }

  function formatDateParts(value) {
    const dt = new Date(value)
    if (isNaN(dt.getTime())) return { date: '-', time: '-' }
    return {
      date: dt.toLocaleDateString('tr-TR'),
      time: dt.toLocaleTimeString('tr-TR'),
    }
  }

  const handleDelete = (id) => {
    if (!id) return
    fetch(`/api/calculations/${id}`, { method: 'DELETE' })
      .then(() => fetch(`/api/calculations?limit=${pageSize}&page=${page}`))
      .then((r) => r.json())
      .then((resp) => {
        setHistory(resp.rows || [])
        setTotal(resp.total || 0)
      })
      .catch(() => {})
  }

  const fetchPage = (p = page, l = pageSize) => {
    fetch(`/api/calculations?limit=${l}&page=${p}`)
      .then((r) => r.json())
      .then((resp) => {
        setHistory(resp.rows || [])
        setTotal(resp.total || 0)
        setPage(resp.page || p)
        setPageSize(resp.limit || l)
      })
      .catch(() => {})
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const handlePrev = () => {
    if (page > 1) fetchPage(page - 1, pageSize)
  }
  const handleNext = () => {
    if (page < totalPages) fetchPage(page + 1, pageSize)
  }
  const handlePageSizeChange = (e) => {
    const val = Number(e.target.value)
    setPageSize(val)
    setPage(1)
    fetchPage(1, val)
  }

  

  return (
    <div className="container">
      <ErrorBoundary>
      <h1>Hesaplama Aracı</h1>

      <div id="calculator">
        <label htmlFor="number">Rakam:</label>
        <input
          type="text"
          id="number"
          value={number}
          onChange={(e) => setNumber(formatWithCommas(e.target.value))}
          pattern="[0-9]*"
          required
        />

        <label htmlFor="percentage">Yüzde:</label>
        <input
          type="text"
          id="percentage"
          value={percentage}
          onChange={(e) => setPercentage(formatWithCommas(e.target.value))}
          pattern="[0-9]*"
          required
        />

        <label htmlFor="days">Gün:</label>
        <input
          type="text"
          id="days"
          value={days}
          onChange={(e) => setDays(formatWithCommas(e.target.value))}
          pattern="[0-9]*"
          required
        />

        <button type="button" onClick={calculateCompound}>
          Hesapla
        </button>

        <h2 id="result">Sonuç: {result}</h2>
      </div>

      <div id="history">
        <h2>Geçmiş Hesaplamalar</h2>
        <table className="history-table">
          <thead>
            <tr>
              <th className="col-number">Rakam</th>
              <th className="col-pctdays">Yüzde/Gün</th>
              <th className="col-result">Sonuç</th>
              <th className="col-datetime">İşlem Tarihi</th>
              <th className="col-actions">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {history.map((row, i) => (
              <tr key={row.id || i}>
                <td className="col-number">{formatNumberOutput(row.number)}</td>
                <td className="col-pctdays">
                  <div>Yüzde: {formatNumberOutput(row.percentage)}</div>
                  <div>Gün: {row.days}</div>
                </td>
                <td className="col-result">{row.result != null ? formatNumberOutput(row.result) : '-'}</td>
                <td className="col-datetime">
                  {(() => {
                    const p = formatDateParts(row.created_at)
                    return (
                      <div>
                        <div>{p.date}</div>
                        <div>{p.time}</div>
                      </div>
                    )
                  })()}
                </td>
                <td className="col-actions">
                  <button className="btn-delete" onClick={() => handleDelete(row.id)}>Sil</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pagination">
          <button onClick={handlePrev} disabled={page <= 1}>Önceki</button>
          <span>Sayfa {page} / {totalPages}</span>
          <button onClick={handleNext} disabled={page >= totalPages}>Sonraki</button>
          <select value={pageSize} onChange={handlePageSizeChange}>
            {[50,100,150,200,250].map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        <div className="db-status">DB Bağlantı: {dbAlive === null ? 'Kontrol ediliyor...' : dbAlive ? 'Aktif' : 'Pasif'}</div>
        {!dbConfigured && <p>Veritabanı yapılandırılmadı.</p>}
      </div>

      <div id="calculator2">
        <input type="text" id="calcInput" value={calcInput} readOnly />
        <div id="calcButtons">
          <button onClick={() => handleCalcAppend('7')}>7</button>
          <button onClick={() => handleCalcAppend('8')}>8</button>
          <button onClick={() => handleCalcAppend('9')}>9</button>
          <button onClick={() => handleCalcAppend('/')}>/</button>
          <button onClick={() => handleCalcAppend('4')}>4</button>
          <button onClick={() => handleCalcAppend('5')}>5</button>
          <button onClick={() => handleCalcAppend('6')}>6</button>
          <button onClick={() => handleCalcAppend('*')}>*</button>
          <button onClick={() => handleCalcAppend('1')}>1</button>
          <button onClick={() => handleCalcAppend('2')}>2</button>
          <button onClick={() => handleCalcAppend('3')}>3</button>
          <button onClick={() => handleCalcAppend('-')}>-</button>
          <button onClick={() => handleCalcAppend('0')}>0</button>
          <button onClick={() => handleCalcAppend('.')}>.</button>
          <button onClick={handleCalcEquals}>=</button>
          <button onClick={() => handleCalcAppend('+')}>+</button>
        </div>
        <button id="clearOne" onClick={handleCalcClearOne}>Sil</button>
      </div>
      </ErrorBoundary>
    </div>
  )
}

export default App
