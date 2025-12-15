import { useEffect, useState } from 'react'
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

function App() {
  const [number, setNumber] = useState('')
  const [percentage, setPercentage] = useState('')
  const [days, setDays] = useState('')
  const [result, setResult] = useState('')

  const [calcInput, setCalcInput] = useState('')
  const [history, setHistory] = useState([])
  const [dbConfigured, setDbConfigured] = useState(false)

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((h) => {
        setDbConfigured(Boolean(h.dbConfigured))
        if (h.dbConfigured) {
          return fetch('/api/calculations').then((r2) => r2.json()).then(setHistory)
        }
      })
      .catch(() => {})
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
    } catch (_) {
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
        .then(() => fetch('/api/calculations'))
        .then((r2) => r2.json())
        .then((rows) => setHistory(rows))
        .catch(() => {})
    }
  }

  return (
    <div className="container">
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

      <div id="history">
        <h2>Geçmiş Hesaplamalar</h2>
        <table className="history-table">
          <thead>
            <tr>
              <th>Rakam</th>
              <th>Yüzde</th>
              <th>Gün</th>
              <th>İşlem Tarihi</th>
            </tr>
          </thead>
          <tbody>
            {history.map((row, i) => (
              <tr key={i}>
                <td>{formatNumberOutput(row.number)}</td>
                <td>{formatNumberOutput(row.percentage)}</td>
                <td>{row.days}</td>
                <td>{new Date(row.created_at).toLocaleString('tr-TR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!dbConfigured && <p>Veritabanı yapılandırılmadı.</p>}
      </div>
    </div>
  )
}

export default App
