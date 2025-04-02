# 📌 Universal Auto Supply

_A Full-Stack Web Application with a React Frontend & Django Backend_

---

## 📂 Project Structure

```
universal-auto-supply/
│── backend/       # Django Backend (API & Business Logic)
│   └── dependencies.txt  # Backend Dependencies
│
│── frontend/      # React Frontend (User Interface)
│   └── README.md  # Frontend Guide
│
│── kiosk/         # Kiosk Frontend (Self-Service UI)
│   └── README.md  # Kiosk Guide
│
│── README.md      # Project Overview
```

---

## 🚀 Getting Started

### 🔧 Requirements

- **Node.js** (for frontend)
- **Python** (for backend)
- **Git** (for version control)

---

## 💾 Backend (Django)

📌 Navigate to the `backend/` directory:

```sh
cd backend
```

📌 Install dependencies:

```sh
pip install -r dependencies.txt
```

📌 Run the server:

```sh
python manage.py runserver 0.0.0.0:8000
```

📚 More details inside [`backend/README.md`](backend/README.md).

---

## 🎨 Frontend (React + Tailwind)

📌 Navigate to the `frontend/` directory:

```sh
cd frontend
```

📌 Install dependencies:

```sh
npm install
```

📌 Start the React app:

```sh
npm start
```

📚 More details inside [`frontend/README.md`](frontend/README.md).

---

## 🏠 Kiosk Frontend (React + Tailwind)

📌 Navigate to the `kiosk/` directory:

```sh
cd kiosk
```

📌 Install dependencies:

```sh
npm install
```

📌 Start the Kiosk app:

```sh
npm start
```

📚 More details inside [`kiosk/README.md`](kiosk/README.md).

---

## 🔗 Connecting Frontend & Backend

- The frontend and kiosk communicate with the Django backend via **REST APIs**.
- Ensure CORS is enabled for cross-origin requests.

---

## 🔐 Default Login Credentials

- **Username:** ustp
- **Password:** 123
