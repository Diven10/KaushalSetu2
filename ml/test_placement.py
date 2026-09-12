from placement_predictor import predict_placement


features = [
    75.0,   # skill match percentage
    80.0,   # average assessment score
    8,      # trainee skill count
    6,      # required skill count
    5,      # matched skill count
    1       # has training
]


result = predict_placement(features)


print("\n================================")
print("   PLACEMENT PREDICTION")
print("================================")

print("Placement Probability:",
      result["placement_percentage"], "%")

print("Prediction:",
      result["prediction"])