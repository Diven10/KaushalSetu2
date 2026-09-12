from database import get_connection


def get_placement_features(trainee_id, job_id):

    conn = get_connection()
    cursor = conn.cursor()

    query = """
        SELECT
            t.training_program_id,

            COUNT(DISTINCT ts.skill_id) AS trainee_skill_count,

            COUNT(DISTINCT js.skill_id) AS required_skill_count,

            COUNT(
                DISTINCT CASE
                    WHEN ts.skill_id = js.skill_id
                    THEN ts.skill_id
                END
            ) AS matched_skill_count,

            COALESCE(
                (
                    SELECT AVG(a.score)
                    FROM assessments a
                    WHERE a.trainee_id = t.id
                ),
                0
            ) AS average_assessment_score

        FROM trainees t

        LEFT JOIN trainee_skills ts
            ON t.id = ts.trainee_id

        LEFT JOIN job_skills js
            ON js.job_id = %s

        WHERE t.id = %s

        GROUP BY t.id;
    """

    cursor.execute(
        query,
        (job_id, trainee_id)
    )

    row = cursor.fetchone()

    cursor.close()
    conn.close()

    if row is None:
        return None

    (
        training_program_id,
        trainee_skill_count,
        required_skill_count,
        matched_skill_count,
        average_assessment_score
    ) = row

    if required_skill_count > 0:
        skill_match_percentage = (
            matched_skill_count /
            required_skill_count
        ) * 100
    else:
        skill_match_percentage = 0

    has_training = (
        1 if training_program_id is not None else 0
    )

    return [
        float(skill_match_percentage),
        float(average_assessment_score),
        float(trainee_skill_count),
        float(required_skill_count),
        float(matched_skill_count),
        float(has_training)
    ]