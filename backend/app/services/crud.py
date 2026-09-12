from sqlalchemy.orm import Session

def list_records(db: Session, model, skip: int = 0, limit: int = 100):
    return db.query(model).offset(skip).limit(min(limit, 500)).all()

def get_record(db: Session, model, record_id: int):
    return db.query(model).filter(model.id == record_id).first()
