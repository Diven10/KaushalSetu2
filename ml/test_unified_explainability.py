from explainability import build_unified_explanation


placement_explanation = {
    "placement_probability": 74.5,
    "prediction": "LIKELY",
    "why": [
        "Strong alignment between trainee skills and job requirements.",
        "Strong assessment performance."
    ],
    "what_next": [
        "Continue developing skills relevant to the target occupation."
    ]
}


employment_risk_explanation = {
    "risk_probability": 31.2,
    "risk_level": "LOW",
    "why": [
        "The available employment indicators suggest relatively low risk."
    ],
    "what_next": [
        "Continue developing skills relevant to the current occupation."
    ]
}


skill_gaps = {
    "Python": {
        "current_level": "beginner",
        "current_score": 40,
        "required_score": 90,
        "gap": 50,
        "status": "CRITICAL GAP",
        "priority": "CRITICAL"
    },

    "SQL": {
        "current_level": "intermediate",
        "current_score": 70,
        "required_score": 70,
        "gap": 0,
        "status": "GOOD",
        "priority": "LOW"
    }
}


result = build_unified_explanation(
    placement_explanation,
    employment_risk_explanation,
    skill_gaps
)


print("\n================================")
print("   UNIFIED EXPLAINABILITY")
print("================================")

print("\nPLACEMENT:")
print(result["placement"])

print("\nEMPLOYMENT RISK:")
print(result["employment_risk"])

print("\nSKILL GAPS:")

for gap in result["skill_gaps"]:
    print(
        f"• {gap['skill']} - "
        f"{gap['status']} - "
        f"Priority: {gap['priority']}"
    )

print("\nWHAT NEXT:")

for action in result["what_next"]:
    print("→", action)