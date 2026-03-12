# Google & Apple (Mac/iOS) Login – How to Get Keys

This document explains **how to get** the keys needed for **Google Login** and **Apple (Mac) Login**, and **what the redirect URL** is.

---

## Redirect URL (for both Google and Apple)

After login, the app opens again using this URL:

**Redirect URL:** `https://supabase.kubsy.app/auth/v1/callback`

When setting up Google or Apple, use this as the app redirect / deep link URL where needed. If your app uses a different scheme (e.g. `myapp://`), the redirect URL will be `https://supabase.kubsy.app/auth/v1/callback` instead.

---

## 1. Google Login – How to Get Keys

### What You Need

- **Google OAuth 2.0 Client ID**
- **Google OAuth 2.0 Client Secret**
- (Optional) Android/iOS client IDs if you use native Google Sign-In

### Step-by-Step – Google Cloud Console

1. Open **Google Cloud Console**:  
   https://console.cloud.google.com/

2. Select a **Project** (or create a new one).

3. Go to **APIs & Services → Credentials**.

4. Click **Create Credentials → OAuth client ID**.

5. Select **Application type**:
   - **Web application** (for server/auth callback).
   - You can also create **Android** or **iOS** clients if needed for the mobile app.

6. For **Web application**:
   - **Name:** Any name (e.g. "Kubsy Web").
   - In **Authorized redirect URIs**, add the callback URL that your backend or auth provider gives you (e.g. `https://supabase.kubsy.app/auth/v1/callback`). Your development team will provide the exact URL.
   - Click **Save**.

7. Copy and save the **Client ID** and **Client Secret**. Hand these over to your development team.

### Summary – Google Keys

| Item          | Where to Get It                         |
|---------------|------------------------------------------|
| Client ID     | Google Cloud Console → Credentials → OAuth client ID |
| Client Secret | Google Cloud Console → Credentials → OAuth client ID |
| Redirect URL  | `https://supabase.kubsy.app/auth/v1/callback` (for the app)    |

---

## 2. Apple (Mac / iOS) Login – How to Get Keys

### What You Need

- **Apple Developer Account** (paid – $99/year).
- **App ID** (bundle ID) with **Sign in with Apple** capability.
- **Key** (private key `.p8`) + **Key ID** + **Team ID** + **Bundle ID**.

### Step-by-Step – Apple Developer

1. Open **Apple Developer Portal**:  
   https://developer.apple.com/account/

2. Go to **Certificates, Identifiers & Profiles**.

#### App ID (for iOS/Mac app)

1. Go to **Identifiers → App IDs** → select existing app or create new (+).
2. Confirm the **Bundle ID** (e.g. `com.kubsy.app`).
3. Under **Capabilities**, enable **Sign in with Apple** (checkbox).
4. Save.

#### Create a Key

1. Go to **Keys** → **Create a key** (+).
2. **Key name:** e.g. "Apple Sign In Key".
3. Enable **Sign in with Apple** (checkbox).
4. Click **Configure** → select your **Primary App ID** (bundle ID).
5. **Continue** → **Register**.
6. **Download** the key – it is only available once (`.p8` file). Store it securely.
7. Note the **Key ID** (shown on the dashboard).

#### Values to Collect

- **Key ID** – from the Keys section.
- **Team ID** – from Apple Developer account → Membership details (or top-right).
- **Bundle ID** – the one used for your app (e.g. `com.kubsy.app`).
- **Private Key** – full contents of the downloaded `.p8` file (from `-----BEGIN PRIVATE KEY-----` to `-----END PRIVATE KEY-----`). Copy as text and keep secure.

Hand these over to your development team.

### Summary – Apple Keys

| Item       | Where to Get It                               |
|------------|------------------------------------------------|
| Key (.p8)  | Apple Developer → Keys → Create → Download    |
| Key ID     | Apple Developer → Keys (shown after creating)  |
| Team ID    | Apple Developer → Membership / Account         |
| Bundle ID  | App ID (e.g. `com.kubsy.app`)                  |
| Redirect URL | `https://supabase.kubsy.app/auth/v1/callback` (for the app)         |

---

## 3. Quick Checklist

### Google Login

- [ ] Create a **Web application** OAuth client in Google Cloud Console.
- [ ] Add your auth callback URL to **Authorized redirect URIs** (get exact URL from dev team).
- [ ] Copy **Client ID** and **Client Secret** and hand over to dev team.

### Apple Login (Mac / iOS)

- [ ] Enable **Sign in with Apple** on your **App ID** in Apple Developer.
- [ ] Create a **Key** (Sign in with Apple), download the **.p8** file, note the **Key ID**.
- [ ] Note your **Team ID** and **Bundle ID**.
- [ ] Hand over Key (.p8 content), Key ID, Team ID, and Bundle ID to dev team.

---

## 4. Important URLs

| Purpose              | URL / Value                |
|----------------------|----------------------------|
| App redirect URL     | `https://supabase.kubsy.app/auth/v1/callback`    |
| Google Cloud Console | https://console.cloud.google.com/ |
| Apple Developer      | https://developer.apple.com/account/ |
