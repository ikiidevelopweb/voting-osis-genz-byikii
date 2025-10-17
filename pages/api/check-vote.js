import { supabase } from '../../lib/supabaseClient'

export default async function handler(req, res) {
  const { nisn } = req.query
  const { data } = await supabase.from('votes').select('*').eq('participant_nisn', nisn)
  res.json({ voted: data && data.length > 0 })
}
