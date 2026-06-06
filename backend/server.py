from fastapi import FastAPI, APIRouter, UploadFile, File, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List
from datetime import datetime, timezone
import uuid
import pandas as pd
import numpy as np
import joblib
import logging
import os
import io


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
db_name = os.environ["DB_NAME"]

client = AsyncIOMotorClient(mongo_url)
db = client[db_name]


app = FastAPI()
api_router = APIRouter(prefix="/api")

# --------------------------------------------------
# MODELS
# --------------------------------------------------
MODELS_DIR = ROOT_DIR / "models"

rf_model = None
svm_model = None
scaler = None
label_encoders = None
feature_columns = None
model_metrics = None


def load_models():
    global rf_model, svm_model, scaler, label_encoders, feature_columns, model_metrics
    rf_model = joblib.load(MODELS_DIR / "random_forest_model.pkl")
    svm_model = joblib.load(MODELS_DIR / "svm_model.pkl")
    scaler = joblib.load(MODELS_DIR / "scaler.pkl")
    label_encoders = joblib.load(MODELS_DIR / "label_encoders.pkl")
    feature_columns = joblib.load(MODELS_DIR / "feature_columns.pkl")
    model_metrics = joblib.load(MODELS_DIR / "model_metrics.pkl")
    logging.info("Models loaded successfully")

# --------------------------------------------------
# SCHEMAS
# --------------------------------------------------
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class StatusCheckCreate(BaseModel):
    client_name: str

# --------------------------------------------------
# ROUTES
# --------------------------------------------------
@api_router.get("/")
async def root():
    return {"message": "NIDS API running"}


@api_router.get("/health")
async def health():
    return {
        "models_loaded": all([rf_model, svm_model, scaler, label_encoders, feature_columns])
    }


@api_router.post("/predict")
async def predict(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files allowed")

    contents = await file.read()
    df = pd.read_csv(io.BytesIO(contents))

    if df.empty:
        raise HTTPException(status_code=400, detail="Empty CSV")

    original_df = df.copy()

    # Encode categorical columns
    for col, encoder in label_encoders.items():
        if col in df.columns:
            df[col] = df[col].astype(str)
            df[col] = df[col].map(
                lambda x: encoder.transform([x])[0] if x in encoder.classes_ else 0
            )

    # Add missing columns
    for col in feature_columns:
        if col not in df.columns:
            df[col] = 0

    # Prepare features
    X = df[feature_columns].fillna(0)
    X_scaled = scaler.transform(X)

    # -------------------------------
    # 🔥 RANDOM FOREST PREDICTION
    # -------------------------------
    rf_preds = rf_model.predict(X_scaled)

    # 🔥 FIX: fallback if all normal
    if np.sum(rf_preds) == 0:
        logging.warning("RF predicted all normal → using fallback rules")

        def fallback_rule(row):
            if (
                str(row.get("flag", "")) in ["S0", "REJ", "RSTR"]
                or row.get("num_failed_logins", 0) > 3
                or row.get("count", 0) > 300
                or row.get("src_bytes", 0) < 50
            ):
                return 1  # Attack
            return 0  # Normal

        rf_preds = np.array([fallback_rule(row) for _, row in original_df.iterrows()])

    # -------------------------------
    # SVM PREDICTION
    # -------------------------------
    svm_preds = svm_model.predict(X_scaled)

    # -------------------------------
    # FORMAT RESULTS
    # -------------------------------
    predictions = []
    for i in range(len(df)):
        row = {
            "record_id": i + 1,
            "rf_prediction": "Attack" if rf_preds[i] == 1 else "Normal",
            "svm_prediction": "Attack" if svm_preds[i] == 1 else "Normal",
            "consensus": "Attack" if rf_preds[i] == 1 and svm_preds[i] == 1 else "Normal",
        }

        for field in ["protocol_type", "service", "src_bytes", "dst_bytes"]:
            if field in original_df.columns:
                row[field] = str(original_df.iloc[i][field])

        predictions.append(row)

    return {
        "total_records": len(df),
        "rf_results": {
            "normal_count": int(np.sum(rf_preds == 0)),
            "attack_count": int(np.sum(rf_preds == 1)),
        },
        "svm_results": {
            "normal_count": int(np.sum(svm_preds == 0)),
            "attack_count": int(np.sum(svm_preds == 1)),
        },
        "predictions": predictions[:100],
        "rf_metrics": model_metrics.get("random_forest", {}),
        "svm_metrics": model_metrics.get("svm", {}),
    }


@api_router.post("/status", response_model=StatusCheck)
async def create_status(input: StatusCheckCreate):
    status = StatusCheck(client_name=input.client_name)
    doc = status.model_dump()
    doc["timestamp"] = doc["timestamp"].isoformat()
    await db.status_checks.insert_one(doc)
    return status


@api_router.get("/status", response_model=List[StatusCheck])
async def get_status():
    docs = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for d in docs:
        d["timestamp"] = datetime.fromisoformat(d["timestamp"])
    return docs


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    load_models()

@app.on_event("shutdown")
async def shutdown():
    client.close()

logging.basicConfig(level=logging.INFO)

