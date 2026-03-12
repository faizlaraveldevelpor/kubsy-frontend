# Push Notification Test Kaise Karein

## ✅ App kaise kholein (Expo Go na chale to)

Is project mein **expo-dev-client** hai, isliye kabhi **Expo Go** se app nahi khulti. Neeche wala tareeqa use karein.

### Option A: Local run (recommended — EAS build nahi chahiye)

1. **Folder** sahi ho: `dattingfrontend` ke andar hona chahiye.
   ```bash
   cd dattingfrontend
   ```
2. **Android** pe chalana ho to phone USB se connect karo (ya emulator chalao), phir:
   ```bash
   npx expo run:android
   ```
   Pehli dafa apna time lagega (build banegi), uske baad app device pe install ho kar khul jayegi.
3. **iOS** pe (sirf Mac): `npx expo run:ios`

### Option B: Sirf Metro start karna (app pehle se installed ho)

Agar app pehle se phone pe install hai (development build), to:
```bash
cd dattingfrontend
npx expo start
```
Phir phone pe wohi dev-build app kholo — QR scan karne ki zaroorat nahi, app khud Metro se connect ho jati hai.

### Agar Expo Go se try karo

1. `cd dattingfrontend` zaroor karein.
2. `npx expo start -c` (cache clear ke saath).
3. Same WiFi pe phone aur PC hon.
4. Agar message aaye "This project uses a development build" to **Option A** use karein (`npx expo run:android`).

---

## Production build se push notification test

Jab aap **production build** bana kar test karte ho (EAS Build, Play Store, TestFlight ya direct APK/IPA), flow yehi rehta hai — sirf token lene ka tareeqa alag hota hai.

### 1. Production build install karo

- **Android:** EAS se build karo, APK/AAB install karo; ya Play Store (internal testing) se.
- **iOS:** EAS se build karo, TestFlight ya direct IPA install karo.

### 2. Token kaise milega (production mein)

Production build mein **Metro console nahi hota**, isliye `[Push] Expo token` log nahi dikhega. Token ye se lo:

1. App **real device** pe kholo, **login** karo (taake push token save ho).
2. **Supabase Dashboard** → **profiles** table → us user ki row jis device pe production app hai → **expo_push_token** column copy karo.

Yahi token use karke notification bhej kar test karo.

### 3. Expo Push Tool se test

1. Browser: **https://expo.dev/notifications**
2. Token paste karo (Supabase se copy kiya hua).
3. Title / Body likho, **Send a Notification** dabao.
4. Production app wale device pe notification aani chahiye.

### 4. Real flow se test (message + match)

- **Message:** Do devices pe do accounts, match karo, ek se message bhejo → dusre device (production build) pe message notification.
- **Match:** Do users ek doosre ko like karein → jisne pehle like kiya usko "It's a match! 🎉" notification (production build pe bhi same).

### 5. Yaad rahe (production)

- Notifications **ON** honi chahiye (Settings → Kubsy).
- Production build ke liye bhi **Expo Push free** hai; token format same rehta hai (`ExponentPushToken[...]`).
- Agar notification na aaye to Supabase mein **expo_push_token** check karo — login ke baad save hua hai ya nahi.

### 6. Production build mein token DB mein save nahi ho raha?

