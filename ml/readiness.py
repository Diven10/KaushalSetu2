# KaushalSetu - Career Readiness Engine


def calculate_readiness_score(
    skill_match_score,
    assessment_score,
    certification_score,
    training_score
):
    """
    Calculate overall career readiness score.

    All inputs should be between 0 and 100.
    """

    readiness_score = (
        skill_match_score * 0.40
        + assessment_score * 0.25
        + certification_score * 0.20
        + training_score * 0.15
    )

    return round(readiness_score, 2)


def readiness_level(score):
    """
    Convert readiness score into a human-readable level.
    """

    if score >= 80:
        return "HIGH"
    elif score >= 60:
        return "MEDIUM"
    elif score >= 40:
        return "LOW"
    else:
        return "VERY LOW"