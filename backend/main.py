
import json
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="EmberScope API",
    description="NASA Microgravity Fire Safety Intelligence Platform",
    version="0.2.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_FILE = (
    Path(__file__).resolve().parent.parent
    / "data"
    / "metadata"
    / "investigations.json"
)

def load_investigations():
    with open(DATA_FILE, "r", encoding="utf-8-sig") as file:
        return json.load(file)

@app.get("/")
def home():
    return {
        "project": "EmberScope",
        "status": "running",
        "version": "0.2.0"
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "EmberScope Backend"
    }


@app.get("/api/investigations")
def get_investigations():
    investigations = load_investigations()

    return {
        "total": len(investigations),
        "investigations": investigations
    }


@app.get("/api/investigations/{psi_id}")
def get_investigation(psi_id: str):
    investigations = load_investigations()

    for investigation in investigations:
        if investigation["psi_id"].lower() == psi_id.lower():
            return investigation

    raise HTTPException(
        status_code=404,
        detail="Investigation not found"
    )
