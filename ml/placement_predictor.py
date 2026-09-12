from pathlib import Path
import joblib

MODEL_PATH = Path(__file__).resolve().parent / "placement_model.pkl"


def _load_model():
    if not MODEL_PATH.exists():
        from placement_model import train_model
        train_model()
    return joblib.load(MODEL_PATH)


def predict_placement(features):
    if len(features) != 6:
        raise ValueError("Placement features must contain exactly 6 values.")
    model = _load_model()
    probability = model.predict_proba([features])[0][1]
    if probability >= 0.80:
        prediction = "HIGHLY LIKELY"
    elif probability >= 0.60:
        prediction = "LIKELY"
    elif probability >= 0.40:
        prediction = "MODERATE"
    else:
        prediction = "UNLIKELY"
    return {
        "placement_probability": round(float(probability), 4),
        "placement_percentage": round(float(probability) * 100, 2),
        "prediction": prediction,
    }
