from placement_features import get_placement_features
from placement_predictor import predict_placement


trainee_id = 1
job_id = 1


features = get_placement_features(
    trainee_id,
    job_id
)


if features is None:

    print("Trainee or job not found.")

else:

    result = predict_placement(features)

    print("\n================================")
    print("   REAL PLACEMENT PREDICTION")
    print("================================")

    print("Trainee ID:", trainee_id)
    print("Job ID:", job_id)

    print("\nFeatures:")
    print(features)

    print("\nPlacement Probability:",
          result["placement_percentage"], "%")

    print("Prediction:",
          result["prediction"])