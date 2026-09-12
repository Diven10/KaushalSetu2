# KaushalSetu API Contract

## Base URL

Development:

`http://localhost:8000`

API prefix:

`/api`

## Authentication

Authentication endpoints will provide:

- Login
- User identity
- Role-based access

Supported conceptual roles:

- trainee
- employer
- government

## Trainee APIs

### GET /api/trainees/{trainee_id}

Returns trainee profile information.

### GET /api/trainees/{trainee_id}/skills

Returns trainee skills.

### GET /api/trainees/{trainee_id}/assessments

Returns trainee assessment history.

### GET /api/trainees/{trainee_id}/applications

Returns trainee job applications.

### GET /api/trainees/{trainee_id}/employment

Returns employment information.

## Job APIs

### GET /api/jobs

Returns available jobs.

### GET /api/jobs/{job_id}

Returns job details.

### GET /api/jobs/{job_id}/skills

Returns skills required for a job.

## Skill APIs

### GET /api/skills

Returns available skills.

### GET /api/skills/{skill_id}

Returns skill information.

## District APIs

### GET /api/districts

Returns Maharashtra districts.

### GET /api/districts/{district_id}

Returns district information.

## Government Analytics APIs

### GET /api/analytics/overview

Returns overall platform statistics.

### GET /api/analytics/districts

Returns district-level analytics.

### GET /api/analytics/skills

Returns skill-demand analytics.

### GET /api/analytics/occupations

Returns occupation-level analytics.

## ML APIs

### POST /api/ml/career-prediction

Generates a career outcome prediction.

### POST /api/ml/skill-gap

Calculates skill gaps.

### POST /api/ml/job-match

Generates job matching results.

## Response Format

Successful responses should use JSON.

Example:

{
"success": true,
"data": {}
}Get-Item "C:\Program Files\PostgreSQL\18\data\pg_hba.conf.backup"

Error responses should use:

{
"success": false,
"error": {
"code": "ERROR_CODE",
"message": "Human-readable message"
}
}

## Important

The API implementation must use the existing PostgreSQL schema.

The database schema must not be changed merely to satisfy
frontend requirements. API logic should adapt to the existing
validated database.
