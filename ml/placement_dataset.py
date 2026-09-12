# KaushalSetu - Placement Prediction Dataset Builder

from database import get_connection


def get_placement_data():
    """
    Build historical placement prediction data.

    Each row represents one application with:
    - trainee skills
    - job required skills
    - assessment performance
    - district
    - training program
    - placement outcome
    """

    conn = get_connection()
    cursor = conn.cursor()

    query = """
        SELECT
            a.trainee_id,
            a.job_id,
            a.status,
            t.district_id,
            t.training_program_id,

            COUNT(DISTINCT ts.skill_id) AS trainee_skill_count,

            COUNT(DISTINCT js.skill_id) AS required_skill_count,

            COUNT(
                DISTINCT CASE
                    WHEN ts.skill_id = js.skill_id
                    THEN ts.skill_id
                END
            ) AS matched_skill_count,

            COALESCE(AVG(ass.score), 0) AS average_assessment_score

        FROM applications a

        JOIN trainees t
            ON a.trainee_id = t.id

        JOIN jobs j
            ON a.job_id = j.id

        LEFT JOIN trainee_skills ts
            ON t.id = ts.trainee_id

        LEFT JOIN job_skills js
            ON j.id = js.job_id

        LEFT JOIN assessments ass
            ON t.id = ass.trainee_id

        WHERE a.status IN ('hired', 'rejected')

        GROUP BY
            a.trainee_id,
            a.job_id,
            a.status,
            t.district_id,
            t.training_program_id;
    """

    cursor.execute(query)

    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    return rows

def prepare_placement_features(rows):
    """
    Convert raw placement records into ML-ready features.

    Returns:
        X = feature rows
        y = placement outcomes
    """

    X = []
    y = []

    for row in rows:

        (
            trainee_id,
            job_id,
            status,
            district_id,
            training_program_id,
            trainee_skill_count,
            required_skill_count,
            matched_skill_count,
            average_assessment_score
        ) = row

        # Calculate skill match percentage
        if required_skill_count > 0:
            skill_match_percentage = (
                matched_skill_count / required_skill_count
            ) * 100
        else:
            skill_match_percentage = 0

        # Training program feature
        has_training = 1 if training_program_id is not None else 0

        # ML features
        features = [
             float(skill_match_percentage),
             float(average_assessment_score),
             float(trainee_skill_count),
             float(required_skill_count),
             float(matched_skill_count),
             float(has_training)
        ]

        # Target variable
        if status == "hired":
            outcome = 1
        else:
            outcome = 0

        X.append(features)
        y.append(outcome)

    return X, y