# KaushalSetu - Data Reader
# Reads trainee information from the PostgreSQL database

from database import get_connection


def get_trainee(trainee_id):
    """Fetch basic information about a trainee."""

    conn = get_connection()
    cursor = conn.cursor()

    query = """
        SELECT
            id,
            user_id,
            district_id,
            full_name,
            phone,
            date_of_birth,
            training_program_id
        FROM trainees
        WHERE id = %s;
    """

    cursor.execute(query, (trainee_id,))
    trainee = cursor.fetchone()

    cursor.close()
    conn.close()

    return trainee


def get_trainee_skills(trainee_id):
    """Fetch skills and proficiency levels for a trainee."""

    conn = get_connection()
    cursor = conn.cursor()

    query = """
        SELECT
            s.name,
            s.category,
            ts.proficiency_level
        FROM trainee_skills ts
        JOIN skills s
            ON ts.skill_id = s.id
        WHERE ts.trainee_id = %s
        ORDER BY s.name;
    """

    cursor.execute(query, (trainee_id,))
    skills = cursor.fetchall()

    cursor.close()
    conn.close()

    return skills


def get_trainee_assessments(trainee_id):
    """Fetch assessment information for a trainee."""

    conn = get_connection()
    cursor = conn.cursor()

    query = """
        SELECT
            a.skill_id,
            s.name,
            a.training_program_id,
            a.score,
            a.assessed_at
        FROM assessments a
        LEFT JOIN skills s
            ON a.skill_id = s.id
        WHERE a.trainee_id = %s
        ORDER BY a.assessed_at;
    """

    cursor.execute(query, (trainee_id,))
    assessments = cursor.fetchall()

    cursor.close()
    conn.close()

    return assessments

def get_occupation_required_skills(occupation_id, district_id=None):
    """
    Fetch required skills for an occupation from skill demand data.

    If district_id is provided, use demand for that district.
    Otherwise, use occupation-level demand across all districts.
    """

    conn = get_connection()
    cursor = conn.cursor()

    if district_id is not None:

        query = """
            SELECT
                s.name,
                sd.demand_score
            FROM skill_demand sd
            JOIN skills s
                ON sd.skill_id = s.id
            WHERE sd.occupation_id = %s
              AND sd.district_id = %s
            ORDER BY sd.demand_score DESC;
        """

        cursor.execute(query, (occupation_id, district_id))

    else:

        query = """
            SELECT
                s.name,
                MAX(sd.demand_score) AS demand_score
            FROM skill_demand sd
            JOIN skills s
                ON sd.skill_id = s.id
            WHERE sd.occupation_id = %s
            GROUP BY s.name
            ORDER BY demand_score DESC;
        """

        cursor.execute(query, (occupation_id,))

    skills = cursor.fetchall()

    cursor.close()
    conn.close()

    return skills

def get_required_skill_scores(occupation_id, district_id=None):
    """
    Convert market demand scores into required proficiency scores.

    Demand >= 75  -> Advanced requirement (90)
    Demand >= 60  -> Intermediate requirement (70)
    Demand < 60   -> Beginner requirement (40)
    """

    demand_skills = get_occupation_required_skills(
        occupation_id,
        district_id
    )

    required_skills = {}

    for skill_name, demand_score in demand_skills:

        if demand_score >= 75:
            required_score = 90

        elif demand_score >= 60:
            required_score = 70

        else:
            required_score = 40

        required_skills[skill_name] = required_score

    return required_skills

def get_training_program(training_program_id):
    """
    Fetch training program information.
    """

    conn = get_connection()
    cursor = conn.cursor()

    query = """
        SELECT
            tp.id,
            tp.name,
            tp.duration_weeks,
            tp.primary_skill_id,
            s.name AS primary_skill
        FROM training_programs tp
        LEFT JOIN skills s
            ON tp.primary_skill_id = s.id
        WHERE tp.id = %s;
    """

    cursor.execute(query, (training_program_id,))
    training_program = cursor.fetchone()

    cursor.close()
    conn.close()

    return training_program

def get_open_job_for_occupation(occupation_id):
    """Return one real open job for an occupation, if available."""
    conn = get_connection(); cursor = conn.cursor()
    cursor.execute("""
        SELECT id, employer_id, occupation_id, district_id, title, status, created_at
        FROM jobs
        WHERE occupation_id = %s AND status = 'open'
        ORDER BY created_at DESC, id DESC
        LIMIT 1;
    """, (occupation_id,))
    row = cursor.fetchone(); cursor.close(); conn.close()
    return row


def get_occupation(occupation_id):
    conn = get_connection(); cursor = conn.cursor()
    cursor.execute("SELECT id, name, category FROM occupations WHERE id = %s;", (occupation_id,))
    row = cursor.fetchone(); cursor.close(); conn.close()
    return row


def get_employment_features(trainee_id):
    """Return features for the latest employment record, or None."""
    from datetime import date
    conn = get_connection(); cursor = conn.cursor()
    cursor.execute("""
        SELECT e.salary, e.start_date, e.end_date,
               COUNT(DISTINCT ts.skill_id) AS trainee_skill_count,
               CASE WHEN t.training_program_id IS NOT NULL THEN 1 ELSE 0 END AS has_training
        FROM employment e
        JOIN trainees t ON e.trainee_id = t.id
        LEFT JOIN trainee_skills ts ON t.id = ts.trainee_id
        WHERE e.trainee_id = %s
        GROUP BY e.id, e.salary, e.start_date, e.end_date, t.training_program_id
        ORDER BY e.start_date DESC, e.id DESC
        LIMIT 1;
    """, (trainee_id,))
    row = cursor.fetchone(); cursor.close(); conn.close()
    if row is None:
        return None
    salary, start_date, end_date, skill_count, has_training = row
    reference = end_date or date.today()
    months = max((reference - start_date).days / 30.44, 0)
    return [float(salary or 0), float(months), float(skill_count), float(has_training)]
