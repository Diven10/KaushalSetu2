from employment_risk_dataset import (
    get_employment_risk_data,
    prepare_employment_features
)

from employment_risk_predictor import (
    predict_employment_risk
)

from explainability import (
    explain_employment_risk
)


# Get real database data
data = get_employment_risk_data()

X, y = prepare_employment_features(data)

# Use first real employment record
features = X[0]

# Get ML prediction
prediction = predict_employment_risk(features)

# Get explanation
explanation = explain_employment_risk(
    features,
    prediction
)


print("\n================================")
print("   EMPLOYMENT RISK EXPLANATION")
print("================================")

print(
    "Risk Probability:",
    explanation["risk_probability"],
    "%"
)

print(
    "Risk Level:",
    explanation["risk_level"]
)

print("\nWHY?")

for reason in explanation["why"]:
    print("•", reason)

print("\nWHAT NEXT?")

for action in explanation["what_next"]:
    print("→", action)