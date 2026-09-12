-- OPTIONAL — not applied automatically, and not needed to run the platform.
--
-- The Test & PS module and DigiLocker verification currently live in process
-- memory (backend/app/services/demo_store.py), because Phase 2 is signed off
-- and adding tables to it is a schema change that needs your approval first.
--
-- If you decide to make them persistent, this is the DDL. Apply it yourself,
-- then swap demo_store's functions for real queries — nothing else changes,
-- since every router already goes through that one module.
--
--   psql -U postgres -d skillgrow -f database/migrations/001_assessments_and_verification.sql

BEGIN;

CREATE TABLE IF NOT EXISTS employer_assessments (
    id                SERIAL PRIMARY KEY,
    employer_id       INTEGER NOT NULL REFERENCES employers(id),
    job_id            INTEGER NOT NULL REFERENCES jobs(id),
    title             VARCHAR(200) NOT NULL,
    type              VARCHAR(10)  NOT NULL CHECK (type IN ('test', 'ps')),
    skills_tested     INTEGER[],
    brief             TEXT,
    questions         JSONB,
    pass_threshold    NUMERIC(5, 2),
    duration_minutes  INTEGER,
    due_date          DATE,
    created_at        TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_employer_assessments_employer
    ON employer_assessments (employer_id);
CREATE INDEX IF NOT EXISTS idx_employer_assessments_job
    ON employer_assessments (job_id);

CREATE TABLE IF NOT EXISTS assessment_submissions (
    id               SERIAL PRIMARY KEY,
    assessment_id    INTEGER NOT NULL REFERENCES employer_assessments(id),
    application_id   INTEGER NOT NULL REFERENCES applications(id),
    trainee_id       INTEGER NOT NULL REFERENCES trainees(id),
    status           VARCHAR(20) NOT NULL DEFAULT 'assigned'
                     CHECK (status IN ('assigned', 'submitted', 'evaluated', 'rejected')),
    score            NUMERIC(5, 2),
    answers          JSONB,
    submission_text  TEXT,
    feedback         TEXT,
    assigned_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    submitted_at     TIMESTAMP,
    reviewed_at      TIMESTAMP,
    UNIQUE (assessment_id, application_id)
);

CREATE INDEX IF NOT EXISTS idx_assessment_submissions_trainee
    ON assessment_submissions (trainee_id);

-- One row per verified party. `subject_type` keeps trainees and employers in
-- one table rather than two near-identical ones.
CREATE TABLE IF NOT EXISTS document_verifications (
    id            SERIAL PRIMARY KEY,
    subject_type  VARCHAR(10) NOT NULL CHECK (subject_type IN ('trainee', 'employer')),
    subject_id    INTEGER NOT NULL,
    status        VARCHAR(20) NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'verified', 'rejected')),
    method        VARCHAR(60),
    documents     JSONB,
    verified_at   TIMESTAMP,
    UNIQUE (subject_type, subject_id)
);

COMMIT;
