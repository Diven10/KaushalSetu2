from pathlib import Path
import joblib
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split
from placement_dataset import get_placement_data, prepare_placement_features

MODEL_PATH = Path(__file__).resolve().parent / "placement_model.pkl"


def train_model():
    data = get_placement_data()
    X, y = prepare_placement_features(data)
    if len(X) < 2 or len(set(y)) < 2:
        raise RuntimeError("Placement training data must contain at least two records and both outcome classes.")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    model = LogisticRegression(max_iter=1000, class_weight="balanced")
    model.fit(X_train, y_train)
    predictions = model.predict(X_test)
    print("\n================================")
    print("   PLACEMENT MODEL")
    print("================================")
    print("Training records:", len(X_train))
    print("Testing records:", len(X_test))
    print("Accuracy:", round(accuracy_score(y_test, predictions) * 100, 2), "%")
    print("\nClassification Report:")
    print(classification_report(y_test, predictions, zero_division=0))
    joblib.dump(model, MODEL_PATH)
    print("\nModel saved as:")
    print(MODEL_PATH)
    return model


if __name__ == "__main__":
    train_model()
