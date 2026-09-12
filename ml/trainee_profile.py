# KaushalSetu - Trainee Profile Builder

from data_reader import (
    get_trainee,
    get_trainee_skills,
    get_trainee_assessments,
     get_training_program
)


def build_trainee_profile(trainee_id):
    """
    Build a complete profile for one trainee
    using data from the PostgreSQL database.
    """

    trainee = get_trainee(trainee_id)
    skills_data = get_trainee_skills(trainee_id)
    assessments_data = get_trainee_assessments(trainee_id)

    if trainee is None:
        return None
    
    training_program = None

    if trainee[6] is not None:
        training_program = get_training_program(trainee[6])

    profile = {
        "trainee_id": trainee[0],
        "user_id": trainee[1],
        "district_id": trainee[2],
        "full_name": trainee[3],
        "phone": trainee[4],
        "date_of_birth": trainee[5],
        "training_program_id": trainee[6],

        "training_program": training_program,

        "skills": {},

        "assessments": []
    }

    # Convert skill rows into a dictionary
    for skill in skills_data:
        skill_name = skill[0]
        proficiency_level = skill[2]

        profile["skills"][skill_name] = proficiency_level

    # Store assessment information
    for assessment in assessments_data:
        profile["assessments"].append({
            "skill_id": assessment[0],
            "skill_name": assessment[1],
            "training_program_id": assessment[2],
            "score": float(assessment[3]),
            "assessed_at": assessment[4]
        })

    return profile

def calculate_average_assessment_score(profile):
    """
    Calculate the average assessment score for a trainee.
    """

    assessments = profile["assessments"]

    if not assessments:
        return 0

    total = sum(
        assessment["score"]
        for assessment in assessments
    )

    average = total / len(assessments)

    return round(average, 2)


def calculate_training_score(profile):
    """
    Prototype training score.

    100 = trainee has a training program
    0   = trainee has no training program
    """

    if profile["training_program"] is not None:
        return 100

    return 0