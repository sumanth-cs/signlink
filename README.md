# 🤟 SignLink AI

**SignLink AI** is a state-of-the-art, full-stack platform that breaks down communication barriers by translating American Sign Language (ASL) into real-time text and speech. Featuring an advanced dual-model AI architecture, a gamified learning center, and a multi-lingual traveler mode.

![SignLink AI Demo](https://img.shields.io/badge/Status-Live_Production-success) ![License](https://img.shields.io/badge/License-MIT-blue)

---

## ✨ Core Features

*   **⚡ Real-Time ASL Translation:** Instantly converts signs and gestures into structured English sentences using an optimized WebSocket streaming architecture.
*   **🌍 Traveler Mode:** A Duolingo-style survival hub! Translate your ASL into 100+ global spoken languages (Spanish, French, Japanese, etc.) to navigate foreign countries effortlessly.
*   **📚 Gamified Learning Center:** Master sign language with interactive modules, progress tracking, daily streaks, and embedded YouTube tutorials.
*   **🧠 Advanced 3D Kinematics AI:** 
    *   **Alphabets:** Detects all 26 letters (A-Z) instantly using a custom zero-latency mathematical heuristic engine based on 3D finger coordinates.
    *   **Words & Signs:** Natively recognizes 10+ core phrases (I Love You, Hello, Peace, Yes, No, Rock On, etc.) powered by Google MediaPipe.
*   **💬 NLP Sentence Refinement:** Integrates **Google Gemini AI** to seamlessly stitch choppy translated signs into natural, grammatically correct sentences.

---

## 🛠️ Tech Stack & Architecture

### Frontend (Vercel)
*   **React.js & Tailwind CSS:** Delivering a sleek, glassmorphic UI with modern micro-animations.
*   **MediaPipe Camera Integration:** Renders a clean, professional, minimalistic white/indigo skeleton directly over your hands in real-time.
*   **Optimization:** Aggressive frame compression (320x240, 40% JPEG quality) allows for ultra-fast, zero-latency WebSocket transmissions.

### AI Processing Engine (Render)
*   **Python 3.10 & WebSockets:** Handles massive streams of incoming frames.
*   **Google MediaPipe Vision:** Runs lightweight `.task` models to classify complex dynamic gestures.
*   **Custom Heuristics Module:** Mathematically parses 21 hand landmarks to predict A-Z alphabets without the RAM overhead of heavy Vision Transformers.

### Backend API (Render)
*   **Node.js & Express:** Orchestrates user authentication, history, and Translation Hub data.
*   **MongoDB Atlas:** Secure cloud database for user persistence.
*   **Google Gemini AI:** Performs the final NLP polish on translated strings.

---

## 🚀 Live Deployment

The platform is fully containerized and deployed for production use:
*   **Frontend Client:** [SignLink AI App](https://signlink-git-main-sumanth-cs-projects.vercel.app/)
*   **Node.js Backend:** Render Web Service
*   **Python AI Engine:** Render Web Service

---

## 💻 Local Setup & Development

### 1. Prerequisites
*   Node.js (v18+)
*   Python (3.10.x)
*   MongoDB Instance

### 2. Environment Variables
Create a `.env` file in the **`/server`** directory:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/signlink
JWT_SECRET=your_super_secret_jwt_key
CLIENT_URL=http://localhost:3000
GEMINI_API_KEY=your_google_gemini_api_key
```

### 3. Running Locally

**Terminal 1: Node.js Backend**
```bash
cd server
npm install
npm run dev
```

**Terminal 2: React Frontend**
```bash
cd client
npm install
npm start
```

**Terminal 3: Python AI Engine**
```bash
cd ai-engine
pip install -r requirements.txt
python server.py
```
*(The AI engine will automatically listen on `ws://localhost:8000`)*

---
*Built with ❤️ to bridge the communication gap.*
