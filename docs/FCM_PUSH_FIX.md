# FCM "Unable to retrieve the FCM server key" – Fix

Error: `InvalidCredentials: Unable to retrieve the FCM server key for the recipient's app`

## Cause

Key EAS pe upload to ho chuki hai, lekin **Push Notifications (FCM V1)** ke liye set nahi hui. Expo ko key **FCM V1** option ke andar chahiye.

---

## Option A: EAS Dashboard se (recommended – browser mein)

1. **Open:** https://expo.dev  
   Login karo (owner: **faiz1122**).

2. **Project:** **kubsy_dating_app** (ya Kubsy) open karo.

3. **Credentials:** Left sidebar se **Credentials** pe jao.

4. **Android:** **Android** select karo → build profile choose karo (**production** ya **development**).

5. **Push Notifications (FCM):**  
   Section **"Push Notifications"** / **"Google Service Account Key for FCM V1"** dhoondo → **Upload** ya **Set up** pe click karo.

6. **File upload:**  
   `datting-2c07d-firebase-adminsdk-fbsvc-7de9543f0b.json` (project root wali) select karke upload karo.

7. **Dusra profile:**  
   Agar **development** bhi use karte ho to same steps **development** profile ke liye repeat karo.

---

## Option B: Terminal (eas credentials)

**Apne machine pe** (Git Bash ya PowerShell) ye command chalao — **yahan se run nahi ho sakta** (interactive hai):

```bash
cd "c:\Users\Faiz Ansari\Desktop\datting\dattingfrontend"
eas credentials
```

Phir **isi order** mein select karo:

1. **Select platform:** `Android`
2. **Which build profile:** `production` (ya `development`)
3. **What do you want to do?**  
   → **"Manage your Google Service Account Key for Push Notifications (FCM V1)"**  
   (**"Upload a Google Service Account Key"** mat choose karo)
4. Andar → **Upload a new service account key** → file:  
   `datting-2c07d-firebase-adminsdk-fbsvc-7de9543f0b.json`

Dono profiles (production + development) ke liye alag alag run karke same FCM V1 option se key set karo.

---

## Firebase / Google Cloud

- **Firebase Console** → Project **datting-2c07d** → Project settings
- **Google Cloud Console** → [APIs & Services → Enabled APIs](https://console.cloud.google.com/apis/library) → is project mein **Firebase Cloud Messaging API** enabled ho

---

## Short summary

| Galat | Sahi |
|--------|------|
| Google Service Account → Upload a Google Service Account Key | **Manage your Google Service Account Key for Push Notifications (FCM V1)** → phir upload |

Key **FCM V1** ke under set honi chahiye, tab hi Expo push bhejega.
