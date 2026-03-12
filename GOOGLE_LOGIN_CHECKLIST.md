# Google login phir se check karo (when "Google login phir work nahi kar raha")

## 1. Supabase server (self-hosted: supabase.kubsy.app)

- **Redirect allow list** mein ye **exact** URL hona chahiye: `kubsy://auth-callback`
  - Config: `supabase/supabase/config.toml` → `[auth]` → `additional_redirect_urls`
  - Docker env: `ADDITIONAL_REDIRECT_URLS` mein `kubsy://auth-callback` hona chahiye
- **Google OAuth** enabled hona chahiye:
  - Docker `.env`: `GOTRUE_EXTERNAL_GOOGLE_CLIENT_ID` aur `GOTRUE_EXTERNAL_GOOGLE_SECRET` set hon
  - Config: `[auth.external.google]` → `enabled = true`
- Server restart ke baad env load hua ho (docker compose down/up ya restart).

## 2. Google Cloud Console

- **APIs & Services** → **Credentials** → jo OAuth 2.0 Client ID app use karti hai (Web application).
- **Authorized redirect URIs** mein **ye exact** add ho:
  - `https://supabase.kubsy.app/auth/v1/callback`
- OAuth consent screen: Testing ya Published; agar Testing hai to test users add ho.

## 3. App side

- `app.json` → `"scheme": "kubsy"` (deep link kubsy://... ke liye).
- Auth.ts redirect use karta hai: `kubsy://auth-callback`.
- Koi bhi error ab alert mein zyada clear dikhega; agar "redirect failed" aaye to server + Google Console dono check karo.

## Quick test

1. Google login tap karo.
2. Browser open ho, Google account choose karo.
3. Redirect hoke app wapas aani chahiye; agar browser hi reh jaye ya "redirect failed" aaye to:
   - Supabase `additional_redirect_urls` / `ADDITIONAL_REDIRECT_URLS` check karo.
   - Google Console → Credentials → redirect URI `https://supabase.kubsy.app/auth/v1/callback` check karo.
