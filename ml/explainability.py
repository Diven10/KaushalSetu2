# KaushalSetu - Explainability Layer


def explain_employment_risk(features, prediction):
    """
    Explain an employment risk prediction.

    Features:
        [
            salary,
            employment_months,
            trainee_skill_count,
            has_training
        ]
    """

    salary = features[0]
    employment_months = features[1]
    trainee_skill_count = features[2]
    has_training = features[3]

    risk_percentage = prediction["risk_percentage"]
    risk_level = prediction["risk_level"]

    why = []
    what_next = []

    # Employment duration
    if employment_months < 6:
        why.append(
            "Employment duration is relatively short."
        )
        what_next.append(
            "Monitor employment stability during the early months."
        )

    # Skill count
    if trainee_skill_count < 5:
        why.append(
            "Trainee has a relatively low number of recorded skills."
        )
        what_next.append(
            "Develop additional job-relevant skills."
        )

    # Training
    if has_training == 0:
        why.append(
            "Trainee does not have a recorded training program."
        )
        what_next.append(
            "Consider relevant skill training or upskilling."
        )

    # Salary
    if salary < 200000:
        why.append(
            "Salary is relatively low for the current employment record."
        )
        what_next.append(
            "Explore opportunities for skill development and salary progression."
        )

    # General risk explanation
    if not why:
        if risk_level == "HIGH":
            why.append(
                "The model estimates a high probability of employment ending."
            )
        elif risk_level == "MEDIUM":
            why.append(
                "The model estimates a moderate probability of employment ending."
            )
        else:
            why.append(
                "The available employment indicators suggest relatively low risk."
            )

    return {
        "risk_probability": risk_percentage,
        "risk_level": risk_level,
        "why": why,
        "what_next": what_next
    }
def explain_placement(features, prediction):
    """
    Explain a placement prediction.

    Features:
        [
            skill_match_percentage,
            average_assessment_score,
            trainee_skill_count,
            required_skill_count,
            matched_skill_count,
            has_training
        ]
    """

    skill_match_percentage = features[0]
    average_assessment_score = features[1]
    trainee_skill_count = features[2]
    required_skill_count = features[3]
    matched_skill_count = features[4]
    has_training = features[5]

    placement_percentage = prediction["placement_percentage"]
    prediction_level = prediction["prediction"]

    why = []
    what_next = []

    # Skill match
    if skill_match_percentage >= 75:
        why.append(
            "Strong alignment between trainee skills and job requirements."
        )
    elif skill_match_percentage >= 50:
        why.append(
            "Moderate alignment between trainee skills and job requirements."
        )
        what_next.append(
            "Improve skills that are missing from the target job requirements."
        )
    else:
        why.append(
            "Low alignment between trainee skills and job requirements."
        )
        what_next.append(
            "Focus on developing the skills required by the target job."
        )

    # Assessment
    if average_assessment_score >= 75:
        why.append(
            "Strong assessment performance."
        )
    elif average_assessment_score < 50:
        why.append(
            "Assessment performance is relatively low."
        )
        what_next.append(
            "Improve assessment performance through additional practice."
        )

    # Training
    if has_training == 1:
        why.append(
            "Trainee has a recorded training program."
        )
    else:
        what_next.append(
            "Consider completing relevant vocational or technical training."
        )

    # Required skill coverage
    if required_skill_count > 0:

        coverage = (
            matched_skill_count /
            required_skill_count
        ) * 100

        if coverage < 50:
            what_next.append(
                "Close the major skill gaps before applying for similar jobs."
            )

    # Fallback
    if not what_next:
        what_next.append(
            "Continue developing skills relevant to the target occupation."
        )

    return {
        "placement_probability": placement_percentage,
        "prediction": prediction_level,
        "why": why,
        "what_next": what_next
    }
def build_unified_explanation(
    placement_explanation=None,
    employment_risk_explanation=None,
    skill_gaps=None
):
    """
    Combine placement, employment-risk, and skill-gap
    explanations into one standardized response.
    """

    result = {
        "placement": placement_explanation,
        "employment_risk": employment_risk_explanation,
        "skill_gaps": [],
        "what_next": []
    }

    # Add important skill gaps
    if skill_gaps:

        for skill, data in skill_gaps.items():

            if data["priority"] in ["HIGH", "CRITICAL"]:

                result["skill_gaps"].append({
                    "skill": skill,
                    "gap": data["gap"],
                    "priority": data["priority"],
                    "status": data["status"]
                })

                result["what_next"].append(
                    f"Improve {skill} proficiency."
                )

    # Add placement actions
    if placement_explanation:

        for action in placement_explanation.get(
            "what_next",
            []
        ):
            if action not in result["what_next"]:
                result["what_next"].append(action)

    # Add employment-risk actions
    if employment_risk_explanation:

        for action in employment_risk_explanation.get(
            "what_next",
            []
        ):
            if action not in result["what_next"]:
                result["what_next"].append(action)

    return result