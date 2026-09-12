# KaushalSetu Database Schema

## Overview

KaushalSetu uses a PostgreSQL relational database to support the complete
skilling-to-employment pipeline.

The database contains 17 relational tables covering:

- Reference data
- Identity and authentication
- Training
- Assessments
- Jobs
- Applications
- Employment and retention
- Labour-market skill demand

## Reference Tables

### districts

Stores Maharashtra district information.

### skills

Stores the platform's skill master data.

### occupations

Stores occupation master data.

## Identity and Authentication

### users

Base user/account table.

### trainees

Stores trainee-specific information.

### employers

Stores employer-specific information.

### government_users

Stores government-user information.

## Training

### training_providers

Stores training provider information.

### training_programs

Stores available training programs.

## Assessment

### trainee_skills

Maps trainees to their acquired skills.

### assessments

Stores trainee assessment results.

## Jobs

### jobs

Stores job postings.

### job_skills

Maps jobs to required skills.

### applications

Stores trainee applications to jobs.

## Employment

### employment

Stores employment records.

### employment_followups

Stores post-employment follow-up information.

## Labour Market Intelligence

### skill_demand

Stores skill-demand information across districts,
occupations and skills.

## Relationships

The database uses foreign-key constraints to maintain referential integrity.

Major relationships include:

- trainees → users
- trainees → districts
- trainees → training_programs
- trainee_skills → trainees
- trainee_skills → skills
- assessments → trainees
- assessments → skills
- assessments → training_programs
- employers → users
- employers → districts
- jobs → employers
- jobs → districts
- jobs → occupations
- job_skills → jobs
- job_skills → skills
- applications → trainees
- applications → jobs
- employment → trainees
- employment → employers
- employment → occupations
- employment → districts
- employment_followups → employment
- skill_demand → districts
- skill_demand → occupations
- skill_demand → skills

## Dataset

Current validated synthetic dataset:

| Entity                |  Count |
| --------------------- | -----: |
| Users                 | 10,500 |
| Trainees              | 10,000 |
| Skills                |     65 |
| Occupations           |     35 |
| Districts             |     36 |
| Training Providers    |     41 |
| Training Programs     |    100 |
| Employers             |    500 |
| Trainee Skills        | 54,928 |
| Assessments           |  8,513 |
| Jobs                  |  4,000 |
| Job Skills            |  9,975 |
| Applications          | 20,927 |
| Employment            |  1,464 |
| Employment Follow-ups |    726 |
| Skill Demand          | 21,978 |
| Government Users      |      0 |

## Validation

Phase 2G performed read-only integrity validation.

Result:

- 19 hard validation categories/checks
- 0 failures
- 0 orphan records
- 0 role mismatches
- 0 duplicate logical relationships
- 0 invalid operational dates
- 0 invalid scores/statuses/salary values
