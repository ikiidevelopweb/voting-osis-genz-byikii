import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import jsPDF from 'jspdf'
import Papa from 'papaparse'

export default function Admin() {
  const [logged, setLogged] = useState(false)
  const [password, setPassword] = useState('')
  const [results, setResults] = useState([])

  async function login() {
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD || password === process.env.ADMIN_PASSWORD) {
      setLogged(true)
      fetchResults()
    } else {
      alert('Password salah!')
    }
  }

  async function fetchResults() {
    const { data } = await supabase.from('votes_view').select('*')
    if (data) setResults(data)
  }

  function downloadPDF() {
    const doc = new jsPDF()
    doc.text('Hasil Suara Pemilihan Ketua OSIS', 14, 20)
    let y = 35
    results.forEach(r => {
      doc.text(`${r.name} - ${r.count} suara`, 14, y)
      y += 10
    })
    doc.save('hasil_suara.pdf')
  }

  function handleUpload(e) {
    const file = e.target.files[0]
    Papa.parse(file, {
      header: true,
      complete: async (res) => {
        const rows = res.data.map(r => ({
          nisn: r.nisn?.toString(),
          name: r.name,
          class: r.class
        }))
        const { error } = await supabase.from('participants').upsert(rows)
        if (error) alert('Gagal upload!')
        else alert('Data peserta berhasil diupload!')
      }
    })
  }

  return (
    <main className="min-h-screen flex justify-center items-center p-6">
      {!logged ? (
        <div className="card w-full max-w-md">
          <h2 className="text-2xl font-bold text-indigo-700 mb-3">Login Admin</h2>
          <input
            className="border w-full p-2 rounded"
            type="password"
            placeholder="Masukkan password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            onClick={login}
            className="mt-3 px-4 py-2 w-full bg-indigo-600 text-white rounded-full hover:bg-indigo-700"
          >
            Login
          </button>
        </div>
      ) : (
        <div className="card w-full max-w-3xl">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-lg text-indigo-700">Panel Admin</h2>
            <div>
              <button onClick={fetchResults} className="px-3 py-1 border rounded mr-2">Refresh</button>
              <button onClick={downloadPDF} className="px-3 py-1 border rounded">Download PDF</button>
            </div>
          </div>

          <div className="mt-4">
            <label className="block font-medium">Upload Data Peserta (.csv)</label>
            <input type="file" accept=".csv" onChange={handleUpload} />
          </div>

          <h3 className="mt-6 font-semibold">Hasil Suara</h3>
          <ul className="mt-3 space-y-2">
            {results.map(r => (
              <li key={r.candidate_id} className="p-3 border rounded flex justify-between">
                <span>{r.name}</span>
                <strong>{r.count} suara</strong>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  )
}
