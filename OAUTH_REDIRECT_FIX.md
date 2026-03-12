# Fix 400 Bad Request on Google/Apple Login (Self-Hosted Supabase)

The 400 error usually means your **redirect URL is not allowed** by your self-hosted Supabase (GoTrue).

## 1. See the exact redirect URL your app uses

Run the app and try Google or Apple login. In the terminal (Metro) you’ll see:

```text
[Auth] OAuth redirectTo (add this URL to Supabase allow list): <URL>
```

Or set a **fixed** redirect in `.env` (see step 3) and use that same URL in Supabase.

## 2. Allow that URL on self-hosted Supabase

Add the **exact** redirect URL to GoTrue’s allow list.

### Option A – config (Docker / self-hosted)

In your Supabase auth config (e.g. `config.toml` or GoTrue env):

- **`URI_ALLOW_LIST`** (comma-separated):

  ```bash
  URI_ALLOW_LIST=https://your-site.com,kubsy://auth-callback
  ```

  Or in `config.toml` under `[auth]`:

  ```toml
  [auth]
  site_url = "https://your-site.com"
  additional_redirect_urls = ["kubsy://auth-callback"]
  ```

  (Exact key may be `additional_redirect_urls` or similar in your Supabase version – check your self-hosted docs.)

### Option B – Dashboard (if your self-hosted has it)

- Go to **Authentication → URL configuration** (or similar).
- Add the redirect URL to **Redirect URLs** (e.g. `kubsy://auth-callback`).

## 3. (Optional) Use a fixed redirect URL in the app

So the app always uses one URL (easier to allow-list):

1. In the project root create or edit `.env`:

   ```env
   EXPO_PUBLIC_AUTH_REDIRECT_URL=kubsy://auth-callback
   ```

2. Restart the app (`npx expo start --clear`).
3. Add **exactly** `kubsy://auth-callback` to Supabase’s redirect allow list (step 2).

## 4. Restart GoTrue

After changing redirect config, restart the Auth service (e.g. restart Supabase stack or the GoTrue container).

---

**Summary:** 400 = redirect URL not allowed. Add the URL you see in the log (or `kubsy://auth-callback` if you set the env) to your self-hosted Supabase redirect allow list and restart Auth.