- **app.json** mein `extra.eas.projectId` hona chahiye (EAS project ID). Code ab iske fallbacks bhi use karta hai.
- **EAS Build** ke time FCM (Android) / APNs (iOS) credentials set hone chahiye: [Expo: Push notifications setup](https://docs.expo.dev/push-notifications/push-notifications-setup/). Bina iske production build mein token nahi banta.
- App ab production mein pehli dafa token na mile to **3 second baad ek retry** karti hai (native late ready ho sakta hai).
- Agar phir bhi na ho to **Profile → Enable notifications** dabao — manually permission + token + save trigger hota hai.

---

## Step 1 (token save) nahi ho raha? – Console se pata karo

App chalao, **login** karo (profile complete hona chahiye), Metro/terminal mein ye logs dekho:

| Log | Matlab | Kya karo |
|-----|--------|----------|
| `[Push] Step 0: userId nahi hai` | Login ya profile complete nahi | Pehle login karo, profile mein full_name save karo |
| `[Push] Step 1 FAIL: token nahi mila` | Permission deny / emulator / projectId | Real device, notification allow karo; ya Profile → Enable notifications; app.json mein `extra.eas.projectId` check karo |
| `[Push] Token nahi: Device.isDevice false` | Emulator pe ho | **Real phone** pe chalao |
| `[Push] Token nahi: permission denied` | User ne notification block kiya | Profile → **Enable notifications** dabao, ya Settings → Kubsy → Notifications ON |
| `[Push] Supabase save error: ...` ya `no row updated` | RLS / session | Neeche wala SQL Supabase mein chalao |
| `[Push] Backend save failed: 500` | Backend .env | Server .env mein `SUPABASE_SERVICE_ROLE_KEY` set karo |
| `[Push] Step 2: Token DB mein SAVED` | Sab theek | Supabase → profiles → apni row → expo_push_token check karo |

---

## Push token DB mein save nahi ho raha? (fix in 1 step)

App ab **pehle Supabase** se token save karti hai (phir backend). Agar Supabase mein **RLS policy** nahi hai to token save nahi hoga.

**Ye SQL Supabase pe chalao (ek hi baar):**

1. **Supabase Dashboard** kholo → apna project → **SQL Editor**.
2. **New query** mein ye paste karo aur **Run** dabao:

```sql
DROP POLICY IF EXISTS "Users can update own profile expo_push_token" ON public.profiles;
CREATE POLICY "Users can update own profile expo_push_token"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
```

3. App mein **logout → login** karo, ya **Profile → Enable notifications** dabao. Token ab DB mein save hona chahiye (Supabase Table Editor → `profiles` → apni row → `expo_push_token` check karo).

**Optional (backend):** Agar backend se bhi save karna ho to `kusby-backend/datting/.env` mein `SUPABASE_SERVICE_ROLE_KEY` set karo; app pehle Supabase try karti hai, fail pe backend.

## Push sahi kaam kare iske liye (checklist)

- **Frontend:** Login ke baad app pehle **Supabase** se token save karti hai; fail pe backend. Console mein `[Push] Token saved via Supabase` ya backend 200 = saved.
- **Android 13+:** App mein `POST_NOTIFICATIONS` permission hai; pehli baar notification allow karo.
- **Real device** use karein (emulator pe push sahi nahi chal sakta).
- **Notifications allow** karein (Settings → Notifications → Kubsy).
- **Login** karke test karein taake push token save ho.

---

## Tareeqa 1: Expo Push Tool se test (sabse aasaan)

1. App **real device** pe chalao aur **login** karo.
2. Metro/terminal mein `[Push] Expo token: ExponentPushToken[xxxx]` dikhega (dev mode mein).
   - Agar nahi dikhe: Supabase → Table Editor → **profiles** → apne user ki row → **expo_push_token** column copy karein.
3. Browser mein jao: **https://expo.dev/notifications**
4. "Expo Push Token" field mein woh token paste karein.
5. Title / Message likh kar **Send a Notification** dabayein.
6. Device pe notification aani chahiye.

---

## Tareeqa 2: Real flow se test (message)

1. **Do accounts** use karein (do devices ya ek device pe do baar login).
2. Dono ko **match** karao (ek doosre ko like karein).
3. Ek account se **message** bhejo.
4. Dusre account wale device pe **push notification** aani chahiye (sender ka naam + message).

---

## Tareeqa 3: Real flow se test (match)

1. **Do accounts** – User A aur User B.
2. Pehle **User B**, **User A** ko like karein (like/superlike).
3. Phir **User A**, **User B** ko like karein.
4. **User B** ke device pe "It's a match! 🎉" notification aani chahiye.

---

## Token kahaan se milega?

- **Option A:** App chalate waqt Metro console mein `[Push] Expo token: ...` (sirf `__DEV__` mein).
- **Option B:** Supabase Dashboard → **profiles** table → apna user → **expo_push_token** column.

---

## Agar notification na aaye

1. Device pe Notifications **ON** honi chahiye (Settings → Expo Go / Kubsy).
2. **expo_push_token** Supabase profiles mein **save** ho (ExponentPushToken... format).
3. **Real device** pe test karein, simulator pe nahi.
4. Expo Push Tool (expo.dev/notifications) se direct token bhej kar check karein.
