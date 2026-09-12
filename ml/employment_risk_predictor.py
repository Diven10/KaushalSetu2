from pathlib import Path
import joblib

MODEL_PATH = Path(__file__).resolve().parent / "employment_risk_model.pkl"


def _load_model():
    if not MODEL_PATH.exists():
        from employment_risk_model import train_model
        train_model()
    return joblib.load(MODEL_PATH)


def predict_employment_risk(features):
    if len(features) != 4:
        raise ValueError("Employment-risk features must contain exactly 4 values.")
    model = _load_model()
    risk_probability = model.predict_proba([features])[0][0]
    if risk_probability >= 0.80:
        risk_level = "CRITICAL"
    elif risk_probability >= 0.60:
        risk_level = "HIGH"
    elif risk_probability >= 0.40:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"
    return {
        "risk_probability": round(float(risk_probability), 4),
        "risk_percentage": round(float(risk_probability) * 100, 2),
        "risk_level": risk_level,
    }
