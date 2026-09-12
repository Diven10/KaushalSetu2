"""Authentication: login, current user, registration.

The panels can run without logging in (see app/api/deps.py and
ALLOW_DEMO_IDENTITY), but when a token IS supplied every scoped endpoint uses
the real account behind it.
"""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.security import create_access_token, hash_password, verify_password
from app.api.deps import get_current_user
from app.models.employers import Employer
from app.models.government_users import GovernmentUser
from app.models.trainees import Trainee
from app.models.users import User

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    email: str
    password: str
    role: str = "trainee"
    full_name: str | None = None
    company_name: str | None = None
    district_id: int | None = None


def _profile_for(user: User, db: Session) -> dict:
    if user.role == "trainee":
        t = db.query(Trainee).filter(Trainee.user_id == user.id).first()
        if t:
            return {"trainee_id": t.id, "name": t.full_name, "district_id": t.district_id}
    if user.role == "employer":
        e = db.query(Employer).filter(Employer.user_id == user.id).first()
        if e:
            return {
                "employer_id": e.id,
                "name": e.company_name,
                "district_id": e.district_id,
            }
    if user.role in ("government", "gov", "government_user"):
        g = db.query(GovernmentUser).filter(GovernmentUser.user_id == user.id).first()
        if g:
            return {"government_user_id": g.id, "department": g.department}
    return {}


def _user_payload(user: User, db: Session) -> dict:
    profile = _profile_for(user, db)
    return {
        "id": user.id,
        "email": user.email,
        "role": user.role,
        "name": profile.get("name") or user.email.split("@")[0],
        **profile,
    }


@router.post("/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    token = create_access_token(subject=user.id, role=user.role)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": _user_payload(user, db),
    }


@router.get("/me")
def me(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return _user_payload(user, db)


@router.post("/register", status_code=201)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    if payload.role not in ("trainee", "employer", "government"):
        raise HTTPException(status_code=400, detail="role must be trainee, employer or government")

    if payload.role not in settings.SELF_REGISTER_ROLES:
        raise HTTPException(
            status_code=403,
            detail="Self-registration is not open for the {} role".format(payload.role),
        )

    if len(payload.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=409, detail="Email already registered")

    user = User(
        email=payload.email,
        password_hash=hash_password(payload.password),
        role=payload.role,
        created_at=datetime.now(timezone.utc).replace(tzinfo=None),
    )
    db.add(user)
    db.flush()

    if payload.role == "trainee":
        db.add(
            Trainee(
                user_id=user.id,
                full_name=payload.full_name or payload.email.split("@")[0],
                district_id=payload.district_id,
            )
        )
    elif payload.role == "employer":
        db.add(
            Employer(
                user_id=user.id,
                company_name=payload.company_name or payload.email.split("@")[0],
                district_id=payload.district_id,
            )
        )
    else:
        db.add(GovernmentUser(user_id=user.id, department=payload.company_name))

    db.commit()
    db.refresh(user)

    token = create_access_token(subject=user.id, role=user.role)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": _user_payload(user, db),
    }
