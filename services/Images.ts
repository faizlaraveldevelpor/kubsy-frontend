import { supabase } from "@/lib/supabase";

export async function addUserImage(url: string) {
  const user = (await supabase.auth.getUser()).data.user;

  return supabase.from('user_images').insert({
    user_id: user?.id,
    image_url: url,
  });
}


export async function getMyImages() {
  const user = (await supabase.auth.getUser()).data.user;

  return supabase
    .from('user_images')
    .select('*')
    .eq('user_id', user?.id)
    .order('created_at');
}
