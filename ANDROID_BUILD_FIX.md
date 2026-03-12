# Android build fail – Gradle cache fix

**Error:** `Could not read workspace metadata from ... metadata.bin`  
**Reason:** Gradle cache corrupt (transform/metadata). Cache delete kiye bina prebuild --clean se fix nahi hota.

---

## Fix (Windows) – step by step

### Step 1: Gradle daemon band karo

**Agar Git Bash use kar rahe ho** (path mein space hai, isliye quotes zaroori):
```bash
cd "/c/Users/Faiz Ansari/Desktop/datting/dattingfrontend/android"
./gradlew.bat --stop
cd ../..
```

**Agar PowerShell use kar rahe ho:**
```powershell
cd "C:\Users\Faiz Ansari\Desktop\datting\dattingfrontend\android"
.\gradlew.bat --stop
cd ..\..
```

### Step 2: Gradle cache delete karo

**Option A – File Explorer (sabse simple):**
1. Windows + E dabao, address bar mein ye paste karo:
   ```
   %USERPROFILE%\.gradle\caches\8.14.3\transforms
   ```
2. `transforms` folder **delete** karo (right‑click → Delete). Agar 8.14.3 nahi dikhe to `%USERPROFILE%\.gradle\caches` kholo aur andar `transforms` ya puri `caches` folder delete karo.

**Option B – Git Bash se delete:**
```bash
rm -rf "/c/Users/Faiz Ansari/.gradle/caches/8.14.3/transforms"
```
(Agar phir bhi error aaye to pura cache: `rm -rf "/c/Users/Faiz Ansari/.gradle/caches"`)

**Option C – PowerShell se delete:**
```powershell
Remove-Item -Recurse -Force "$env:USERPROFILE\.gradle\caches\8.14.3\transforms"
```

### Step 3: Phir build chalao

```bash
cd "/c/Users/Faiz Ansari/Desktop/datting/dattingfrontend"
npx expo run:android
```
(PowerShell: `cd "C:\Users\Faiz Ansari\Desktop\datting\dattingfrontend"` phir same command.)

Pehli build thodi der le sakti hai (cache dubara download hogi).

---

**Important:** Sirf `npx expo prebuild --clean` se ye error **nahi** jayega; **Gradle cache delete** zaroori hai (Step 2).
