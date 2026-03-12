# Google login – load ho kar ruk jana (fix)

**Problem:** Google account select hone ke baad screen load hoti rehti hai, aage nahi jati.

**Reason:** OAuth ke baad redirect `kubsy://auth-callback` par to hota hai, lekin app us URL ko **receive karke session set nahi kar rahi**. Browser/in-app browser redirect ke baad app ko URL nahi de raha ya app us URL se session create nahi kar rahi.

**Fix:** Neeche wala flow use karo – `skipBrowserRedirect: true` + `WebBrowser.openAuthSessionAsync` + redirect URL se session banana.

---

## 1. Google sign-in – sahi flow (app mein already hai)

Yeh flow **`services/Auth.ts`** mein `signInWithOAuthProvider('google')` ke andar use ho raha hai:

- `redirectTo: 'kubsy://auth-callback'`
- `skipBrowserRedirect: true`
- `WebBrowser.openAuthSessionAsync(data.url, redirectTo)` se browser open
- Result URL se hash parse karke `supabase.auth.setSession({ access_token, refresh_token })`

Start screen se **Google** button `signInWithOAuthProvider('google')` call karta hai.

---

## 2. Hash fragment se tokens (deep link URL format)

GoTrue redirect karta hai: `kubsy://auth-callback#access_token=...&refresh_token=...&...`

App mein **`getSessionParamsFromUrl`** (Auth.ts) hash + query dono handle karta hai:

```ts
const hash = url.includes("#") ? url.split("#")[1] : "";
const query = url.includes("?") ? url.split("?")[1].split("#")[0] : "";
const combined = hash || query;
const params = new URLSearchParams(combined);
// access_token, refresh_token
```

---

## 3. Deep link (app band/background se open)

- **`_layout.tsx`** mein `Linking.getInitialURL()` se cold start par auth-callback URL handle hota hai.
- `Linking.addEventListener('url')` se jab app already open ho aur redirect aaye, tab bhi `setSessionFromUrl(url)` call hota hai aur phir navigate.

---

## 4. Server side (VPS)

- `ADDITIONAL_REDIRECT_URLS` / `URI_ALLOW_LIST` mein **`kubsy://auth-callback`** add karo.
- `APP_URL=kubsy://auth-callback` (optional).
- Config change ke baad Auth / GoTrue restart karo.

---

**Summary:** App side pe `skipBrowserRedirect: true` + `WebBrowser.openAuthSessionAsync` + URL se `setSession` already implement hai. Agar ab bhi load ho kar ruk jaye to device pe **notification permission** / **default browser** check karo, aur server allow list mein `kubsy://auth-callback` confirm karo.
