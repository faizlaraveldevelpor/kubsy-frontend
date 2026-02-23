import { supabase } from "@/lib/supabase";

export async function savePushToken(userId: string, token: string) {
  const { error } = await supabase
    .from("profiles")
    .update({ expo_push_token: token })
    .eq("id", userId);

  if (error) {
    console.error("Token save error:", error);
  }
}

export async function clearPushToken(userId: string) {
  const { error } = await supabase
    .from("profiles")
    .update({ expo_push_token: null })
    .eq("id", userId);

  if (error) {
    console.error("Token clear error:", error);
  }
}
