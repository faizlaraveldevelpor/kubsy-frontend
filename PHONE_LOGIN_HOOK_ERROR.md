# "Failed to reach hook after maximum retries" – Fix (VPS)

Yeh error **phone OTP login** ke time aata hai jab aapke **self-hosted Supabase (GoTrue)** pe koi **Auth Hook** configured hai aur woh hook **reachable nahi** ya **timeout** ho raha hai.

## Kya hota hai

- User number daal ke OTP request karta hai (ya OTP verify karta hai).
- GoTrue apne config ke hisaab se ek **hook URL** call karta hai (e.g. Send SMS hook).
- Agar woh URL:
  - galat hai, ya
  - server down hai, ya
  - firewall/network se Supabase us URL tak nahi pahunch pa raha, ya
  - response 200 nahi / der se aa raha hai (timeout),

to GoTrue retry karta hai aur last mein error de deta hai: **"failed to reach hook after maximum retries"**.

## Fix (VPS / Supabase config)

### 1. Hook config check karo

VPS pe GoTrue (Auth) ke env / config mein in jaise variables honge:

- `GOTRUE_HOOK_SEND_SMS_ENABLED` – agar `true` hai to Send SMS hook use ho raha hai.
- `GOTRUE_HOOK_SEND_SMS_URI` – jis URL pe GoTrue SMS hook call karta hai.

**Option A – Hook use nahi karna (direct Twilio / SMS):**  
Agar aap SMS kisi aur tarah bhejate ho (e.g. direct Twilio) aur custom hook nahi chahiye to:

- `GOTRUE_HOOK_SEND_SMS_ENABLED` ko **false** karo (ya hata do).
- Restart GoTrue / Supabase stack.

Phir GoTrue apna default / built‑in SMS flow use karega, hook call nahi hoga.

**Option B – Hook use karna hai:**  
To yeh karo:

- `GOTRUE_HOOK_SEND_SMS_URI` **sahi** URL ho (woh server jahan hook deployed hai).
- Woh URL **Supabase server se** reachable ho (same network / public URL, firewall allow).
- Hook endpoint **200** return kare aur time pe respond kare (timeout se pehle).
- Agar need ho to hook timeout / retries bhi increase kar sakte ho (Supabase/GoTrue docs ke hisaab se).

### 2. Restart

Config change ke baad **GoTrue / Auth service** (ya pura Supabase stack) restart karo.

---

**Short:** Error = GoTrue ka Auth Hook (e.g. Send SMS) call fail ho raha hai. Ya to hook URL theek karo aur endpoint up/200 karo, ya hook disable karo (e.g. `GOTRUE_HOOK_SEND_SMS_ENABLED=false`).
