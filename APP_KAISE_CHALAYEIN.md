# App kaise chalayein (Expo Go se nahi chalegi)

Is app mein **expo-dev-client** hai, isliye **Expo Go** se open nahi hoti. Neeche wala tareeqa use karein.

---

## Pehli dafa (ya jab tak app install nahi hai)

### Android

1. Phone ko **USB se PC se connect** karo (ya Android emulator chalao).
2. Terminal mein:
   ```bash
   cd dattingfrontend
   npm run android
   ```
   Ya:
   ```bash
   npx expo run:android
   ```
3. Pehli dafa **build** banegi (5–15 min), phir app device pe **install** ho kar khul jayegi.

### iOS (sirf Mac)

```bash
cd dattingfrontend
npm run ios
```
Ya `npx expo run:ios`

---

## Baad mein (jab app pehle se install ho)

1. Terminal mein Metro start karo:
   ```bash
   cd dattingfrontend
   npm run start
   ```
2. Phone pe **wahi Kubsy app** (jo pehle install ki thi) kholo.
3. App khud Metro se connect ho jayegi (PC aur phone **same WiFi** pe hone chahiye).

---

## Short

| Kaam              | Command           |
|-------------------|-------------------|
| Pehli baar app install | `npm run android` |
| Metro start (test)     | `npm run start`   |
| Phir phone pe Kubsy app kholo | —                 |

**Expo Go se ye app nahi chalegi** — development build zaroori hai (`npm run android` se jo install hoti hai).
