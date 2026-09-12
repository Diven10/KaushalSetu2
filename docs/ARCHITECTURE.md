# KaushalSetu System Architecture

## Overview

KaushalSetu is a government skilling intelligence platform designed to
connect training, skills, assessments, jobs, applications, employment,
retention and labour-market demand.

Core concept:

> Track the Career. Predict the Outcome. Simulate the Future.

## High-Level Architecture

The system consists of:

1. Frontend
2. Backend API
3. PostgreSQL Database
4. AI/ML Intelligence Layer

### Frontend

Responsible for:

- User interface
- Dashboards
- Trainee career view
- Government analytics
- Job and skill information
- Career Digital Twin visualization

### Backend

Responsible for:

- Authentication
- API endpoints
- Database access
- Business logic
- Analytics services
- Communication with the ML layer

### PostgreSQL

Stores:

- Users
- Trainees
- Skills
- Training
- Assessments
- Jobs
- Applications
- Employment
- Retention
- Skill demand

### AI/ML Layer

Responsible for intelligence features such as:

- Career outcome prediction
- Skill-gap analysis
- Career recommendations
- Job matching
- Labour-market intelligence
- Career simulation

## Data Flow

Trainee/User
↓
Frontend
↓
Backend API
↓
PostgreSQL
↓
Analytics / ML
↓
Prediction / Recommendation
↓
Backend API
↓
Frontend

## Career Pipeline

Training
↓
Skills
↓
Assessment
↓
Job Matching
↓
Applications
↓
Employment
↓
Retention
↓
Career Outcome

## Government Intelligence

The platform aggregates:

- District-level skill information
- Occupation information
- Job demand
- Skill demand
- Training outcomes
- Employment outcomes

This allows government users to analyze skilling outcomes
and labour-market requirements.

## Current Status

Phase 1: Complete

Phase 2A–2G: Complete and locked

Phase 3: Backend/API and intelligence integration
