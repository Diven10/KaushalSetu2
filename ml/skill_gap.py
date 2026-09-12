# KaushalSetu - Skill Gap Engine


# Convert database proficiency levels into numerical scores.
# These values are used only for prototype calculations.

PROFICIENCY_SCORE = {
    "beginner": 40,
    "intermediate": 70,
    "advanced": 90
}


def proficiency_to_score(level):
    """
    Convert a proficiency level into a numerical score.
    """

    return PROFICIENCY_SCORE.get(level.lower(), 0)


def calculate_skill_gaps(current_skills, required_skills):
    """
    Compare a trainee's current skills with the skills
    required for their target occupation.

    current_skills:
        {
            "SQL": "advanced",
            "Python": "intermediate"
        }

    required_skills:
        {
            "SQL": 80,
            "Python": 70
        }

    Returns:
        Dictionary containing skill gaps.
    """

    results = {}

    for skill, required_score in required_skills.items():

        # If the trainee does not have the skill,
        # consider their current proficiency as 0.
        current_level = current_skills.get(skill)

        if current_level is None:
            current_score = 0
        else:
            current_score = proficiency_to_score(current_level)

        # Calculate how far the trainee is from the requirement.
        gap = max(required_score - current_score, 0)

        # Determine priority.
        if gap == 0:
            status = "GOOD"
            priority = "LOW"

        elif gap <= 10:
            status = "SLIGHT GAP"
            priority = "MEDIUM"

        elif gap <= 25:
            status = "MODERATE GAP"
            priority = "HIGH"

        else:
            status = "CRITICAL GAP"
            priority = "CRITICAL"

        results[skill] = {
            "current_level": current_level or "not available",
            "current_score": current_score,
            "required_score": required_score,
            "gap": gap,
            "status": status,
            "priority": priority
        }

    return results

def calculate_skill_match_score(current_skills, required_skills):
    """
    Calculate how closely a trainee's skills match
    the requirements of an occupation.

    Returns a score between 0 and 100.
    """

    if not required_skills:
        return 0

    total_score = 0

    for skill, required_score in required_skills.items():

        current_level = current_skills.get(skill)

        if current_level is None:
            current_score = 0
        else:
            current_score = proficiency_to_score(current_level)

        # Don't allow a trainee to receive more than
        # 100% credit for exceeding the requirement.
        skill_match = min(current_score / required_score, 1)

        total_score += skill_match

    match_score = (total_score / len(required_skills)) * 100

    return round(match_score, 2)