# 🌱 AI-Powered Greenhouse Monitoring System

An intelligent plant health monitoring system that combines IoT sensor data with computer vision to detect stress conditions in greenhouse environments. 

[![Python](https://img.shields.io/badge/Python-3.11-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-orange.svg)](https://openai.com/)

---

## 🎯 Overview

This system monitors greenhouse plant health using a **multi-modal AI approach**, combining:
- **IoT sensor data** (temperature, humidity, CO₂, soil moisture)
- **Computer vision** (plant images analyzed by GPT-4o-mini)
- **Historical context** (24-hour trend analysis)


## Project Statement

Small to medium-scale greenhouse operators face critical challenges:
- **Manual inspection is slow and error-prone** - Walking through large greenhouses takes hours
- **IoT sensors alone miss visual stress signs** - Nutrient deficiency, pests, and diseases aren't detected
- **Enterprise solutions are too expensive** - $10k+ systems aren't viable for small farms
- **Delayed detection leads to crop loss** - Heat stress causes permanent damage within 2-4 hours

### Solution Idea

An affordable AI monitoring system that:
- ✅ Continuously monitors multiple data streams
- ✅ Detects stress conditions early (before visible damage)
- ✅ Prioritizes alerts (routine vs. critical)
- ✅ Provides actionable recommendations


### Success Metric

**Reduce crop loss by 30%** by detecting stress conditions 24+ hours before visible damage occurs.

---

## ✨ Features

### Core Functionality

- **Multi-Modal Analysis** - Combines sensor data + visual assessment
- **Progressive Monitoring** - Real-time analysis updates every 15 minutes
- **Intelligent Alerts** - Two-tier system (Human Check vs. Pager Alert)
- **Confidence Scoring** - AI provides 0-100% confidence ratings
- **Historical Context** - 24-hour trend analysis informs decisions
- **Failure Resilience** - Graceful degradation when sensors/AI fail

### AI Capabilities

- **Vision Analysis** - Detects leaf browning, wilting, discoloration
- **Anomaly Detection** - Identifies unusual sensor patterns
- **Conflict Resolution** - Flags when sensors and images disagree
- **Quality Validation** - Rejects blurry/dark images before analysis

### User Experience

- **Clean Dashboard** - See all analyses at a glance
- **Detailed Views** - Click any entry for full breakdown
- **Visual Indicators** - Color-coded status badges
- **Mock Pager Alerts** - Demonstrates emergency notification flow

---

## 🏗️ Architecture

### System Flow

```
Greenhouse Sensors + Cameras
          ↓
    FastAPI Backend
          ↓
   Validation Layer (Image quality, sensor completeness)
          ↓
     GPT-4o-mini AI Analysis
          ↓
   Decision Logic (Confidence thresholds)
          ↓
    Alert Generation (👤 Human Check / 📟 Pager)
          ↓
    React Dashboard
          ↓
    Operator Response
```

### Data Flow

1. **Input:** Sensor readings (JSON) + Plant image (JPEG)
2. **Validation:** Check image quality and sensor completeness
3. **Context:** Load 24h historical sensor data
4. **AI Analysis:** GPT-4o-mini processes multi-modal data
5. **Decision:** Apply confidence thresholds and alert rules
6. **Output:** Structured JSON with status, confidence, recommendations
7. **Storage:** Save to analyzed_results.json
8. **Display:** Progressive updates to React UI

---

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **Pydantic** - Data validation
- **OpenAI API** - GPT-4o-mini vision model
- **Pillow** - Image quality validation
- **Python 3.11**

### Frontend
- **React 18** - UI framework
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Lucide Icons** - Icon library
- **Vite** - Build tool

### AI & ML
- **GPT-4o-mini** - Vision + language model
- **Temperature: 0.2** - Consistent responses
- **Structured outputs** - JSON schema enforcement

### Infrastructure
- **Mock data** - 12 test scenarios
- **File-based storage** - JSON persistence
- **Cost tracking** - Token usage monitoring

---

## 📦 Installation

### Prerequisites

- **Python 3.11+**
- **Node.js 18+**
- **OpenAI API Key**

### Backend Setup

```bash
# Navigate to API directory
cd api

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# On macOS/Linux:
source .venv/bin/activate
# On Windows:
.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Add your OpenAI API key to .env
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-4o-mini
OPENAI_TEMPERATURE=0.2
```

### Frontend Setup

```bash
# Navigate to UI directory
cd ui

# Install dependencies
npm install

# Create .env file (optional)
echo "VITE_API_URL=http://localhost:8000" > .env
```

---

## 🚀 Usage

### Start the Backend

```bash
cd api
source .venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: `http://localhost:8000`

### Start the Frontend

```bash
cd ui
npm run dev
```

Frontend will be available at: `http://localhost:3000`

### Run Analysis

1. Open `http://localhost:3000` in your browser
2. Click **"Start Analysis"** button
3. Watch progressive results appear (12 analyses over ~3 minutes)
4. Click any result row to see detailed analysis
5. Observe different alert types:
   - ✅ **Normal** (green checkmark)
   - 👤 **Human Check** (orange badge)
   - 📟 **Pager Alert** (red animated badge)

---

## 🎯 Design Decisions

### What We Built

#### 1. **GPT-4o-mini for Vision** (Irreversible Choice)
**Why:** Combines vision + language understanding in one model
- Analyzes plant images AND interprets sensor data together
- Structured JSON output with confidence scores

**Alternatives considered:**
- Separate vision model + LLM (more complex, higher cost)
- Rule-based computer vision (can't detect subtle stress)

#### 2. **Async Progressive Loading**
**Why:** Better UX and scalability
- Results appear as they complete (every 15 seconds)
- User sees progress, not a 3-minute wait
- Backend can process multiple greenhouses in parallel

**Alternatives considered:**
- Batch processing (poor UX, all-or-nothing)
- Real-time streaming (overkill for 15-min intervals)

#### 3. **Two-Tier Alert System**
**Why:** Prevents alert fatigue and prioritizes responses
- 👤 **Human Check** - Non-critical issues (blurry image, missing sensor)
- 📟 **Pager Alert** - Emergencies requiring immediate action (heat stress, crop damage risk)


---

## 🔔 Alert System

See [ALERT_CRITERIA.md](./ALERT_CRITERIA.md) for complete documentation.

### Human Check (👤)

**Triggered when:**
- Confidence < 60%
- Status = "uncertain"
- signals_agree = false
- Image quality issues
- Missing sensor data


### Pager Alert (📟)

**Triggered when:**
- Temperature ≥ 38°C (heat stress)
- Temperature ≤ 10°C (cold damage)
- Confidence < 50% + conflicting signals
- Visual damage + abnormal sensors

**Response time:** Within 2 hours (immediate action)

**Examples:**
- 40°C greenhouse temperature (activate cooling)
- Sensors say OK but plant shows yellowing (inspect for disease)

---

## 🎓 Learning Outcomes

### Technical Skills Gained
- Multi-modal AI integration (vision + structured data)
- FastAPI async/await patterns
- React progressive loading UX
- Pydantic data validation
- Image quality detection algorithms
- Rate limiting and cost tracking

### System Design Lessons
- Alert fatigue prevention (two-tier system)
- Graceful degradation strategies
- Human-in-the-loop decision making
- Real-world failure scenario planning

### AI/ML Insights
- Temperature parameter impact on consistency
- Structured output schema design
- Confidence score interpretation
- Multi-modal reasoning challenges

---

## 📄 License

MIT License - feel free to use for educational purposes.
