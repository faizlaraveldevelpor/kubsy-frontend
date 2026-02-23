import { supabase } from "@/lib/supabase";
export async function getIcebreakers() {
  const { data, error } = await supabase
    .from('icebreakers') // Aapke table ka naam
    .select('*')        // Saara data chahiye toh '*'

  if (error) {
    console.error('Error fetching data:', error)
    return null
  }

  return data
}