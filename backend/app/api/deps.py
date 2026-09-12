"""Shared request dependencies: who is calling, and what are they allowed to see.

Auth is optional by design. All three panels are demoed without a working
login screen, so when no bearer token is sent the API falls back to a demo
identity (settings.ALLOW_DEMO_IDENTITY). Turn that off in .env and every
scoped endpoint requires a real token.
"""

from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.employers import Employer
from app.models.government_users import GovernmentUser
from app.models.trainees import Trainee
from app.models.users import User


def _token_from_header(authorization: str | None) -> str | None:
    if not authorization:
        return None
    parts = authorization.split()
    if len(parts) == 2 and parts[0].lower() == "bearer":
        return parts[1]
    return None


def get_current_user_optional(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> User | None:
    token = _token_from_header(authorization)
    if not token:
        return None
    payload = decode_access_token(token)
    if not payload:
        return None
    user_id = payload.get("sub")
    if user_id is None:
        return None
    try:
        user_id = int(user_id)
    except (TypeError, ValueError):
        return None
    return db.query(User).filter(User.id == user_id).first()


def get_current_user(
    user: User | None = Depends(get_current_user_optional),
) -> User:
    if user is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user


def _default_employer(db: Session) -> Employer | None:
    """The demo employer: the one with the most job postings, so the panel
    opens on an account that actually has data behind it."""
    if settings.DEMO_EMPLOYER_ID:
        return db.query(Employer).filter(Employer.id == settings.DEMO_EMPLOYER_ID).first()

    from sqlalchemy import func

    from app.models.jobs import Job

    row = (
        db.query(Job.employer_id, func.count(Job.id).label("n"))
        .group_by(Job.employer_id)
        .order_by(func.count(Job.id).desc())
        .first()
    )
    if row:
        return db.query(Employer).filter(Employer.id == row[0]).first()
    return db.query(Employer).order_by(Employer.id).first()


def _default_trainee(db: Session) -> Trainee | None:
    if settings.DEMO_TRAINEE_ID:
        return db.query(Trainee).filter(Trainee.id == settings.DEMO_TRAINEE_ID).first()
    return db.query(Trainee).order_by(Trainee.id).first()


def get_current_employer(
    user: User | None = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
) -> Employer:
    if user is not None:
        employer = db.query(Employer).filter(Employer.user_id == user.id).first()
        if employer:
            return employer
        if user.role != "employer" and not settings.ALLOW_DEMO_IDENTITY:
            raise HTTPException(status_code=403, detail="Not an employer account")

    if not settings.ALLOW_DEMO_IDENTITY:
        raise HTTPException(status_code=401, detail="Not authenticated")

    employer = _default_employer(db)
    if employer is None:
        raise HTTPException(status_code=404, detail="No employer records in the database")
    return employer


def get_current_trainee(
    user: User | None = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
) -> Trainee:
    if user is not None:
        trainee = db.query(Trainee).filter(Trainee.user_id == user.id).first()
        if trainee:
            return trainee
        if user.role != "trainee" and not settings.ALLOW_DEMO_IDENTITY:
            raise HTTPException(status_code=403, detail="Not a trainee account")

    if not settings.ALLOW_DEMO_IDENTITY:
        raise HTTPException(status_code=401, detail="Not authenticated")

    trainee = _default_trainee(db)
    if trainee is None:
        raise HTTPException(status_code=404, detail="No trainee records in the database")
    return trainee


def get_current_government(
    user: User | None = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
) -> User | None:
    """Guard for the Government Portal.

    With ALLOW_DEMO_IDENTITY on, this lets anyone through — that is what makes
    the portal openable without a login during a demo. Turn it off and a
    government-role token is required, which is what you want anywhere real.
    """
    if user is not None:
        if user.role in ("government", "gov", "government_user"):
            return user
        if db.query(GovernmentUser).filter(GovernmentUser.user_id == user.id).first():
            return user
        if not settings.ALLOW_DEMO_IDENTITY:
            raise HTTPException(
                status_code=403, detail="This portal is restricted to government accounts"
            )
        return user

    if not settings.ALLOW_DEMO_IDENTITY:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return None
