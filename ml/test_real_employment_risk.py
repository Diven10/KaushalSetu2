from employment_risk_dataset import (
    get_employment_risk_data,
    prepare_employment_features
)

from employment_risk_predictor import (
    predict_employment_risk
)


data = get_employment_risk_data()

X, y = prepare_employment_features(data)


# Use the first real employment record
features = X[0]

result = predict_employment_risk(features)


print("\n================================")
print("   REAL EMPLOYMENT RISK")
print("================================")

print("Features:")
print(features)

print(
    "\nRisk Probability:",
    result["risk_percentage"],
    "%"
)

print(
    "Risk Level:",
    result["risk_level"]
)