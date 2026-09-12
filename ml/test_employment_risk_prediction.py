from employment_risk_predictor import (
    predict_employment_risk
)


features = [
    200000.0,  # salary
    5.5,       # employment duration in months
    5,         # trainee skill count
    1          # has training
]


result = predict_employment_risk(
    features
)


print("\n================================")
print("   EMPLOYMENT RISK PREDICTION")
print("================================")

print(
    "Risk Probability:",
    result["risk_percentage"],
    "%"
)

print(
    "Risk Level:",
    result["risk_level"]
)