"""Train and save both predictive model artifacts."""
from placement_model import train_model as train_placement
from employment_risk_model import train_model as train_risk

if __name__ == "__main__":
    train_placement()
    train_risk()
    print("\nALL MODEL ARTIFACTS CREATED SUCCESSFULLY")
