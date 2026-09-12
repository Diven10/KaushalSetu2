"""Orchestration layer for the KaushalSetu Career Digital Twin."""

from data_reader import (
    get_required_skill_scores,
    get_open_job_for_occupation,
    get_occupation,
    get_employment_features,
)

from trainee_profile import (
    build_trainee_profile,
    calculate_average_assessment_score,
    calculate_training_score,
)

from skill_gap import (
    calculate_skill_gaps,
    calculate_skill_match_score,
)

from readiness import (
    calculate_readiness_score,
    readiness_level,
)

from placement_features import get_placement_features
from placement_predictor import predict_placement

from employment_risk_predictor import predict_employment_risk

from explainability import (
    explain_placement,
    explain_employment_risk,
    build_unified_explanation,
)


def get_career_twin(trainee_id, occupation_id, job_id=None):
    """
    Build the complete Career Digital Twin for a trainee.

    Returns a stable response contract consumed by the
    Career Twin test and future FastAPI endpoint.
    """

    # ---------------------------------------------------------
    # 1. TRAINEE PROFILE
    # ---------------------------------------------------------

    profile = build_trainee_profile(trainee_id)

    if profile is None:
        return {
            "status": "NOT_FOUND",
            "message": "Trainee not found",
        }

    # ---------------------------------------------------------
    # 2. OCCUPATION
    # ---------------------------------------------------------

    occupation = get_occupation(occupation_id)

    if occupation is None:
        return {
            "status": "NOT_FOUND",
            "message": "Occupation not found",
        }

    # ---------------------------------------------------------
    # 3. SKILL GAP ANALYSIS
    # ---------------------------------------------------------

    required_skills = get_required_skill_scores(
        occupation_id,
        profile["district_id"],
    )

    skill_gaps = calculate_skill_gaps(
        profile["skills"],
        required_skills,
    )

    skill_match_score = calculate_skill_match_score(
        profile["skills"],
        required_skills,
    )

    # ---------------------------------------------------------
    # 4. READINESS
    # ---------------------------------------------------------

    assessment_score = calculate_average_assessment_score(
        profile
    )

    training_score = calculate_training_score(
        profile
    )

    certification_score = 0

    readiness_score = calculate_readiness_score(
        skill_match_score,
        assessment_score,
        certification_score,
        training_score,
    )

    readiness_status = readiness_level(
        readiness_score
    )

    # ---------------------------------------------------------
    # 5. JOB SELECTION
    # ---------------------------------------------------------

    if job_id is None:

        job = get_open_job_for_occupation(
            occupation_id
        )

        if job:
            job_id = job[0]

    # ---------------------------------------------------------
    # 6. PLACEMENT PREDICTION
    # ---------------------------------------------------------

    placement = None
    placement_explanation = None

    if job_id is not None:

        placement_features = get_placement_features(
            trainee_id,
            job_id,
        )

        if placement_features is not None:

            placement_prediction = predict_placement(
                placement_features
            )

            # Career Twin response contract
            placement = {
                "prediction": placement_prediction
            }

            placement_explanation = explain_placement(
                placement_features,
                placement_prediction,
            )

    # ---------------------------------------------------------
    # 7. EMPLOYMENT RISK
    # ---------------------------------------------------------

    employment_risk = None
    employment_risk_explanation = None

    risk_features = get_employment_features(
        trainee_id
    )

    if risk_features is not None:

        employment_risk = predict_employment_risk(
            risk_features
        )

        employment_risk_explanation = (
            explain_employment_risk(
                risk_features,
                employment_risk,
            )
        )

    # ---------------------------------------------------------
    # 8. UNIFIED EXPLANATION
    # ---------------------------------------------------------

    explanation = build_unified_explanation(
        placement_explanation,
        employment_risk_explanation,
        skill_gaps,
    )

    # ---------------------------------------------------------
    # 9. CAREER DIGITAL TWIN RESPONSE
    # ---------------------------------------------------------

    return {
        "status": "SUCCESS",

        "trainee": {
            "trainee_id": profile["trainee_id"],
            "full_name": profile["full_name"],
            "district_id": profile["district_id"],
        },

        "career_target": {
            "occupation_id": occupation[0],
            "occupation_name": occupation[1],
            "job_id": job_id,
        },

        "skill_analysis": {
            "skill_match_score": skill_match_score,
            "skill_gaps": skill_gaps,
        },

        "readiness": {
            "readiness_score": readiness_score,
            "readiness_level": readiness_status,
        },

        "placement": placement,

        "employment_risk": employment_risk,

        "explainability": explanation,

        "recommendations": explanation.get(
            "what_next",
            [],
        ),
    }