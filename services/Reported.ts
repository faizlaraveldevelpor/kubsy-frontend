// services/Profile.ts (ya koi bhi relevant file)

import { supabase } from "@/lib/supabase";

export const submitReport = async (reporter_id: string, reported_id: string, description: string) => {
  try {
    const { data, error } = await supabase
      .from('reports')
      .insert([
        { 
          reporter_id: reporter_id, 
          reported_id: reported_id, 
          description: description 
        },
      ])
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('Report Error:', error.message);
    return { success: false, error: error.message };
  }
};