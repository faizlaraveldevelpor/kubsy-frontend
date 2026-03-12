import { supabase } from "@/lib/supabase";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";

/** Server allow list mein yeh hona chahiye: kubsy://auth-callback */
const DEFAULT_REDIRECT_TO = "kubsy://auth-callback";

/**
 * Redirect URI for OAuth. Explicit kubsy://auth-callback use karo taake app par hi redirect ho.
 */
function getRedirectUri(): string {
  const fromEnv =
    typeof process !== "undefined" && process.env?.EXPO_PUBLIC_AUTH_REDIRECT_URL;
  if (fromEnv && typeof fromEnv === "string" && fromEnv.trim()) {
    return fromEnv.trim();
  }
  return DEFAULT_REDIRECT_TO;
}

/** Parse access_token and refresh_token from OAuth redirect URL (hash or query). GoTrue: kubsy://auth-callback#access_token=...&refresh_token=... */
function getSessionParamsFromUrl(url: string): { access_token?: string; refresh_token?: string; error?: string } {
  const hash = url.includes("#") ? url.split("#")[1] : "";
  const query = url.includes("?") ? url.split("?")[1].split("#")[0] : "";
  const combined = hash || query;
  const params = new URLSearchParams(combined);
  let access_token = params.get("access_token") ?? undefined;
  let refresh_token = params.get("refresh_token") ?? undefined;
  const error = params.get("error") ?? undefined;
  // Fallback: kuch devices par hash alag format mein aata hai – # ko ? se replace karke try karo
  if (!access_token && url.includes("#")) {
    try {
      const asQuery = url.replace("#", "?");
      const p = new URL(asQuery).searchParams;
      access_token = p.get("access_token") ?? undefined;
      refresh_token = refresh_token ?? (p.get("refresh_token") ?? undefined);
    } catch (_) {}
  }
  return { access_token, refresh_token, error };
}

/**
 * Deep link se session set karo (jab browser kubsy://auth-callback#access_token=... open kare).
 * _layout mein Linking.getInitialURL() / addEventListener('url') se call karo.
 */
export async function setSessionFromUrl(url: string): Promise<{ ok: boolean; error?: string }> {
  if (!url || !url.includes("auth-callback")) return { ok: false, error: "Not an auth callback URL" };
  const { access_token, refresh_token, error } = getSessionParamsFromUrl(url);
  if (error) return { ok: false, error };
  if (!access_token) return { ok: false, error: "No session in URL" };
  const { error: sessionError } = await supabase.auth.setSession({
    access_token,
    refresh_token: refresh_token ?? "",
  });
  if (sessionError) return { ok: false, error: sessionError.message };
  return { ok: true };
}

export async function signUpEmail(email: string, password: string) {
  return supabase.auth.signUp({ email, password });
}

export async function signInEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

/** @deprecated Use signInWithOAuthGoogle or signInWithOAuthApple for mobile. */
export async function signInOAuth(provider: "google" | "facebook") {
  return supabase.auth.signInWithOAuth({ provider });
}

/**
 * Sign in with Google or Apple via Supabase OAuth.
 * Opens browser, then sets session from redirect URL.
 */
export async function signInWithOAuthProvider(provider: "google" | "apple"): Promise<{ error?: string }> {
  const redirectTo = getRedirectUri();
  if (__DEV__) {
    console.log("[Auth] OAuth redirectTo (add this URL to Supabase allow list):", redirectTo);
  }

  const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (oauthError) {
    const msg = oauthError.message || "OAuth failed";
    const status = (oauthError as any)?.status;
    let hint = "";
    if (status === 400) {
      hint =
        " Redirect URL (kubsy://auth-callback) must be in Supabase allow list. Or check Google OAuth client has redirect: https://supabase.kubsy.app/auth/v1/callback";
    } else if (status === 403 || msg.toLowerCase().includes("disabled")) {
      hint = " Google sign-in may be disabled on server. Check Supabase Auth (GoTrue) Google config.";
    }
    if (__DEV__) {
      console.warn("[Auth] signInWithOAuth error:", status, oauthError);
    }
    return { error: msg + (hint ? " " + hint : "") };
  }
  if (!data?.url) return { error: "No auth URL returned" };

  const res = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  if (res.type !== "success" || !res.url) {
    if (res.type === "cancel") return { error: undefined };
    if (res.type === "dismiss") {
      // Android par redirect se app open hoti hai, browser dismiss – session deep link se set hoti hai.
      // Pehle URL check karo (resume par kabhi getInitialURL mil jata hai), phir session set karo, warna wait karke _layout listener pe bharosa.
      const url = await Linking.getInitialURL();
      if (url && url.includes("auth-callback")) {
        const setResult = await setSessionFromUrl(url);
        if (setResult.ok) return {};
      }
      await new Promise((r) => setTimeout(r, 1500));
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) return {};
      return { error: "Sign in closed. If you completed Google login, the app may not have received the redirect. Try again." };
    }
    return { error: "Sign in was cancelled or redirect failed." };
  }

  const { access_token, refresh_token, error } = getSessionParamsFromUrl(res.url);
  if (error) return { error };
  if (!access_token) return { error: "No session returned" };

  const { error: sessionError } = await supabase.auth.setSession({
    access_token,
    refresh_token: refresh_token ?? "",
  });

  if (sessionError) return { error: sessionError.message };
  return {};
}

export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}


