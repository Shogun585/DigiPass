from fastapi import APIRouter,Depends,status, HTTPException
from sqlalchemy.orm import Session
from ..utils import database, hash, models,schemas

router= APIRouter(prefix="/user", tags=["User"])

@router.post("/", response_model=schemas.User)
def create(request: schemas.UserCreate, db:Session= Depends(database.get_db)):
    # checking if a user already exists with same id
    user=db.query(models.Users).filter(models.Users.id==request.id).first()
    if user:
        raise HTTPException(status_code= status.HTTP_409_CONFLICT, detail= f"User with {request.id} already present")
    new_user= models.Users(id=request.id, password=hash.Hashing.encrypt(request.password), first_name=request.first_name, last_name=request.last_name, role=request.role.value, contact_details=request.contact_details)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user