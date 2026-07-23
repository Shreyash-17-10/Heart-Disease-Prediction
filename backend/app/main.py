import json
import os
import pickle
from datetime import datetime
from typing import List, Optional

import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy import create_engine, Column, Integer, Float, String, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# ---------- Load model artifacts ----------
with open(os.path.join(BASE_DIR, "heart_model.pkl"), "rb") as f:
    model = pickle.load(f)
with open(os.path.join(BASE_DIR, "scaler.pkl"), "rb") as f:
    scaler = pickle.load(f)
with open(os.path.join(BASE_DIR, "metadata.json")) as f:
    metadata = json.load(f)

FEATURES = metadata["features"]
USES_SCALER = metadata["model"] == "Logistic Regression"  # XGBoost/RF use raw features

# ---------- Database (SQLite by default; set DATABASE_URL env var for Postgres) ----------
DATABASE_URL = os.environ.get("DATABASE_URL", f"sqlite:///{os.path.join(BASE_DIR, 'history.db')}")
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()


class PredictionRecord(Base):
    __tablename__ = "prediction_history"
    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    age = Column(Integer)
    sex = Column(Integer)
    inputs_json = Column(String)
    prediction = Column(Integer)
    confidence = Column(Float)


Base.metadata.create_all(bind=engine)

# ---------- App ----------
app = FastAPI(title="Heart Disease Prediction API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten this to your frontend's URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PatientInput(BaseModel):
    age: int = Field(..., ge=1, le=120)
    sex: int = Field(..., ge=0, le=1, description="1 = male, 0 = female")
    cp: int = Field(..., ge=0, le=3)
    trestbps: int = Field(..., ge=60, le=250)
    chol: int = Field(..., ge=80, le=700)
    fbs: int = Field(..., ge=0, le=1)
    restecg: int = Field(..., ge=0, le=2)
    thalach: int = Field(..., ge=50, le=250)
    exang: int = Field(..., ge=0, le=1)
    oldpeak: float = Field(..., ge=0, le=10)
    slope: int = Field(..., ge=0, le=2)
    ca: int = Field(..., ge=0, le=4)
    thal: int = Field(..., ge=0, le=3)


class PredictionResponse(BaseModel):
    prediction: int
    label: str
    confidence: float
    risk_factors: List[str]


@app.get("/")
def root():
    return {"status": "ok", "service": "Heart Disease Prediction API"}


@app.get("/api/metadata")
def get_metadata():
    return metadata


def flag_risk_factors(data: PatientInput) -> List[str]:
    flags = []
    if data.age >= 55:
        flags.append("Age 55 or older")
    if data.trestbps >= 140:
        flags.append("Elevated resting blood pressure")
    if data.chol >= 240:
        flags.append("High cholesterol")
    if data.fbs == 1:
        flags.append("Elevated fasting blood sugar")
    if data.thalach <= 120:
        flags.append("Lower than average max heart rate")
    if data.exang == 1:
        flags.append("Exercise-induced angina")
    if data.oldpeak >= 2:
        flags.append("Significant ST depression")
    if data.ca >= 1:
        flags.append("Blocked major vessel(s) detected")
    return flags


@app.post("/api/predict", response_model=PredictionResponse)
def predict(data: PatientInput):
    try:
        row = np.array([[getattr(data, f) for f in FEATURES]], dtype=float)
        model_input = scaler.transform(row) if USES_SCALER else row
        pred = int(model.predict(model_input)[0])
        proba = model.predict_proba(model_input)[0]
        confidence = float(proba[pred])

        record = PredictionRecord(
            age=data.age,
            sex=data.sex,
            inputs_json=json.dumps(data.dict()),
            prediction=pred,
            confidence=confidence,
        )
        db = SessionLocal()
        db.add(record)
        db.commit()
        db.close()

        return PredictionResponse(
            prediction=pred,
            label="At risk of heart disease" if pred == 1 else "Low risk of heart disease",
            confidence=round(confidence, 4),
            risk_factors=flag_risk_factors(data),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/history")
def get_history(limit: int = 20):
    db = SessionLocal()
    rows = (
        db.query(PredictionRecord)
        .order_by(PredictionRecord.created_at.desc())
        .limit(limit)
        .all()
    )
    db.close()
    return [
        {
            "id": r.id,
            "created_at": r.created_at.isoformat(),
            "age": r.age,
            "sex": r.sex,
            "prediction": r.prediction,
            "confidence": r.confidence,
        }
        for r in rows
    ]
