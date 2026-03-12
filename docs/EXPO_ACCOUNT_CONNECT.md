# Connect Project to Expo Account (info.salmarts@gmail.com)

Project ab **faiz1122** account se linked hai. Isko **info.salmarts@gmail.com** account se connect karne ke liye neeche steps follow karo.

---

## Option A: Terminal se (recommended)

### 1. Project folder mein jao

```bash
cd "c:\Users\Faiz Ansari\Desktop\datting\dattingfrontend"
```

### 2. Current account check karo (optional)

```bash
eas whoami
```

### 3. Logout (agar pehle se kisi aur account pe ho)

```bash
eas logout
```

### 4. Naye account se login

```bash
eas login
```

- Email: **info.salmarts@gmail.com**
- Password: apna Expo/account password daalo

### 5. Project ko is account se link karo

```bash
eas init
```

- Agar pooche "Link this project to EAS?" → **Yes**
- Agar pooche create new project ya use existing → **Create new** (ya existing choose karo)
- Isse `app.json` mein **owner** aur **extra.eas.projectId** automatically update ho jayenge

### 6. Verify

```bash
eas whoami
```

Ab wahi account dikhna chahiye jo **info.salmarts@gmail.com** se linked ho.

---

## Option B: Expo Dashboard se transfer

Agar project pehle se **faiz1122** (ya kisi aur account) pe hai aur tum **info.salmarts@gmail.com** se login karke transfer karna chahte ho:

1. **expo.dev** pe **faiz1122** se login karo (jis account pe ab project hai).
2. Project **Kubsy** / **kubsy_dating_app** kholo.
3. **Project settings** → **Transfer project**.
4. **info.salmarts@gmail.com** wala account select karo (us account ko pehle invite/collaborator bana sakte ho agar option ho).
5. Transfer confirm karo.

Transfer ke baad naye owner ke saath project link ho jayega. Local `app.json` mein **owner** ko manually update karna padega (e.g. `"owner": "salmarts"` ya jo bhi username ho us account ka).

---

## Important

- **FCM / Push credentials** jo EAS pe pehle set kiye the, woh **project** se link hote hain. Agar naya project banta hai (eas init → create new) to FCM key dubara us naye project ke credentials mein set karni hogi.
- **Transfer** use karo to same project rehti hai, credentials bhi same project ke saath rehte hain.
