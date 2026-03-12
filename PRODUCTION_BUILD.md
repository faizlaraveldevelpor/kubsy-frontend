# Production Build Kaise Banayein (EAS Build)

Aapke project mein **EAS Build** already set hai. Neeche steps follow karein.

---

## Pehle ye karo

### 1. Expo account + EAS CLI

- **Expo account:** https://expo.dev pe sign up / login.
- **EAS CLI** install karo (agar nahi hai):
  ```bash
  npm install -g eas-cli
  ```
- Login karo:
  ```bash
  eas login
  ```

### 2. Project folder

```bash
cd dattingfrontend
```

---

## Android production build

### Option A: Play Store ke liye (AAB)

```bash
eas build --platform android --profile production
```

- Build **AAB** (Android App Bundle) banegi — Play Store upload ke liye.
- EAS dashboard pe build complete hone ka wait karo, phir **Download** se AAB le sakte ho.

### Option B: Direct install ke liye (APK)

```bash
eas build --platform android --profile production-apk
```

- Build **APK** banegi — direct device pe install ke liye (Play Store ke bina).
- Complete hone ke baad link se APK download karke phone pe install karo.

---

## iOS production build

```bash
eas build --platform ios --profile production
```

**Zaroori (iOS ke liye):**
- **Mac** ya EAS ke cloud Mac par build hogi.
- **Apple Developer account** ($99/year) chahiye.
- Pehli baar EAS puchenga: Apple ID, credentials, certificates — steps follow karo.

Agar aapke `eas.json` mein iOS production profile nahi hai, to ye chalao (default production use hogi):
```bash
eas build --platform ios --profile production
```
Ya **preview** profile (internal testing):
```bash
eas build --platform ios --profile preview
```

---

## Build status aur download

1. Command chalate hi **https://expo.dev** open hota hai / terminal mein build link milti hai.
2. **Expo dashboard** → your project → **Builds**.
3. Build **Complete** hone tak wait karo (10–20 min).
4. **Download** button se:
   - Android: AAB ya APK
   - iOS: IPA (TestFlight ya direct install)

---

## Short commands (yaad rahe)

| Kaam              | Command |
|-------------------|--------|
| Android (Play Store AAB) | `eas build --platform android --profile production` |
| Android (APK direct)     | `eas build --platform android --profile production-apk` |
| iOS                      | `eas build --platform ios --profile production` |
| Dono platform            | `eas build --platform all --profile production` |

---

## Agar error aaye

- **"Not logged in"** → `eas login` karo.
- **"Project not configured"** → `eas build:configure` (pehli baar).
- **iOS credentials** → EAS wizard follow karo; Apple Developer account zaroori hai.
- **Android ke liye** usually koi extra credential nahi mangta (EAS ke default use hote hain).

Build complete hone ke baad same app **push notifications** ke liye bhi use kar sakte ho — token Supabase se le kar test karein (dekhein `PUSH_NOTIFICATION_TEST.md`).
