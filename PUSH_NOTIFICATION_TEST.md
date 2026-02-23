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

## Zaroori baatein
- **Real device** use karein (emulator/simulator pe push sahi nahi chal sakta).
- Expo Go / app ke liye **Notifications allow** karein (Settings → Notifications).
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
