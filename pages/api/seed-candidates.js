import { supabase } from '../../lib/supabaseClient'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const candidates = req.body.candidates || [
    { name: 'Alya Putri', major: 'IPA 11', mission: 'Meningkatkan kegiatan ekstrakurikuler', vision: 'Sekolah berprestasi dan aktif' },
    { name: 'Rian Saputra', major: 'IPS 12', mission: 'Mendorong semangat belajar', vision: 'Siswa unggul dan berprestasi' },
    { name: 'Siti Aminah', major: 'Bahasa 10', mission: 'Kegiatan sosial dan peduli lingkungan', vision: 'Sekolah hijau dan bersahabat' }
  ]

  const { data, error } = await supabase.from('candidates').upsert(candidates, { onConflict: ['name'] })
  if (error) return res.status(500).json({ error: error.message })
  res.json({ data })
}
