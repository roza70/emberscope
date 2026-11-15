# ✦ EmberScope

### NASA Microgravity Fire Safety Intelligence Platform

**Team Starfall | NASA Space Apps Challenge 2026**

EmberScope is an AI-powered research intelligence platform designed to explore NASA's microgravity fire research and help engineers understand fire safety challenges for future spacecraft and lunar and Martian habitats.

It combines NASA investigation records, evidence retrieval, AI-assisted research, and interactive analytics in one platform.

---

## 🚀 The Challenge

**Flame in Freefall**

Fire behaves differently in microgravity. Understanding flame behavior, smoke particle distribution, ignition, flame spread, and suppression is essential for protecting astronauts during future space missions.

EmberScope aims to make NASA's existing research more accessible, searchable, and understandable.

## ✨ Key Features

- **AI Research Assistant:** Ask questions about NASA microgravity fire research.
- **Evidence Explorer:** Explore investigation-related evidence and source references.
- **Investigation Explorer:** Browse curated NASA Physical Sciences Informatics investigations.
- **Analytics Dashboard:** Explore investigation and evidence statistics.
- **Evidence Validation:** Validate evidence citations returned by the AI assistant.
- **Research Gap Awareness:** Distinguish investigation objectives from experimentally established findings.

## 🔬 NASA Research Investigations

EmberScope includes curated investigation profiles, including:

| Investigation | Research Focus |
|---|---|
| BASS (PSI-26) | Combustion and fire suppression |
| BASS-II (PSI-25) | Solid-fuel ignition and flame extinction |
| SAFFIRE-I (PSI-98) | Large-scale fire behavior in low gravity |
| SAME-R (PSI-101) | Liquid smoke particle sizes |
| SAME (PSI-102) | Smoke particle size distributions |

Source: [NASA Physical Sciences Informatics](https://psi.nasa.gov/physci/repo)

## 🧠 System Architecture

```text
                  USER
                    |
                    v
          React + TypeScript UI
                    |
                    v
              FastAPI Backend
                    |
          +---------+---------+
          |                   |
          v                   v
     SI Retrieval         Gemini AI
          |                   |
          +---------+---------+
                    |
                    v
          Evidence-grounded Response
                    |
                    v
          Citation Validation
```

## 🛠️ Technology Stack

**Frontend**
- React
- TypeScript
- Vite
- CSS

**Backend**
- Python
- FastAPI
- Uvicorn

**AI & Research Intelligence**
- Google Gemini API
- Custom SI Retrieval Engine
- Evidence-based citation validation

**Data & Research**
- NASA Physical Sciences Informatics (PSI)


## Project Structure

```text
emberscope/
│
├── backend/
│   ├── main.py
│   ├── gemini_provider.py
│   └── requirements.txt
│
├── data/
│   ├── metadata/
│   │   └── investigations.json
│   └── processed/
│       └── evidence.json
│

├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.ts
│   └── src/
│       ├── assets/
│       ├── AnalyticsDashboard.tsx
│       ├── EvidenceExplorer.tsx
│       ├── App.tsx
│       ├── App.css
│       ├── index.css
│       └── main.tsx

│
├── si-engine/
│   └── retrieval/
│       └── search.py
│
├── research/
├── README.md
└── .gitignore
```


## ⚙️ Local Installation

### 1. Clone the repository

```bash
git clone https://github.com/roza70/emberscope.git
cd emberscope
```

### 2. Start the backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

Backend API:

`http://127.0.0.1:8000`

Interactive API documentation:

`http://127.0.0.1:8000/docs`

### 3. Start the frontend

Open another terminal:

```powershell
cd frontend
npm install
npm run dev
```

Frontend:

`http://localhost:5173`

### 4. Configure the AI API key

Configure the Gemini API key as a server-side environment variable using the exact variable name expected by the backend.

Never commit API keys or secret environment files to GitHub.

## 🔌 API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | API home |
| GET | `/api/health` | Health check |
| GET | `/api/investigations` | Retrieve investigations |
| GET | `/api/investigations/{psi_id}` | Investigation details |
| GET | `/api/evidence` | Retrieve evidence |
| POST | `/api/ask` | Ask the AI research assistant |

## ⚠️ Research Limitations & Scientific Integrity

EmberScope currently uses a curated collection of NASA investigation profiles and locally available evidence records.

Important distinctions:

- An investigation objective is not the same as an experimental result.
- Missing quantitative results in EmberScope do not mean NASA has no corresponding data.
- AI-generated responses must be interpreted alongside their cited sources.
- Engineering considerations are not validated spacecraft fire-safety requirements.

The platform is a research exploration tool, not a certified spacecraft fire-safety system.

## 🌌 Future Improvements

- Expand NASA PSI dataset ingestion.
- Integrate processed experimental datasets.
- Add quantitative research comparisons.
- Improve investigation ranking and evidence visualization.
- Develop deeper fire-safety insights for Moon and Mars habitats.

## 👩‍🚀 Team Starfall

**NASA Space Apps Challenge 2026**

- Tahsin Roza
- Polok Ahmed

## 📚 Acknowledgements

We acknowledge NASA and the Physical Sciences Informatics program for making space science investigation resources accessible to researchers and developers.

**Built with curiosity, science, and a vision for safer human space exploration.**

*Explore the science. Understand the risks. Protect the future of space exploration.*

---

**Repository:** [github.com/roza70/emberscope](https://github.com/roza70/emberscope)