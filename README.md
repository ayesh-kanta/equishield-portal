# Equishield Investment Group — Investor Transparency Portal

A full-stack investor portal with Admin Panel and Investor Portal, powered by Firebase Firestore with real-time sync.

---

## 🚀 Setup in 5 Steps

### 1. Create Firebase Project
1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project (e.g. `equishield-portal`)
3. Go to **Project Settings → Your apps → Add Web App**
4. Copy the `firebaseConfig` object

### 2. Configure Firebase
Open `src/firebase.js` and replace the placeholder values:
```js
const firebaseConfig = {
  apiKey:            "your-actual-api-key",
  authDomain:        "your-project.firebaseapp.com",
  projectId:         "your-project-id",
  storageBucket:     "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123456789:web:abcdef",
};
```

### 3. Set Up Firestore
1. In Firebase Console → **Firestore Database → Create database**
2. Start in **test mode** (you can lock it down later)
3. Keep the default region

### 4. Install & Run
```bash
npm install
npm start
```

### 5. Seed Data
On first launch, the app automatically seeds the database with demo data:

| Role     | Phone        | Password   |
|----------|--------------|------------|
| Admin    | 9999999999   | admin123   |
| Investor | 9876543210   | rajesh123  |
| Investor | 9123456789   | priya123   |
| Investor | 9988776655   | anil123    |

---

## 🔒 Firestore Security Rules (Production)

After testing, lock down your rules in **Firestore → Rules**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

All access goes through the app only — no public access.

---

## 📁 Project Structure

```
equishield/
├── public/
│   └── index.html          # Google Fonts loaded here
├── src/
│   ├── firebase.js         # ← Replace config here
│   ├── index.js            # React entry point
│   └── App.jsx             # Entire app (Login + Admin + Investor)
├── package.json
└── README.md
```

---

## ✨ Features

### Admin Panel
- **Summary**: Total AUM, Total Invested, Total Returns, Active Investors
- **Investors Tab**: Card view of all investors with stats
- **Investments Tab**: Full table with inline current value editing + delete + filter by investor
- **Add Investor**: Name, Phone, Password, Email
- **Add Investment**: Investor selector, Date, Amount, Current Value, Note
- **Settings**: Change admin or any investor's phone/password

### Investor Portal
- **Summary**: Total Invested, Current Value, Total Returns, Return %
- **Overview Tab**: Portfolio performance bar + per-investment breakdown
- **Transactions Tab**: Full table with all entries
- **Charts Tab**: Area chart (portfolio growth over time) + Bar chart (invested vs current)

### Real-Time Sync
- All reads use `onSnapshot()` — no polling
- When admin edits a current value, investor's screen updates within 1–2 seconds automatically

---

## 🛠 Tech Stack
- **React 18** + **Recharts** (charts)
- **Firebase 10** — Firestore only (no Firebase Auth)
- **Fonts**: Cormorant Garamond + DM Sans
- **Theme**: Dark luxury — `#0a0a0a` bg, `#c9a84c` gold accent
- Fully mobile responsive
