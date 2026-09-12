from placement_dataset import (
    get_placement_data,
    prepare_placement_features
)


data = get_placement_data()

X, y = prepare_placement_features(data)


print("\n================================")
print("   PLACEMENT ML DATASET")
print("================================")

print("Total records:", len(X))

print("\nFirst 5 feature rows:")

for row in X[:5]:
    print(row)

print("\nFirst 5 target values:")

print(y[:5])

print("\nFeature count:", len(X[0]))