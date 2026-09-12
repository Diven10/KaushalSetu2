# KaushalSetu - Employment Risk Dataset Builder

from database import get_connection


def get_employment_risk_data():
    """
    Build historical employment data for the
    employment/retention risk model.
    """

    conn = get_connection()
    cursor = conn.cursor()

    query = """
        SELECT
            e.trainee_id,
            e.employer_id,
            e.occupation_id,
            e.district_id,
            e.salary,
            e.start_date,
            e.end_date,

            COUNT(DISTINCT ts.skill_id) AS trainee_skill_count,

            CASE
                WHEN t.training_program_id IS NOT NULL
                THEN 1
                ELSE 0
            END AS has_training

        FROM employment e

        JOIN trainees t
            ON e.trainee_id = t.id

        LEFT JOIN trainee_skills ts
            ON t.id = ts.trainee_id

        GROUP BY
            e.id,
            e.trainee_id,
            e.employer_id,
            e.occupation_id,
            e.district_id,
            e.salary,
            e.start_date,
            e.end_date,
            t.training_program_id;
    """

    cursor.execute(query)

    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    return rows

from datetime import date


def prepare_employment_features(rows):
    """
    Convert employment records into ML-ready features.

    Target:
        1 = currently employed
        0 = employment ended
    """

    X = []
    y = []

    for row in rows:

        (
            trainee_id,
            employer_id,
            occupation_id,
            district_id,
            salary,
            start_date,
            end_date,
            trainee_skill_count,
            has_training
        ) = row

        if end_date is not None:
            end_reference = end_date
        else:
            end_reference = date.today()

        employment_days = (
            end_reference - start_date
        ).days

        employment_months = (
            employment_days / 30.44
        )

        employment_months = max(
            employment_months,
            0
        )

        salary_value = (
            float(salary)
            if salary is not None
            else 0.0
        )

        features = [
            salary_value,
            float(employment_months),
            float(trainee_skill_count),
            float(has_training)
        ]

        if end_date is None:
            outcome = 1
        else:
            outcome = 0

        X.append(features)
        y.append(outcome)

    return X, y