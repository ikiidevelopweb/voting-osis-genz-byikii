import { supabase } from '../../lib/supabaseClient'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { nisn, candidate_id } = req.body

  const { data: existing } = await supabase.from('votes').select('*').eq('participant_nisn', nisn)
  if (existing && existing.length > 0)
    return res.status(400).json({ error: 'Sudah memilih sebelumnya' })

  const { error } = await supabase.from('votes').insert([{ participant_nisn: nisn, candidate_id }])
  if (error) return res.status(500).json({ error: error.message })

  res.json({ success: true })
}
