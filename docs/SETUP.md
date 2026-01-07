# 🚀 Setup Instructions

## Backend Setup

1. **Navigate to API folder:**
```bash
cd api
```

2. **Create & activate a virtual environment (first time only):**
```bash
python -m venv .venv
source .venv/bin/activate
```

3. **Install dependencies:**

This repo uses `pyproject.toml` (Poetry-style). Editable installs (`pip install -e .`) may not work reliably.

- **Option A (recommended): Poetry**

```bash
poetry install
```

- **Option B: pip (no Poetry)**

```bash
pip install -U pip
pip install fastapi uvicorn[standard] python-multipart openai python-dotenv pillow pydantic pydantic-settings python-json-logger
```

4. **Start the backend:**
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend will run on `http://localhost:8000`

---

## Frontend Setup

1. **Navigate to UI folder:**
```bash
cd ui
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start the frontend:**
```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

---

## 🎯 How to Use

1. Open browser to `http://localhost:3000`
2. Click **"Start Analysis"** button
3. Watch as analyses appear progressively (~15 seconds each)
4. Click any row to see full details
5. Click "Back to Analysis List" to return
6. Click "Run Again" to restart analysis

---

## 📊 Progressive Loading Flow

- Analysis starts when you click "Start Analysis"
- Frontend polls backend every 5 seconds
- Each analysis takes ~15 seconds (real GPT API call)
- Results appear one-by-one as they complete
- Total time: ~75 seconds for 5 analyses

---

## 🎨 Modern Professional UI Features

- ✅ Gradient backgrounds
- ✅ Smooth animations
- ✅ Progress indicators
- ✅ Hover effects
- ✅ Loading states
- ✅ Professional shadows and spacing
- ✅ Responsive design
