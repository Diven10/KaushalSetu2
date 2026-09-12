from employment_risk_dataset import (
    get_employment_risk_data,
    prepare_employment_features
)


data = get_employment_risk_data()

X, y = prepare_employment_features(data)


print("\n================================")
print("   EMPLOYMENT RISK DATASET")
print("================================")

print("Total records:", len(X))

print("\nFirst 5 feature rows:")

for row in X[:5]:
    print(row)

print("\nFirst 5 target values:")

print(y[:5])

print("\nFeature count:", len(X[0]))
