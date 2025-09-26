# 🚀 SankalpHackathon

A full-stack project combining **dark pattern detection**, **user reviews**, and a **browser extension**. It includes:

* **Backend Detect** → Puppeteer-powered service to scan websites for dark patterns.
* **Backend API** → Express.js server with authentication, user management, and review handling.
* **Frontend** → React + Vite + Tailwind interface for users.
* **Extension** → Chrome extension to detect dark patterns directly while browsing.

---

## 📂 Project Structure

```
SankalpHackathon-main/
│
├── backend-detect/     # Puppeteer service for detecting dark patterns
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   └── utils/
│
├── backend/            # Express.js API server
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   └── routes/
│
├── frontend/           # React + Vite + Tailwind frontend
│   └── src/
│
├── extension/          # Chrome extension
│   ├── manifest.json
│   ├── background.js
│   ├── content.js
│   └── popup.*
```

---

## ⚙️ Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/SankalpHackathon.git
cd SankalpHackathon-main
```

### 2. Backend Detect Service

```bash
cd backend-detect
npm install
npm start
```

### 3. Backend API

```bash
cd backend
npm install
npm run dev
```

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

### 5. Extension

1. Open **Chrome** → `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked** and select the `extension/` folder.

---

## 🔑 Features

* Detects **dark patterns** such as:

  * Auto-checked boxes
  * Hidden buttons
  * Confirm-shaming prompts
  * Forced redirects
* **User authentication** & reviews system.
* **Browser extension** for instant detection.
* **Frontend dashboard** for reports.

---

## 🛠️ Tech Stack

* **Backend Detect**: Node.js, Puppeteer
* **Backend API**: Express.js, MongoDB
* **Frontend**: React, Vite, TailwindCSS, TypeScript
* **Extension**: JavaScript, Chrome APIs

---

## 🤝 Contributing

```bash
# Fork the repository
# Create a new branch
git checkout -b feature-name

# Make your changes
# Commit & push
git commit -m "Added new feature"
git push origin feature-name

# Open a Pull Request 🎉
```

---

## 📜 License

This project is licensed under the **MIT License**.
