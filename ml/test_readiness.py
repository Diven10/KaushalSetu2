from readiness import (
    calculate_readiness_score,
    readiness_level
)


# Example trainee data

skill_match_score = 72
assessment_score = 78
certification_score = 100
training_score = 85


score = calculate_readiness_score(
    skill_match_score,
    assessment_score,
    certification_score,
    training_score
)

level = readiness_level(score)


print("\n===== CAREER READINESS =====")
print(f"Readiness Score: {score}/100")
print(f"Readiness Level: {level}")