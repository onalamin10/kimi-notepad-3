# Notes App — APK ডাউনলোড গাইড (Android Studio ছাড়া)

এটি একটি React + Vite + Capacitor দিয়ে তৈরি Android অ্যাপ। আপনাকে Android Studio ইনস্টল করতে হবে না। আমরা **GitHub Actions** ব্যবহার করে APK তৈরি করব।

---

## সবচেয়ে সহজ পদ্ধতি: GitHub Actions

### ধাপ ১: GitHub অ্যাকাউন্ট তৈরি করুন

১. [github.com](https://github.com) এ যান।  
২. যদি অ্যাকাউন্ট না থাকে, Sign Up করে একটি ফ্রি অ্যাকাউন্ট তৈরি করুন।

---

### ধাপ ২: নতুন রিপোজিটরি তৈরি করুন

১. GitHub-এ লগইন করুন।  
২. উপরের ডানদিকে **+** আইকনে ক্লিক করুন → **New repository**।  
৩. Repository name দিন: `notes-app`  
৪. **Public** সিলেক্ট করুন।  
৫. **Create repository** বাটনে ক্লিক করুন।

---

### ধাপ ৩: প্রজেক্টের ফাইল আপলোড করুন

১. নতুন রিপোজিটরির পেজে যান।  
২. নিচের অপশন দেখতে পাবেন: **"…or upload an existing file"**  
৩. **uploading an existing file** লিংকে ক্লিক করুন।  
৪. **Choose your files** বাটনে ক্লিক করুন।  
৫. এই প্রজেক্টের সব ফোল্ডার ও ফাইল সিলেক্ট করুন।  
   - `android/`
   - `dist/`
   - `public/`
   - `src/`
   - `.github/`
   - `capacitor.config.ts`
   - `index.html`
   - `package.json`
   - `package-lock.json`
   - `tsconfig.json`
   - `vite.config.ts`
   - `BANGLA_README.md`

৬. নিচে **Commit changes** বাটনে ক্লিক করুন।

---

### ধাপ ৪: GitHub Actions চালু হবে

ফাইল আপলোড করার সাথে সাথে GitHub Actions স্বয়ংক্রিয়ভাবে APK বানাতে শুরু করবে।

১. রিপোজিটরির উপরের **Actions** ট্যাবে ক্লিক করুন।  
২. **Build Android APK** নামে একটি workflow দেখতে পাবেন।  
৩. সেটিতে ক্লিক করুন।  
৪. কিছুক্ষণ অপেক্ষা করুন (৩–৫ মিনিট)।

---

### ধাপ ৫: APK ডাউনলোড করুন

১. Actions রান শেষে সবুজ ✅ টিক চিহ্ন দেখা গেলে সেটিতে ক্লিক করুন।  
২. পেজের নিচে **Artifacts** সেকশন দেখুন।  
৩. `notes-app-debug-apk` নামটি দেখতে পাবেন।  
৪. সেটির উপর ক্লিক করে ডাউনলোড করুন।  
৫. ZIP ফাইলটি আনজিপ করুন, ভিতরে `app-debug.apk` পাবেন।

---

## ফোনে ইনস্টল করুন

১. APK ফাইলটি আপনার Android ফোনে কপি করুন।  
২. ফাইল ম্যানেজার থেকে APK-তে ট্যাপ করুন।  
৩. যদি "Allow from this source" বা "অজানা সোর্স থেকে ইনস্টল" জিজ্ঞাসা করে, **Allow** দিন।  
৪. **Install** → **Open**।  
৫. ✅ আপনার Notes অ্যাপ চালু হয়ে গেছে!

---

## যদি GitHub Actions কাজ না করে

### বিকল্প ১: Termux দিয়ে ফোনেই APK বানান

আপনার Android ফোনে **Termux** অ্যাপ ইনস্টল করুন। তারপর এই কমান্ডগুলো রান করুন:

```bash
pkg update
pkg install nodejs git openjdk-17 gradle
# প্রজেক্ট ক্লোন করুন
npm install
npm run build
npx cap sync android
cd android
./gradlew assembleDebug
```

APK লোকেশন:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### বিকল্প ২: কাউকে বানিয়ে নিন

আপনি চাইলে যেকোনো Developer বা Fiverr/Upwork থেকে কাউকে এই প্রজেক্টের `android/` ফোল্ডার দিয়ে APK বানিয়ে নিতে পারেন।

---

## কী কী ফিচার আছে এই অ্যাপে

- ✅ নোট লেখা
- ✅ প্ল্যান/টু-ডু তৈরি
- ✅ Notion-স্টাইল ব্লক এডিটর (ঐচ্ছিক)
- ✅ সিম্পল নোট মোড
- ✅ প্রাইভেট নোট PIN লক
- ✅ ট্যাগ ও কালার লেবেল
- ✅ ডার্ক মোড
- ✅ ট্র্যাশ ও রিস্টোর
- ✅ গ্রিড/লিস্ট ভিউ
- ✅ অফলাইনে কাজ করে

---

## সাহায্য

কোনো সমস্যা হলে বা APK বানাতে না পারলে আবার জানান।
