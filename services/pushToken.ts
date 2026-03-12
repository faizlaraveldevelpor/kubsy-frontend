const API_BASE = "https://vps.kubsy.app/api/v1";

/**
 * Push token save: pehle Supabase (session), fail pe backend API.
 * Supabase ke liye: RLS policy chalao (PUSH_NOTIFICATION_TEST.md dekho).
 * Backend ke liye: .env mein SUPABASE_SERVICE_ROLE_KEY.
 */
export async function savePushToken(userId: string, token: string) {
  if (!userId || !token?.trim()) {
    console.warn("[Push] savePushToken: userId ya token empty");
    return { ok: false, error: "Missing userId or token" };
  }

  const trimmedToken = token.trim();
  if (__DEV__) console.log('[Push] Save try: pehle Supabase, phir backend');

  // 1) Pehle Supabase se save (session se; RLS allow kare to kaam karega)
  const supabaseOk = await savePushTokenViaSupabase(userId, trimmedToken);
  if (supabaseOk) return { ok: true };

  // 2) Supabase fail to backend API try karo
  if (__DEV__) console.log('[Push] Supabase save nahi hua, ab backend try');
  try {
    const res = await fetch(`${API_BASE}/profiles/push-token`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: userId,
      },
      body: JSON.stringify({ expo_push_token: trimmedToken }),
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok) return { ok: true };

    const errMsg = (data?.error && typeof data.error === "string" ? data.error : "") || (res.status === 500 ? "Backend: add SUPABASE_SERVICE_ROLE_KEY in .env" : "Failed");
    console.warn("[Push] Backend save failed:", res.status, errMsg);
    return { ok: false, error: errMsg };
  } catch (err: any) {
    console.warn("[Push] Backend request error:", err?.message || err);
    return { ok: false, error: err?.message || "Network error" };
  }
}

/** Supabase client se apni profile ka expo_push_token update (RLS: auth.uid() = id allow hona chahiye) */
async function savePushTokenViaSupabase(userId: string, token: string): Promise<boolean> {
  try {
    const { supabase } = await import("@/lib/supabase");
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      if (__DEV__) console.warn("[Push] Supabase: no session – login first");
      return false;
    }
    const { data, error } = await supabase
      .from("profiles")
      .update({ expo_push_token: token })
      .eq("id", userId)
      .select("id")
      .maybeSingle();
    if (error) {
      console.warn("[Push] Supabase save error:", error.code, error.message, "- RLS policy chalao (PUSH_NOTIFICATION_TEST.md)");
      return false;
    }
    if (!data) {
      console.warn("[Push] Supabase: no row updated – profiles.id match karo ya RLS policy add karo");
      return false;
    }
    if (__DEV__) console.log("[Push] Token saved via Supabase");
    return true;
  } catch (e: any) {
    console.warn("[Push] Supabase save exception:", e?.message || e);
    return false;
  }
}

export async function clearPushToken(userId: string) {
  if (!userId) return;
  try {
    await fetch(`${API_BASE}/profiles/push-token`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: userId,
      },
      body: JSON.stringify({ expo_push_token: null }),
    });
  } catch (err: any) {
    console.error("[Push] Token clear error:", err?.message || err);
  }
}
