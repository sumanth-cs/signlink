# signlink-ai

A complete full-stack real-time sign language translator with learning mode.

## Tech Stack
- Frontend: React.js with Tailwind CSS
- Backend: Node.js/Express
- AI Engine: Python/FastAPI with MediaPipe and LSTM
- Database: MongoDB

## Setup Instructions

### Prerequisites
- Docker and Docker Compose (recommended)
- Node.js > 18
- Python > 3.9

### Running with Docker (Recommended)
```bash
docker-compose up --build
```
This will start:
- Frontend at http://localhost:3000
- Backend at http://localhost:5000
- AI Engine at http://localhost:8000
- MongoDB at localhost:27017

### Manual Setup
1. Backend: `cd server && npm install && npm run dev`
2. Frontend: `cd client && npm install && npm start`
3. AI Engine: `cd ai-engine && pip install -r requirements.txt && uvicorn app.main:app --reload`

## Dataset Information
This project is built to accept data like the following:
- WLASL dataset: https://dxli94.github.io/WLASL/ (2000+ signs)
- MS-ASL dataset: Microsoft Research (1000+ signs)

To retrain the model, place preprocessed numpy data into your AI engine configuration and run `train_model.py`.
