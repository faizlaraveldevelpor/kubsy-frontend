import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "./Auth";

export async function getNearbyUsers(maxDistanceKm: number) {
  const user = await getCurrentUser();
  const { data } = await supabase.rpc('get_nearby_users', {
    current_user_id: user?.id,
    max_distance_km: maxDistanceKm,
  });
  return data;
}
