from skill_gap import (
    calculate_skill_gaps,
    calculate_skill_match_score
)

# Example trainee
current_skills = {
    "SQL": "advanced",
    "Python": "intermediate",
    "Excel": "advanced",
    "Power BI": "beginner",
    "Statistics": "advanced"
}


# Skills required for a Data Analyst
required_skills = {
    "SQL": 80,
    "Python": 70,
    "Excel": 75,
    "Power BI": 70,
    "Statistics": 65
}


results = calculate_skill_gaps(
    current_skills,
    required_skills
)


print("\n===== SKILL GAP ANALYSIS =====")

for skill, data in results.items():

    print(f"\n{skill}")
    print(f"Current Level: {data['current_level']}")
    print(f"Current Score: {data['current_score']}")
    print(f"Required Score: {data['required_score']}")
    print(f"Gap: {data['gap']}")
    print(f"Status: {data['status']}")
    print(f"Priority: {data['priority']}")

    match_score = calculate_skill_match_score(
    current_skills,
    required_skills
)

print("\n===== SKILL MATCH SCORE =====")
print(f"Skill Match Score: {match_score}/100")