from placement_predictor import predict_placement

from explainability import explain_placement


features = [
    75.0,   # skill match percentage
    80.0,   # average assessment score
    8,      # trainee skill count
    6,      # required skill count
    5,      # matched skill count
    1       # has training
]


prediction = predict_placement(
    features
)


explanation = explain_placement(
    features,
    prediction
)


print("\n================================")
print("   PLACEMENT EXPLANATION")
print("================================")

print(
    "Placement Probability:",
    explanation["placement_probability"],
    "%"
)

print(
    "Prediction:",
    explanation["prediction"]
)

print("\nWHY?")

for reason in explanation["why"]:
    print("•", reason)

print("\nWHAT NEXT?")

for action in explanation["what_next"]:
    print("→", action)