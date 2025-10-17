import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { supabase } from '../lib/supabaseClient'

export default function Home() {
  const [candidates, setCandidates] = useState([])
  const [scanning, setScanning] = useState(false)
  const [message, setMessage] = useState('Scan NISN barcode untuk memilih')

  useEffect(() => { fetchCandidates() }, [])

  async function fetchCandidates() {
    const { data, error } = await supabase.from('candidates').select('*').order('id')
    if (!error) setCandidates(data)
  }

  async function onScanSuccess(nisn) {
    setMessage('Memeriksa data...')
    const { data: peserta } = await supabase.from('participants').select('*').eq('nisn', nisn).limit(1)
    if (!peserta || peserta.length === 0) {
      setMessage('❌ NISN tidak terdaftar.')
      return
    }

    const { data: existing } = await supabase.from('votes').select('*').eq('participant_nisn', nisn)
    if (existing && existing.length > 0) {
      setMessage('⚠️ Kamu sudah pernah memilih.')
      return
    }

    const pilihan = prompt('Masukkan ID kandidat yang kamu pilih (1, 2, atau 3):')
    if (!pilihan) return setMessage('Dibatalkan.')

    const { error } = await supabase.from('votes').insert([{ participant_nisn: nisn, candidate_id: parseInt(pilihan) }])
    if (error) setMessage('Gagal menyimpan suara.')
    else setMessage('✅ Terima kasih! Suara kamu sudah terekam.')
  }

  async function startScanner() {
    setScanning(true)
    const Html5Qrcode = (await import('html5-qrcode')).Html5Qrcode
    const html5QrCode = new Html5Qrcode("reader")
    html5QrCode.start({ facingMode: "environment" }, { fps: 10, qrbox: { width: 250, height: 100 } },
      (decodedText) => {
        html5QrCode.stop()
        setScanning(false)
        onScanSuccess(decodedText)
      },
      (errorMsg) => { }
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-4xl w-full card grid md:grid-cols-2 gap-6 items-start">
        <div>
          <h1 className="text-3xl font-extrabold text-indigo-700">Pemilihan Ketua OSIS 2025</h1>
          <p className="mt-2 text-sm opacity-80">Scan barcode NISN lalu pilih kandidat. Peserta hanya boleh memilih sekali.</p>

          <div className="mt-6">
            <div id="reader" className="w-full" />
            <button
              className="mt-3 px-4 py-2 rounded-full border border-indigo-600 text-indigo-600 hover:bg-indigo-50"
              onClick={startScanner}
              disabled={scanning}
            >
              {scanning ? '🔍 Memindai...' : 'Mulai Scan (Barcode NISN)'}
            </button>
          </div>

          <p className="mt-4 text-indigo-600 font-semibold">{message}</p>
        </div>

        <div>
          <h2 className="font-bold text-lg">Kandidat</h2>
          <div className="mt-4 space-y-4">
            {candidates.map(c => (
              <div key={c.id} className="p-4 rounded-xl border hover:shadow-md transition">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-indigo-700">{c.name}</h3>
                    <p className="text-sm opacity-70">{c.major}</p>
                    <p className="text-sm mt-2"><strong>Misi:</strong> {c.mission}</p>
                    <p className="text-sm"><strong>Visi:</strong> {c.vision}</p>
                  </div>
                  <div className="text-2xl font-bold text-indigo-400">#{c.id}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
    }
